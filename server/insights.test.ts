import { describe, expect, it, beforeEach } from "vitest";
import {
  reportHash,
  localInsight,
  buildLocalRelations,
  getInsights,
  relatedReports,
  clearInsightsCache,
  type InsightsResult,
} from "./insights";
import { getMongoDb } from "./mongodb";

function makeReport(overrides: Partial<any> = {}) {
  return {
    id: overrides.id ?? 1,
    title: overrides.title ?? "Test Report",
    content: overrides.content ?? "This is about linux and sudo and s3 bucket enumeration.",
    tags: overrides.tags ?? ["linux", "suid"],
    source: overrides.source ?? "THM",
    stage: overrides.stage ?? "Foundations",
    updatedAt: overrides.updatedAt ?? new Date("2026-09-14T00:00:00Z"),
  };
}

describe("reportHash", () => {
  it("is stable for same content", () => {
    const r = makeReport();
    expect(reportHash(r)).toBe(reportHash(r));
  });

  it("changes when content changes", () => {
    const a = makeReport({ content: "hello world linux" });
    const b = makeReport({ content: "different content" });
    expect(reportHash(a)).not.toBe(reportHash(b));
  });

  it("changes when tags change", () => {
    const a = makeReport({ tags: ["a"] });
    const b = makeReport({ tags: ["b"] });
    expect(reportHash(a)).not.toBe(reportHash(b));
  });

  it("changes when title changes", () => {
    const a = makeReport({ title: "Alpha" });
    const b = makeReport({ title: "Beta" });
    expect(reportHash(a)).not.toBe(reportHash(b));
  });

  it("handles Date vs string updatedAt", () => {
    const a = makeReport({ updatedAt: new Date("2026-09-14T00:00:00Z") });
    const b = makeReport({ updatedAt: "2026-09-14T00:00:00.000Z" });
    expect(reportHash(a)).toBe(reportHash(b));
  });
});

describe("localInsight", () => {
  it("produces summary, concepts, steps", () => {
    const r = makeReport({
      content: "# Title\n\n## Enumeration\n\nRun nmap and check sudo.\n\n1. Scan ports\n2. Enumerate services\n",
    });
    const ins = localInsight(r);
    expect(ins.summary.length).toBeGreaterThan(0);
    expect(ins.concepts.length).toBeGreaterThan(0);
    expect(ins.steps.length).toBeGreaterThan(0);
    expect(ins.provider).toBe("local");
  });

  it("does not throw on empty content", () => {
    const r = makeReport({ content: "" });
    const ins = localInsight(r);
    expect(ins.id).toBe(r.id);
    expect(ins.provider).toBe("local");
  });
});

describe("buildLocalRelations", () => {
  it("connects reports with shared tags", () => {
    const reports = [
      makeReport({ id: 1, tags: ["linux", "suid"] }),
      makeReport({ id: 2, tags: ["linux", "privesc"] }),
    ];
    const insights = reports.map(localInsight);
    const rels = buildLocalRelations(reports, insights);
    expect(rels.length).toBeGreaterThan(0);
    expect(rels[0].reason).toMatch(/нийтлэг/);
  });

  it("no relations when completely different", () => {
    const reports = [
      makeReport({ id: 1, tags: ["alpha"], content: "alpha only" }),
      makeReport({ id: 2, tags: ["beta"], content: "beta only" }),
    ];
    const insights = reports.map(localInsight);
    const rels = buildLocalRelations(reports, insights, { minWeight: 0.9 });
    expect(rels).toHaveLength(0);
  });

  it("relatedReports sorts by weight", () => {
    const result: InsightsResult = {
      snapshot: { provider: "local", analyzed: 2, total: 2, computedAt: new Date().toISOString() },
      insights: [],
      relations: [
        { source: 1, target: 2, weight: 0.3, reason: "low" },
        { source: 1, target: 3, weight: 0.9, reason: "high" },
      ],
    };
    const rel = relatedReports(result, 1, 2);
    expect(rel[0].id).toBe(3);
    expect(rel[0].weight).toBe(0.9);
  });
});

describe("getInsights pipeline", () => {
  const workspaceKey = "workspace-test-insights-123456";

  beforeEach(async () => {
    clearInsightsCache();
    const db = await getMongoDb();
    if (db) {
      await db.collection("reports").deleteMany({ workspaceKey });
    }
  });

  it("returns empty snapshot for empty workspace", async () => {
    const result = await getInsights(workspaceKey);
    expect(result.snapshot.total).toBe(0);
    expect(result.insights).toHaveLength(0);
  });

  it("caches results on second call", async () => {
    const db = await getMongoDb();
    if (!db) return;
    await db.collection("reports").deleteMany({ workspaceKey });
    await (db.collection("reports") as any).bulkWrite([
      {
        updateOne: {
          filter: { workspaceKey, id: 10 },
          update: {
            $set: {
              workspaceKey,
              id: 10,
              title: "Cache Test",
              content: "linux privesc notes",
              tags: ["linux"],
              source: "THM",
              stage: "Foundations",
              updatedAt: new Date(),
            },
          },
          upsert: true,
        },
      },
    ]);
    const first = await getInsights(workspaceKey);
    const second = await getInsights(workspaceKey);
    expect(first.snapshot.computedAt).toBe(second.snapshot.computedAt);
    expect(first.insights.length).toBe(1);
  });

  it("REGRESSION: concept updates after report edit", async () => {
    const db = await getMongoDb();
    if (!db) return;
    await db.collection("reports").deleteMany({ workspaceKey });
    // initial report
    await (db.collection("reports") as any).bulkWrite([
      {
        updateOne: {
          filter: { workspaceKey, id: 20 },
          update: {
            $set: {
              workspaceKey,
              id: 20,
              title: "Regression Test",
              content: "initial content about linux",
              tags: ["linux"],
              source: "THM",
              stage: "Foundations",
              updatedAt: new Date("2026-09-14T00:00:00Z"),
            },
          },
          upsert: true,
        },
      },
    ]);
    const first = await getInsights(workspaceKey);
    const firstConcepts = first.insights.find(i => i.id === 20)?.concepts ?? [];

    // edit report
    await (db.collection("reports") as any).bulkWrite([
      {
        updateOne: {
          filter: { workspaceKey, id: 20 },
          update: {
            $set: {
              workspaceKey,
              id: 20,
              title: "Regression Test",
              content: "edited content about aws iam policy and s3 bucket enumeration with completely different keywords",
              tags: ["aws", "iam"],
              source: "Cloud",
              stage: "Deployment",
              updatedAt: new Date("2026-09-15T00:00:00Z"),
            },
          },
          upsert: true,
        },
      },
    ]);
    const second = await getInsights(workspaceKey);
    const secondConcepts = second.insights.find(i => i.id === 20)?.concepts ?? [];

    // Concepts should have changed (not stuck with old cache)
    expect(firstConcepts.join(",")).not.toBe(secondConcepts.join(","));
  });
});
