import {
  dedupe,
  extractConcepts,
  extractHeadings,
  extractListItems,
  extractSummary,
} from "@shared/textModel";

/**
 * Optional AI layer for the Round 4 visual modules.
 *
 * Default behaviour is a **deterministic local analyzer** — no network, no
 * secrets, always available (including in the public/read-only view). When
 * `MOONSHOT_API_URL` + `MOONSHOT_API_KEY` are present the same call upgrades to
 * Moonshot (Kimi) and the LLM's summary/concepts/steps are used instead. The
 * key never leaves this process and is never logged.
 */

export type AiProvider = "local" | "moonshot";

export type AnalysisResult = {
  summary: string;
  concepts: string[];
  steps: string[];
  provider: AiProvider;
  model: string;
  /** Present when the LLM path was attempted but fell back to local. */
  note?: string;
};

export type AiConfig = {
  url: string;
  key: string;
  model: string;
  configured: boolean;
};

const DEFAULT_MODEL = "moonshot-v1-8k";
const REQUEST_TIMEOUT_MS = 20_000;
/** The prompt only ever needs the beginning of long write-ups. */
const MAX_INPUT_CHARS = 24_000;

export function aiConfig(): AiConfig {
  const url = process.env.MOONSHOT_API_URL?.trim() ?? "";
  const key = process.env.MOONSHOT_API_KEY?.trim() ?? "";
  const model = process.env.MOONSHOT_MODEL?.trim() || DEFAULT_MODEL;
  return { url: url.replace(/\/+$/, ""), key, model, configured: Boolean(url && key) };
}

/** Deterministic analysis: headings, ordered steps and keyword frequency. */
export function analyzeLocal(markdown: string, maxConcepts = 8): AnalysisResult {
  const ordered = extractListItems(markdown).filter(item => item.ordered);
  const steps = (
    ordered.length >= 2
      ? ordered
      : extractHeadings(markdown).filter(heading => heading.level >= 2)
  )
    .slice(0, 10)
    .map(entry => entry.text);

  return {
    summary: extractSummary(markdown),
    concepts: extractConcepts(markdown, maxConcepts),
    steps,
    provider: "local",
    model: "local-heuristic",
  };
}

/**
 * Analyze a document. Falls back to (and annotates) the local result whenever
 * the LLM is not configured or the request fails — the UI must never break
 * because of an optional integration.
 */
export async function analyze(
  markdown: string,
  options: { maxConcepts?: number; signal?: AbortSignal } = {}
): Promise<AnalysisResult> {
  const local = analyzeLocal(markdown, options.maxConcepts ?? 8);
  const config = aiConfig();
  if (!config.configured) return local;

  try {
    const result = await callMoonshot(markdown, config, options);
    return result;
  } catch (error) {
    return {
      ...local,
      note: `LLM дуудлага амжилтгүй (${errorMessage(error)}) — орон нутгийн шинжилгээг ашиглалаа.`,
    };
  }
}

async function callMoonshot(
  markdown: string,
  config: AiConfig,
  options: { maxConcepts?: number; signal?: AbortSignal }
): Promise<AnalysisResult> {
  const maxConcepts = options.maxConcepts ?? 8;
  const body = {
    model: config.model,
    temperature: 0.2,
    max_tokens: 900,
    messages: [
      {
        role: "system",
        content:
          "You analyse cybersecurity lab reports and write-ups. " +
          "Always answer with a single JSON object and nothing else: " +
          '{"summary": string, "concepts": string[], "steps": string[]}. ' +
          "Keep the summary under 60 words, concepts are short technical nouns " +
          `(max ${maxConcepts}), steps are the attack/analysis workflow in order.`,
      },
      {
        role: "user",
        content: String(markdown ?? "").slice(0, MAX_INPUT_CHARS),
      },
    ],
  };

  const timeout = AbortSignal.timeout(REQUEST_TIMEOUT_MS);
  const signal = options.signal
    ? AbortSignal.any([options.signal, timeout])
    : timeout;

  const response = await fetch(`${config.url}/chat/completions`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${config.key}`,
    },
    body: JSON.stringify(body),
    signal,
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const payload = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = payload.choices?.[0]?.message?.content ?? "";
  const parsed = parseJsonObject(content);
  if (!parsed) throw new Error("JSON биш хариу");

  const concepts = dedupe(asStringArray(parsed.concepts), maxConcepts);
  const steps = asStringArray(parsed.steps).slice(0, 12);
  const summary = typeof parsed.summary === "string" ? parsed.summary.trim() : "";

  return {
    summary: summary || extractSummary(markdown),
    concepts: concepts.length ? concepts : extractConcepts(markdown, maxConcepts),
    steps: steps.length ? steps : analyzeLocal(markdown, maxConcepts).steps,
    provider: "moonshot",
    model: config.model,
  };
}

/** Tolerate ```json fences and stray prose around the JSON object. */
export function parseJsonObject(text: string): Record<string, unknown> | null {
  const cleaned = String(text ?? "").trim().replace(/^```(?:json)?/i, "").replace(/```$/, "");
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  try {
    const value = JSON.parse(cleaned.slice(start, end + 1));
    return value && typeof value === "object" ? (value as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter(item => typeof item === "string")
    .map(item => String(item).trim())
    .filter(Boolean);
}

function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}
