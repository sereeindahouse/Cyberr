import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// No MONGODB_URI in this environment → the router uses the in-memory
// fallback, which makes the sync semantics testable without a cluster.
function createAnonContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

function makeReport(
  overrides: Partial<{
    id: number;
    title: string;
    tags: string[];
    content: string;
    updatedAt: string;
  }> = {}
) {
  return {
    id: overrides.id ?? 1,
    title: overrides.title ?? "Report",
    room: "Room",
    source: "THM" as const,
    stage: "Foundations",
    tags: overrides.tags ?? ["a"],
    status: "Draft" as const,
    readTime: "1 min",
    date: "Sep 14, 2026",
    excerpt: "e",
    content: overrides.content ?? "c",
    ...(overrides.updatedAt ? { updatedAt: overrides.updatedAt } : {}),
  };
}

describe("reports.sync (workspace mirror)", () => {
  it("upserts, deletes missing reports, and rebuilds tags", async () => {
    const workspaceKey = `sync-test-${Date.now()}`;
    const caller = appRouter.createCaller(createAnonContext());

    // First sync: two reports, tags a + b.
    const first = await caller.reports.sync({
      workspaceKey,
      reports: [
        makeReport({ id: 1, tags: ["a"] }),
        makeReport({ id: 2, tags: ["b"] }),
      ],
    });
    expect(first.persisted).toBe(true);
    expect(first.count).toBe(2);
    expect(first.reports.map(r => r.id).sort()).toEqual([1, 2]);
    expect(await caller.reports.tags({ workspaceKey })).toEqual(["a", "b"]);

    // Second sync (legacy client, no seenIds → full-mirror delete):
    // report 1 disappears, report 2 loses tag b, gains c. The old
    // upsert-only flow would have kept report 1 and tag b forever.
    const second = await caller.reports.sync({
      workspaceKey,
      reports: [makeReport({ id: 2, title: "Renamed", tags: ["c"] })],
    });
    expect(second.count).toBe(1);
    expect(second.reports[0]).toMatchObject({ id: 2, title: "Renamed" });

    const rows = await caller.reports.list({ workspaceKey });
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ id: 2, title: "Renamed" });
    expect(await caller.reports.tags({ workspaceKey })).toEqual(["c"]);
  });

  it("does not leak mongo internals (but does share updatedAt — sync needs it)", async () => {
    const workspaceKey = `sync-leak-${Date.now()}`;
    const caller = appRouter.createCaller(createAnonContext());
    await caller.reports.sync({ workspaceKey, reports: [makeReport()] });
    const rows = await caller.reports.list({ workspaceKey });
    expect(rows[0]).not.toHaveProperty("_id");
    expect(rows[0]).not.toHaveProperty("workspaceKey");
    // Per-report last-write-wins across devices requires the client to know
    // the server's timestamps, so `updatedAt` is intentionally public.
    expect(new Date(rows[0].updatedAt).getTime()).not.toBeNaN();
  });

  it("reports the active storage backend", async () => {
    const caller = appRouter.createCaller(createAnonContext());
    const status = await caller.reports.status();
    expect(status.backend).toBe(process.env.MONGODB_URI ? "mongodb" : "memory");
  });
});

