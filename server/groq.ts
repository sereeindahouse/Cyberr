/**
 * Groq (OpenAI-compatible) chat completion client — the fast conversational
 * "voice" of the Operator Assistant chatbot (see knowledgeChat.ts). Optional:
 * without a key configured the chatbot falls back to a plain knowledge-base
 * digest, so the UI never breaks. The key never leaves this process and is
 * never logged.
 */

export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export type GroqConfig = {
  url: string;
  keys: string[];
  model: string;
  configured: boolean;
};

const DEFAULT_MODEL = "llama-3.3-70b-versatile";
const REQUEST_TIMEOUT_MS = 25_000;

export function groqConfig(): GroqConfig {
  const url = (process.env.GROQ_API_URL?.trim() || "https://api.groq.com/openai/v1").replace(/\/+$/, "");
  const keys = [process.env.GROQ_API_KEY, process.env.GROQ_API_KEY_2]
    .map(key => key?.trim() ?? "")
    .filter(Boolean);
  const model = process.env.GROQ_MODEL?.trim() || DEFAULT_MODEL;
  return { url, keys, model, configured: keys.length > 0 };
}

export async function groqChat(
  messages: ChatMessage[],
  options: { temperature?: number; maxTokens?: number; signal?: AbortSignal } = {}
): Promise<string> {
  const config = groqConfig();
  if (!config.configured) throw new Error("GROQ_API_KEY is not configured");

  const timeout = AbortSignal.timeout(REQUEST_TIMEOUT_MS);
  const signal = options.signal ? AbortSignal.any([options.signal, timeout]) : timeout;

  const failures: string[] = [];
  for (let index = 0; index < config.keys.length; index += 1) {
    try {
      const response = await fetch(`${config.url}/chat/completions`, {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${config.keys[index]}` },
        body: JSON.stringify({
          model: config.model,
          temperature: options.temperature ?? 0.4,
          max_tokens: options.maxTokens ?? 700,
          messages,
        }),
        signal,
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const payload = (await response.json()) as {
        choices?: { message?: { content?: string } }[];
      };
      const content = payload.choices?.[0]?.message?.content?.trim();
      if (!content) throw new Error("empty response");
      return content;
    } catch (error) {
      failures.push(`key-${index + 1}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  throw new Error(`all Groq keys failed (${failures.join(", ")})`);
}
