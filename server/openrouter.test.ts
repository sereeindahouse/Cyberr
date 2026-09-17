import { afterEach, describe, expect, it, vi } from "vitest";
import { openRouterChat, openRouterConfig } from "./openrouter";

const saved = {
  url: process.env.OPENROUTER_API_URL,
  key: process.env.OPENROUTER_API_KEY,
  model: process.env.OPENROUTER_MODEL,
};

afterEach(() => {
  process.env.OPENROUTER_API_URL = saved.url;
  process.env.OPENROUTER_API_KEY = saved.key;
  process.env.OPENROUTER_MODEL = saved.model;
  vi.unstubAllGlobals();
});

describe("OpenRouter client", () => {
  it("is unconfigured without a key", () => {
    delete process.env.OPENROUTER_API_KEY;
    expect(openRouterConfig().configured).toBe(false);
  });

  it("calls the OpenAI-compatible endpoint when configured", async () => {
    process.env.OPENROUTER_API_URL = "https://openrouter.example/api/v1";
    process.env.OPENROUTER_API_KEY = "or-test";
    process.env.OPENROUTER_MODEL = "openai/gpt-oss-120b";
    let calledUrl = "";
    vi.stubGlobal("fetch", vi.fn(async (url: string) => {
      calledUrl = url;
      return new Response(JSON.stringify({ choices: [{ message: { content: "background ready" } }] }), { status: 200 });
    }));
    await expect(openRouterChat([{ role: "user", content: "hello" }])).resolves.toBe("background ready");
    expect(calledUrl).toBe("https://openrouter.example/api/v1/chat/completions");
  });
});