describe("reports.sync (multi-device conflict handling)", () => {
  const T1 = "2026-09-16T01:00:00.000Z";
  const T2 = "2026-09-16T02:00:00.000Z";

  it("keeps the newer server copy when a stale client syncs (per-report merge)", async () => {
    const workspaceKey = `conflict-${Date.now()}`;
    const caller = appRouter.createCaller(createAnonContext());

    // Device A edits the report: v1@T1, then v2@T2.
    await caller.reports.sync({
      workspaceKey,
      reports: [makeReport({ id: 1, content: "v1", updatedAt: T1 })],
      seenIds: [1],
    });
    await caller.reports.sync({
      workspaceKey,
      reports: [makeReport({ id: 1, content: "v2", updatedAt: T2 })],
      seenIds: [1],
    });

    // Device B still holds the old copy v1@T1 and syncs it. Whole-workspace
    // last-write-wins would have destroyed v2; per-report merge keeps it.
    const result = await caller.reports.sync({
      workspaceKey,
      reports: [makeReport({ id: 1, content: "v1", updatedAt: T1 })],
      seenIds: [1],
    });
    expect(result.reports).toHaveLength(1);
    expect(result.reports[0].content).toBe("v2");
    expect(result.reports[0].updatedAt).toBe(T2);
    expect(await caller.reports.list({ workspaceKey })).toEqual([
      expect.objectContaining({ id: 1, content: "v2" }),
    ]);
  });

  it("keeps reports a new device has never seen, and deletes known ones (tombstones)", async () => {
    const workspaceKey = `tombstone-${Date.now()}`;
    const caller = appRouter.createCaller(createAnonContext());

    // Device A owns report 1.
    await caller.reports.sync({
      workspaceKey,
      reports: [makeReport({ id: 1, content: "A's work", updatedAt: T1 })],
      seenIds: [1],
    });

    // Device B is fresh (just adopted the key): it only knows its own new
    // report 2 and has an EMPTY seenIds — the old mirror logic would have
    // deleted report 1 on this first sync.
    const fresh = await caller.reports.sync({
      workspaceKey,
      reports: [makeReport({ id: 2, content: "B's work", updatedAt: T2 })],
      seenIds: [],
    });
    expect(fresh.count).toBe(2);
    expect(fresh.reports.map(r => r.id).sort()).toEqual([1, 2]);

    // Now B knows about report 1 (it arrived in the response) and deletes
    // it locally: B's seenIds includes 1 but its list no longer does.
    const afterDelete = await caller.reports.sync({
      workspaceKey,
      reports: [makeReport({ id: 2, content: "B's work", updatedAt: T2 })],
      seenIds: [1, 2],
    });
    expect(afterDelete.count).toBe(1);
    expect(afterDelete.reports.map(r => r.id)).toEqual([2]);
    expect(await caller.reports.list({ workspaceKey })).toHaveLength(1);
  });

  it("rebuilds the tag index from the final state (server-kept copies included)", async () => {
    const workspaceKey = `tags-merge-${Date.now()}`;
    const caller = appRouter.createCaller(createAnonContext());

    await caller.reports.sync({
      workspaceKey,
      reports: [makeReport({ id: 1, tags: ["alpha"], updatedAt: T2 })],
      seenIds: [1],
    });
    // Stale client sends the report WITHOUT tag alpha (its older copy had a
    // different tag) — the server keeps its own copy, so alpha must survive.
    await caller.reports.sync({
      workspaceKey,
      reports: [makeReport({ id: 1, tags: ["beta"], updatedAt: T1 })],
      seenIds: [1],
    });
    expect(await caller.reports.tags({ workspaceKey })).toEqual(["alpha"]);
  });

  it("treats a missing client timestamp as 'changed now' (legacy clients)", async () => {
    const workspaceKey = `legacy-ts-${Date.now()}`;
    const caller = appRouter.createCaller(createAnonContext());

    await caller.reports.sync({
      workspaceKey,
      reports: [makeReport({ id: 1, content: "old", updatedAt: T1 })],
    });
    // No updatedAt in the payload → assumed fresh → overwrites the older copy.
    const result = await caller.reports.sync({
      workspaceKey,
      reports: [makeReport({ id: 1, content: "new" })],
    });
    expect(result.reports[0].content).toBe("new");
  });

  it("ignores invalid client timestamps instead of crashing", async () => {
    const workspaceKey = `bad-ts-${Date.now()}`;
    const caller = appRouter.createCaller(createAnonContext());
    const result = await caller.reports.sync({
      workspaceKey,
      reports: [makeReport({ id: 1, content: "c", updatedAt: "not-a-date" })],
      seenIds: [1],
    });
    expect(result.reports[0].content).toBe("c");
  });
});

describe("report input caps (abuse protection)", () => {
  it("rejects oversized content", async () => {
    const workspaceKey = `caps-${Date.now()}`;
    const caller = appRouter.createCaller(createAnonContext());
    await expect(
      caller.reports.sync({
        workspaceKey,
        reports: [makeReport({ content: "x".repeat(300_001) })],
      })
    ).rejects.toThrow();
  });

  it("rejects oversized titles", async () => {
    const workspaceKey = `caps2-${Date.now()}`;
    const caller = appRouter.createCaller(createAnonContext());
    await expect(
      caller.reports.sync({
        workspaceKey,
        reports: [makeReport({ title: "x".repeat(201) })],
      })
    ).rejects.toThrow();
  });

  it("rejects oversized batches", async () => {
    const workspaceKey = `caps3-${Date.now()}`;
    const caller = appRouter.createCaller(createAnonContext());
    const batch = Array.from({ length: 501 }, (_, i) =>
      makeReport({ id: i + 1 })
    );
    await expect(
      caller.reports.sync({ workspaceKey, reports: batch })
    ).rejects.toThrow();
  });
});
