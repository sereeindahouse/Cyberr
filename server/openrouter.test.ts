import { afterEach, describe, expect, it, vi } from "vitest";
import { openRouterChat, openRouterConfig, openRouterEmbed, openRouterEmbeddingConfig } from "./openrouter";

const saved = {
  url: process.env.OPENROUTER_API_URL,
  key: process.env.OPENROUTER_API_KEY,
  model: process.env.OPENROUTER_MODEL,
  embModel: process.env.OPENROUTER_EMBEDDING_MODEL,
};

afterEach(() => {
  process.env.OPENROUTER_API_URL = saved.url;
  process.env.OPENROUTER_API_KEY = saved.key;
  process.env.OPENROUTER_MODEL = saved.model;
  process.env.OPENROUTER_EMBEDDING_MODEL = saved.embModel;
  vi.unstubAllGlobals();
});

describe("OpenRouter client", () => {
  it("is unconfigured without a key", () => {
    delete process.env.OPENROUTER_API_KEY;
    expect(openRouterConfig().configured).toBe(false);
  });

  it("reports embeddings unconfigured unless a model is explicitly set", () => {
    process.env.OPENROUTER_API_KEY = "k";
    delete process.env.OPENROUTER_EMBEDDING_MODEL;
    expect(openRouterEmbeddingConfig().configured).toBe(false);
    process.env.OPENROUTER_EMBEDDING_MODEL = "openai/text-embedding-3-small";
    expect(openRouterEmbeddingConfig().configured).toBe(true);
  });

  it("throws a clear error when embedding without configuration", async () => {
    delete process.env.OPENROUTER_API_KEY;
    delete process.env.OPENROUTER_EMBEDDING_MODEL;
    await expect(openRouterEmbed(["hi"])).rejects.toThrow("not configured");
  });

  it("normalises embedding vectors to unit length", async () => {
    process.env.OPENROUTER_API_URL = "https://openrouter.ai/api/v1";
    process.env.OPENROUTER_API_KEY = "test-key";
    process.env.OPENROUTER_EMBEDDING_MODEL = "openai/text-embedding-3-small";
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        json: async () => ({ data: [{ embedding: [3, 4] }, { embedding: [1, 0] }] }),
      }))
    );
    const vectors = await openRouterEmbed(["a", "b"]);
    expect(vectors).toHaveLength(2);
    expect(vectors[0][0]).toBeCloseTo(0.6, 5);
    expect(vectors[0][1]).toBeCloseTo(0.8, 5);
    expect(vectors[1]).toEqual([1, 0]);
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
