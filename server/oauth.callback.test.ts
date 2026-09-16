import { afterAll, beforeAll, describe, expect, it } from "vitest";
import express from "express";
import type { Server } from "http";
import { OAUTH_STATE_COOKIE } from "../shared/const";
import { registerOAuthRoutes } from "./_core/oauth";

let server: Server;
let base: string;

beforeAll(async () => {
  const app = express();
  app.use(express.json({ limit: "8mb" }));
  registerOAuthRoutes(app);
  await new Promise<void>((resolve) => {
    server = app.listen(0, () => resolve());
  });
  const addr = server.address();
  const port = typeof addr === "object" && addr ? addr.port : 0;
  base = `http://127.0.0.1:${port}`;
});

afterAll(async () => {
  await new Promise<void>((resolve) => server.close(() => resolve()));
});

const stateWith = (nonce: string) =>
  Buffer.from(JSON.stringify({ redirectUri: "http://localhost/api/oauth/callback", nonce })).toString("base64");

describe("OAuth callback CSRF guard", () => {
  it("rejects a state whose nonce has no matching cookie (403)", async () => {
    const state = stateWith("nonce-123");
    const res = await fetch(`${base}/api/oauth/callback?code=c&state=${encodeURIComponent(state)}`);
    expect(res.status).toBe(403);
  });

  it("rejects a forged state that does not match the stored cookie (403)", async () => {
    const res = await fetch(
      `${base}/api/oauth/callback?code=c&state=${encodeURIComponent(stateWith("attacker"))}`,
      { headers: { Cookie: `${OAUTH_STATE_COOKIE}=victim-nonce` } }
    );
    expect(res.status).toBe(403);
  });

  it("accepts a state matching the cookie (passes CSRF; fails later on unconfigured auth → 500, not 403)", async () => {
    const res = await fetch(
      `${base}/api/oauth/callback?code=c&state=${encodeURIComponent(stateWith("ok"))}`,
      { headers: { Cookie: `${OAUTH_STATE_COOKIE}=ok` } }
    );
    expect(res.status).not.toBe(403);
  });
});
