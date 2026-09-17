/** OpenRouter OpenAI-compatible client for background knowledge enrichment. */
import type { ChatMessage } from "./groq";

export type OpenRouterConfig = {
  url: string;
  key: string;
  model: string;
  configured: boolean;
};

const DEFAULT_MODEL = "openai/gpt-oss-120b";
const REQUEST_TIMEOUT_MS = 25_000;

export function openRouterConfig(): OpenRouterConfig {
  const url = (process.env.OPENROUTER_API_URL?.trim() || "https://openrouter.ai/api/v1").replace(/\/+$/, "");
  const key = process.env.OPENROUTER_API_KEY?.trim() ?? "";
  const model = process.env.OPENROUTER_MODEL?.trim() || DEFAULT_MODEL;
  return { url, key, model, configured: Boolean(key) };
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
