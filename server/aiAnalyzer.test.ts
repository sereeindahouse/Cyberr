import { afterEach, describe, expect, it, vi } from "vitest";
import { aiConfig, analyze, analyzeLocal, parseJsonObject } from "./aiAnalyzer";

const markdown = [
  "# Kerberoasting lab",
  "",
  "We enumerate SPNs with PowerView and request service tickets for offline cracking.",
  "",
  "## Workflow",
  "",
  "1. Enumerate SPNs",
  "2. Request the TGS",
  "3. Crack the ticket offline",
].join("\n");

const envKeys = ["MOONSHOT_API_URL", "MOONSHOT_API_KEY", "MOONSHOT_MODEL"] as const;
const savedEnv: Record<string, string | undefined> = {};

function clearEnv() {
  for (const key of envKeys) {
    savedEnv[key] = process.env[key];
    delete process.env[key];
  }
}

afterEach(() => {
  for (const key of envKeys) {
    if (savedEnv[key] === undefined) delete process.env[key];
    else process.env[key] = savedEnv[key];
  }
  vi.unstubAllGlobals();
});

describe("aiConfig", () => {
  it("is unconfigured (local-only) without env vars", () => {
    clearEnv();
    const config = aiConfig();
    expect(config.configured).toBe(false);
    expect(config.model).toBeTruthy();
  });

  it("is configured only when both url and key are present", () => {
    process.env.MOONSHOT_API_URL = "https://api.moonshot.example/v1/";
    delete process.env.MOONSHOT_API_KEY;
    expect(aiConfig().configured).toBe(false);
    process.env.MOONSHOT_API_KEY = "sk-test";
    const config = aiConfig();
    expect(config.configured).toBe(true);
    expect(config.url).toBe("https://api.moonshot.example/v1");
    expect(config.key).toBe("sk-test");
  });
});

describe("analyzeLocal", () => {
  it("returns a deterministic summary, concepts and steps", () => {
    clearEnv();
    const result = analyzeLocal(markdown, 5);
    expect(result.provider).toBe("local");
    expect(result.model).toBe("local-heuristic");
    expect(result.summary.length).toBeGreaterThan(0);
    expect(result.concepts.length).toBeLessThanOrEqual(5);
    expect(result.summary).not.toContain("#");
    expect(analyzeLocal(markdown, 5)).toEqual(result);
    // Ordered lists drive the steps.
    expect(result.steps).toEqual(["Enumerate SPNs", "Request the TGS", "Crack the ticket offline"]);
  });

  it("never throws on empty input", () => {
    clearEnv();
    const result = analyzeLocal("", 4);
    expect(result.concepts).toEqual([]);
    expect(result.steps).toEqual([]);
  });
});

describe("analyze", () => {
  it("uses the local analyzer when Moonshot is not configured", async () => {
    clearEnv();
    const result = await analyze(markdown, { maxConcepts: 4 });
    expect(result.provider).toBe("local");
    expect(result.note).toBeUndefined();
    expect(result.concepts.length).toBeLessThanOrEqual(4);
  });

  it("upgrades to Moonshot when configured", async () => {
    process.env.MOONSHOT_API_URL = "https://api.moonshot.example/v1";
    process.env.MOONSHOT_API_KEY = "sk-test";

    const fetchMock = vi.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => ({
        choices: [
          {
            message: {
              content:
                '```json\n{"summary": "Kerberoasting walkthrough", "concepts": ["kerberos", "spn", "tgs"], "steps": ["enumerate", "crack"]}\n```',
            },
          },
        ],
      }),
    }));
    vi.stubGlobal("fetch", fetchMock);

    const result = await analyze(markdown, { maxConcepts: 5 });
    expect(result.provider).toBe("moonshot");
    expect(result.model).toBe("moonshot-v1-8k");
    expect(result.concepts).toEqual(["kerberos", "spn", "tgs"]);
    expect(result.steps).toEqual(["enumerate", "crack"]);
    expect(result.summary).toBe("Kerberoasting walkthrough");

    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://api.moonshot.example/v1/chat/completions");
    expect((init.headers as Record<string, string>).authorization).toBe("Bearer sk-test");
    expect(String(init.body)).toContain("Kerberoasting");
    // The key must never be echoed back inside the request body.
    expect(String(init.body)).not.toContain("sk-test");
  });

  it("falls back to local analysis when the LLM call fails", async () => {
    process.env.MOONSHOT_API_URL = "https://api.moonshot.example/v1";
    process.env.MOONSHOT_API_KEY = "sk-test";
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({ ok: false, status: 429, json: async () => ({}) }))
    );

    const result = await analyze(markdown, { maxConcepts: 3 });
    expect(result.provider).toBe("local");
    expect(result.note).toContain("HTTP 429");
    expect(result.concepts.length).toBeLessThanOrEqual(3);
  });

  it("falls back when the LLM returns non-JSON", async () => {
    process.env.MOONSHOT_API_URL = "https://api.moonshot.example/v1";
    process.env.MOONSHOT_API_KEY = "sk-test";
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        status: 200,
        json: async () => ({ choices: [{ message: { content: "sorry, I cannot help" } }] }),
      }))
    );

    const result = await analyze(markdown);
    expect(result.provider).toBe("local");
    expect(result.note).toBeTruthy();
  });
});

describe("parseJsonObject", () => {
  it("parses fenced and bare JSON", () => {
    expect(parseJsonObject('```json\n{"a": 1}\n```')).toEqual({ a: 1 });
    expect(parseJsonObject('here you go: {"a": [1,2]} thanks')).toEqual({ a: [1, 2] });
    expect(parseJsonObject("nope")).toBeNull();
    expect(parseJsonObject("{broken")).toBeNull();
  });
});
