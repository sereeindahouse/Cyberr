import express from "express";
import { describe, expect, it } from "vitest";
import { createLimiter } from "./rateLimit";

/**
 * The limiters are mounted in `index.ts` on the real express app with
 * `app.set("trust proxy", 1)`; here we reproduce that wiring around a small
 * limit so the test finishes in milliseconds, and isolate bursts with
 * X-Forwarded-For (one trusted hop → the first XFF entry is the client IP).
 */
async function withApp<T>(
  build: (app: express.Express) => void,
  run: (base: string) => Promise<T>
): Promise<T> {
  const app = express();
  app.set("trust proxy", 1);
  build(app);
  const server = app.listen(0);
  await new Promise<void>(resolve => server.once("listening", () => resolve()));
  const { port } = server.address() as { port: number };
  try {
    return await run(`http://127.0.0.1:${port}`);
  } finally {
    server.close();
  }
}

describe("API rate limiting (AUDIT.md §5.4)", () => {
  it("allows `limit` requests per IP and 429s the next one", async () => {
    await withApp(
      app => {
        const limiter = createLimiter({ windowMs: 60_000, limit: 3 });
        app.use("/api", limiter);
        app.get("/api/ping", (_req, res) => res.json({ ok: true }));
      },
      async base => {
        const url = `${base}/api/ping`;
        for (let i = 0; i < 3; i++) {
          const res = await fetch(url, {
            headers: { "x-forwarded-for": "10.9.0.1" },
          });
          expect(res.status).toBe(200);
        }
        const blocked = await fetch(url, {
          headers: { "x-forwarded-for": "10.9.0.1" },
        });
        expect(blocked.status).toBe(429);
        const body = (await blocked.json()) as { error?: string };
        expect(body.error).toMatch(/Too many requests/);
        // draft-7 standard headers: combined `RateLimit` + `RateLimit-Policy`.
        expect(blocked.headers.get("ratelimit")).toMatch(/limit=3/);
        expect(blocked.headers.get("ratelimit-policy")).toBe("3;w=60");
      }
    );
  });

  it("is per-IP: a different client still has budget", async () => {
    await withApp(
      app => {
        const limiter = createLimiter({ windowMs: 60_000, limit: 1 });
        app.use("/api", limiter);
        app.get("/api/ping", (_req, res) => res.json({ ok: true }));
      },
      async base => {
        const url = `${base}/api/ping`;
        expect(
          (await fetch(url, { headers: { "x-forwarded-for": "10.9.0.1" } }))
            .status
        ).toBe(200);
        expect(
          (await fetch(url, { headers: { "x-forwarded-for": "10.9.0.1" } }))
            .status
        ).toBe(429);
        expect(
          (await fetch(url, { headers: { "x-forwarded-for": "10.9.0.2" } }))
            .status
        ).toBe(200);
      }
    );
  });

  it("resets after the window expires", async () => {
    await withApp(
      app => {
        const limiter = createLimiter({ windowMs: 30, limit: 1 });
        app.use("/api", limiter);
        app.get("/api/ping", (_req, res) => res.json({ ok: true }));
      },
      async base => {
        const url = `${base}/api/ping`;
        expect(
          (await fetch(url, { headers: { "x-forwarded-for": "10.9.0.3" } }))
            .status
        ).toBe(200);
        expect(
          (await fetch(url, { headers: { "x-forwarded-for": "10.9.0.3" } }))
            .status
        ).toBe(429);
        await new Promise(resolve => setTimeout(resolve, 60));
        expect(
          (await fetch(url, { headers: { "x-forwarded-for": "10.9.0.3" } }))
            .status
        ).toBe(200);
      }
    );
  });
});
