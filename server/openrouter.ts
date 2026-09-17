/** OpenRouter OpenAI-compatible client for background knowledge enrichment. */
import type { ChatMessage } from "./groq";

export type OpenRouterConfig = {
  url: string;
  key: string;
  model: string;
  configured: boolean;
};

export type OpenRouterEmbeddingConfig = {
  model: string;
  configured: boolean;
};

const DEFAULT_MODEL = "openai/gpt-oss-120b";
const DEFAULT_EMBEDDING_MODEL = "openai/text-embedding-3-small";
const REQUEST_TIMEOUT_MS = 25_000;

export function openRouterConfig(): OpenRouterConfig {
  const url = (process.env.OPENROUTER_API_URL?.trim() || "https://openrouter.ai/api/v1").replace(/\/+$/, "");
  const key = process.env.OPENROUTER_API_KEY?.trim() ?? "";
  const model = process.env.OPENROUTER_MODEL?.trim() || DEFAULT_MODEL;
  return { url, key, model, configured: Boolean(key) };
}

/**
 * Embedding upgrade for semantic search. Shares the chat API key — no extra
 * secret to manage. Disabled (local vectors only) unless explicitly set with
 * `OPENROUTER_EMBEDDING_MODEL`, so nobody pays for embeddings by accident.
 */
export function openRouterEmbeddingConfig(): OpenRouterEmbeddingConfig {
  const model = process.env.OPENROUTER_EMBEDDING_MODEL?.trim() || "";
  return { model: model || DEFAULT_EMBEDDING_MODEL, configured: Boolean(model && openRouterConfig().configured) };
}

export async function openRouterChat(
  messages: ChatMessage[],
  options: { temperature?: number; maxTokens?: number; signal?: AbortSignal } = {}
): Promise<string> {
  const config = openRouterConfig();
  if (!config.configured) throw new Error("OPENROUTER_API_KEY is not configured");
  const timeout = AbortSignal.timeout(REQUEST_TIMEOUT_MS);
  const signal = options.signal ? AbortSignal.any([options.signal, timeout]) : timeout;
  const response = await fetch(`${config.url}/chat/completions`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${config.key}`,
      "HTTP-Referer": "http://localhost:3000",
      "X-Title": "Operator Knowledge Dossier",
    },
    body: JSON.stringify({
      model: config.model,
      temperature: options.temperature ?? 0.2,
      max_tokens: options.maxTokens ?? 700,
      messages,
    }),
    signal,
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const payload = (await response.json()) as { choices?: { message?: { content?: string } }[] };
  const content = payload.choices?.[0]?.message?.content?.trim();
  if (!content) throw new Error("OpenRouter returned an empty response");
  return content;
}

/**
 * Embed one or more texts via OpenRouter's OpenAI-compatible `/embeddings`
 * endpoint. Returns L2-normalised vectors. Throws when embeddings are not
 * configured — callers must fall back to the local hash embeddings.
 */
export async function openRouterEmbed(
  inputs: string[],
  options: { signal?: AbortSignal } = {}
): Promise<number[][]> {
  const base = openRouterConfig();
  const emb = openRouterEmbeddingConfig();
  if (!emb.configured) throw new Error("OPENROUTER_EMBEDDING_MODEL is not configured");
  const timeout = AbortSignal.timeout(REQUEST_TIMEOUT_MS);
  const signal = options.signal ? AbortSignal.any([options.signal, timeout]) : timeout;
  const response = await fetch(`${base.url}/embeddings`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${base.key}`,
      "HTTP-Referer": "http://localhost:3000",
      "X-Title": "Operator Knowledge Dossier",
    },
    body: JSON.stringify({
      model: emb.model,
      input: inputs.map(t => String(t ?? "").slice(0, 6000)),
    }),
    signal,
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const payload = (await response.json()) as { data?: { embedding?: number[] }[] };
  const rows = Array.isArray(payload.data) ? payload.data : [];
  if (rows.length !== inputs.length) throw new Error("OpenRouter returned incomplete embeddings");
  return rows.map(row => {
    const vec = Array.isArray(row.embedding) ? row.embedding : [];
    if (!vec.length) throw new Error("OpenRouter returned an empty embedding");
    let norm = 0;
    for (const v of vec) norm += v * v;
    norm = Math.sqrt(norm) || 1;
    return vec.map(v => v / norm);
  });
}
