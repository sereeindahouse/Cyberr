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

function makeReport(overrides: Partial<{ id: number; title: string; tags: string[]; content: string }> = {}) {
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
  };
}

describe("reports.sync (workspace mirror)", () => {
  it("upserts, deletes missing reports, and rebuilds tags", async () => {
    const workspaceKey = `sync-test-${Date.now()}`;
    const caller = appRouter.createCaller(createAnonContext());

    // First sync: two reports, tags a + b.
    const first = await caller.reports.sync({
      workspaceKey,
      reports: [makeReport({ id: 1, tags: ["a"] }), makeReport({ id: 2, tags: ["b"] })],
    });
    expect(first).toEqual({ persisted: true, count: 2 });
    expect(await caller.reports.tags({ workspaceKey })).toEqual(["a", "b"]);

    // Second sync: report 1 disappears, report 2 loses tag b, gains c.
    // The old upsert-only flow would have kept report 1 and tag b forever.
    const second = await caller.reports.sync({
      workspaceKey,
      reports: [makeReport({ id: 2, title: "Renamed", tags: ["c"] })],
    });
    expect(second).toEqual({ persisted: true, count: 1 });

    const rows = await caller.reports.list({ workspaceKey });
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ id: 2, title: "Renamed" });
    expect(await caller.reports.tags({ workspaceKey })).toEqual(["c"]);
  });

  it("does not leak mongo internals", async () => {
    const workspaceKey = `sync-leak-${Date.now()}`;
    const caller = appRouter.createCaller(createAnonContext());
    await caller.reports.sync({ workspaceKey, reports: [makeReport()] });
    const rows = await caller.reports.list({ workspaceKey });
    expect(rows[0]).not.toHaveProperty("_id");
    expect(rows[0]).not.toHaveProperty("workspaceKey");
    expect(rows[0]).not.toHaveProperty("updatedAt");
  });

  it("reports the active storage backend", async () => {
    const caller = appRouter.createCaller(createAnonContext());
    const status = await caller.reports.status();
    expect(status.backend).toBe(process.env.MONGODB_URI ? "mongodb" : "memory");
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
    const batch = Array.from({ length: 501 }, (_, i) => makeReport({ id: i + 1 }));
    await expect(
      caller.reports.sync({ workspaceKey, reports: batch })
    ).rejects.toThrow();
  });
});
