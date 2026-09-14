import "dotenv/config";
import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createContext(): TrpcContext {
  return {
    user: undefined,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("reports persistence", () => {
  it("upserts and lists a report in MongoDB", async () => {
    const workspaceKey = `test-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const report = {
      id: Date.now(),
      title: "MongoDB persistence probe",
      room: "Integration test",
      source: "Cloud" as const,
      stage: "Deployment",
      tags: ["mongodb", "persistence"],
      status: "Draft" as const,
      readTime: "—",
      date: "Sep 14, 2026",
      excerpt: "A persistence round-trip probe.",
      content: "## Root cause\n\nThe data survived the API boundary.",
    };

    const caller = appRouter.createCaller(createContext());
    const saved = await caller.reports.upsert({ workspaceKey, report });
    expect(saved.persisted).toBe(true);

    const rows = await caller.reports.list({ workspaceKey });
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ title: report.title, tags: report.tags, source: report.source });
  }, 20000);
});
