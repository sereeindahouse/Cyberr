import { afterEach, describe, expect, it, vi } from "vitest";
import { groqChat } from "./groq";

const saved = {
  url: process.env.GROQ_API_URL,
  key: process.env.GROQ_API_KEY,
  key2: process.env.GROQ_API_KEY_2,
  model: process.env.GROQ_MODEL,
};

afterEach(() => {
  process.env.GROQ_API_URL = saved.url;
  process.env.GROQ_API_KEY = saved.key;
  process.env.GROQ_API_KEY_2 = saved.key2;
  process.env.GROQ_MODEL = saved.model;
  vi.unstubAllGlobals();
});

describe("groqChat key rotation", () => {
  it("tries the second key after the first key is rate-limited", async () => {
    process.env.GROQ_API_URL = "https://groq.example/v1";
    process.env.GROQ_API_KEY = "first-key";
    process.env.GROQ_API_KEY_2 = "second-key";
    const authHeaders: string[] = [];
    vi.stubGlobal("fetch", vi.fn(async (_url: string, init: RequestInit) => {
      const headers = init.headers as Record<string, string>;
      authHeaders.push(headers.authorization);
      if (authHeaders.length === 1) return new Response("quota", { status: 429 });
      return new Response(JSON.stringify({ choices: [{ message: { content: "second worked" } }] }), { status: 200 });
    }));

    await expect(groqChat([{ role: "user", content: "hello" }])).resolves.toBe("second worked");
    expect(authHeaders).toEqual(["Bearer first-key", "Bearer second-key"]);
  });

  it("reports failure only after every configured key fails", async () => {
    process.env.GROQ_API_URL = "https://groq.example/v1";
    process.env.GROQ_API_KEY = "first-key";
    process.env.GROQ_API_KEY_2 = "second-key";
    vi.stubGlobal("fetch", vi.fn(async () => new Response("down", { status: 503 })));

    await expect(groqChat([{ role: "user", content: "hello" }])).rejects.toThrow("all Groq keys failed");
  });
});
