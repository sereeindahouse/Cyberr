import { beforeAll, describe, expect, it } from "vitest";
import type { TrpcContext } from "./_core/context";
// Type-only import: does not execute the module, so ENV is still unset.
import type { AppRouter } from "./routers";

/**
 * Write-gate behavior depends on whether auth is configured, and ENV is
 * captured at module load — so set the variable before importing the router
 * (dynamic import; static value imports would hoist past this assignment).
 */
process.env.OAUTH_SERVER_URL = "http://auth.example.invalid";
delete process.env.MONGODB_URI;

let appRouter: AppRouter;

beforeAll(async () => {
  ({ appRouter } = await import("./routers"));
});

function ctxWith(user: TrpcContext["user"]): TrpcContext {
  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

const report = {
  id: 1,
  title: "T",
  room: "R",
  source: "THM" as const,
  stage: "Foundations",
  tags: ["a"],
  status: "Draft" as const,
  readTime: "1 min",
  date: "Sep 14, 2026",
  excerpt: "e",
  content: "c",
};

describe("write gate (auth configured)", () => {
  it("rejects anonymous writes with UNAUTHORIZED", async () => {
    const caller = appRouter.createCaller(ctxWith(null));
    await expect(
      caller.reports.sync({ workspaceKey: "gate-test-0123456789", reports: [report] })
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    await expect(
      caller.reports.upsert({ workspaceKey: "gate-test-0123456789", report })
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("allows writes for a signed-in user", async () => {
    const user = {
      id: 1,
      openId: "u1",
      email: null,
      name: "U",
      loginMethod: null,
      role: "user" as const,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    };
    const caller = appRouter.createCaller(ctxWith(user));
    const result = await caller.reports.sync({
      workspaceKey: "gate-test-0123456789",
      reports: [report],
    });
    expect(result.persisted).toBe(true);
  });

  it("keeps reads public", async () => {
    const caller = appRouter.createCaller(ctxWith(null));
    const rows = await caller.reports.list({ workspaceKey: "gate-test-0123456789" });
    expect(Array.isArray(rows)).toBe(true);
  });
});
