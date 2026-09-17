/**
 * Operator Assistant orchestration: Groq answers the user (fast, visible
 * "voice"); Gemini (the existing Round-4 aiAnalyzer) runs first, in the
 * background, to digest the retrieved knowledge-base snippets. Groq's
 * prompt is built from that digest, so the two models genuinely hand off
 * information rather than just running side by side. Neither is required:
 * without Groq the reply is a plain digest of the retrieved snippets;
 * without Gemini the [GEMINI] block is simply omitted.
 */
import { analyze } from "./aiAnalyzer";
import { groqChat, groqConfig, type ChatMessage } from "./groq";
import { openRouterChat, openRouterConfig } from "./openrouter";

export type KnowledgeSnippet = {
  kind: "report" | "playbook" | "room";
  id: string;
  title: string;
  extract: string;
  meta?: string;
};

export type ChatTurn = { role: "user" | "assistant"; content: string };

export type ChatResult = {
  reply: string;
  chatProvider: "groq" | "local";
  backgroundProvider: "gemini" | "openrouter" | "gemini+openrouter" | "local";
  model?: string;
  note?: string;
};

const GEMINI_INPUT_CHARS = 6000;

async function openRouterEnrich(snippets: KnowledgeSnippet[]): Promise<{ text: string; used: boolean }> {
  if (!snippets.length || !openRouterConfig().configured) return { text: "", used: false };
  const joined = snippets.map(s => `## ${s.title}\n${s.extract}`).join("\n\n").slice(0, GEMINI_INPUT_CHARS);
  try {
    const text = await openRouterChat([
      {
        role: "system",
        content: "Summarize this cybersecurity knowledge context in concise Mongolian. Return practical concepts and steps only.",
      },
      { role: "user", content: joined },
    ], { maxTokens: 600 });
    return { text, used: true };
  } catch {
    return { text: "", used: false };
  }
}

async function geminiEnrich(snippets: KnowledgeSnippet[], openRouterText = ""): Promise<{ text: string; used: boolean }> {
  if (!snippets.length) return { text: "", used: false };
  const joined = snippets
    .map(s => `## ${s.title}\n${s.extract}`)
    .join("\n\n")
    .concat(openRouterText ? `\n\n[OPENROUTER PREVIEW]\n${openRouterText}` : "")
    .slice(0, GEMINI_INPUT_CHARS);
  try {
    const result = await analyze(joined, { maxConcepts: 6 });
    // Only claim the [GEMINI] block when the LLM actually ran — a local
    // heuristic result mislabeled as "Gemini" would be dishonest.
    if (result.provider !== "moonshot") return { text: "", used: false };
    const parts = [`Хураангуй: ${result.summary}`];
    if (result.concepts.length) parts.push(`Гол ойлголтууд: ${result.concepts.join(", ")}`);
    if (result.steps.length) parts.push(`Ажлын дараалал: ${result.steps.join(" → ")}`);
    return { text: parts.join("\n"), used: true };
  } catch {
    return { text: "", used: false };
  }
}

function buildContextBlock(snippets: KnowledgeSnippet[]): string {
  if (!snippets.length) return "(тохирох мэдээлэл олдсонгүй)";
  return snippets
    .map((s, i) => `${i + 1}. [${s.kind}] ${s.title}${s.meta ? ` (${s.meta})` : ""}\n   ${s.extract}`)
    .join("\n");
}

function buildSystemPrompt(contextBlock: string, openRouterText: string, geminiText: string): string {
  const lines = [
    'Чи "Operator Assistant" — кибер аюулгүй байдлын дадлагажигчид зориулсан туслах chatbot.',
    "Groq (чи өөрөө) хэрэглэгчтэй ярилцаж, Google Gemini арын дэвсгэрт мэдлэгийн сангийн эх сурвалжуудыг урьдчилан шинжилдэг.",
    "",
    "[KNOWLEDGE] — хэрэглэгчийн тайлан / playbook / TryHackMe room-оос олдсон хамгийн тохирох мэдээлэл:",
    contextBlock,
  ];
  if (openRouterText) {
    lines.push("", "[OPENROUTER] — OpenRouter-ийн background дүн шинжилгээ:", openRouterText);
  }
  if (geminiText) {
    lines.push("", "[GEMINI] — Google Gemini-ийн урьдчилсан дүн шинжилгээ:", geminiText);
  }
  lines.push(
    "",
    "Заавар:",
    "- Хариултаа Монгол хэлээр, товч бөгөөд практик зөвлөгөө хэлбэрээр бич.",
    '- [KNOWLEDGE]-д тохирох room/playbook байвал нэрийг нь тодорхой дурд (жишээ: "Linux PrivEsc" room-оос эхэл).',
    "- Мэдэхгүй зүйлээ бүү зохио — [KNOWLEDGE]-д байхгүй бол шударгаар мэдэгд.",
    "- Аюултай тушаалыг зөвхөн зөвшөөрөгдсөн lab орчинд ашиглахыг сануул."
  );
  return lines.join("\n");
}

function truncate(text: string, max = 200): string {
  const clean = String(text ?? "").replace(/\s+/g, " ").trim();
  return clean.length > max ? `${clean.slice(0, max - 1)}…` : clean;
}

function localReply(snippets: KnowledgeSnippet[], geminiText: string): string {
  if (!snippets.length) {
    return "Groq API key тохируулаагүй тул чат хариулт өгөх боломжгүй байна, мэдлэгийн сангаас тохирох зүйл ч олдсонгүй.";
  }
  const lines = [
    "Groq API key тохируулаагүй тул мэдлэгийн сангаас олдсон дараах эх сурвалжийг шууд харуулж байна:",
    "",
    ...snippets.map(
      (s, i) => `${i + 1}. [${s.kind}] ${s.title}${s.meta ? ` — ${s.meta}` : ""}\n   ${truncate(s.extract)}`
    ),
  ];
  if (geminiText) lines.push("", "Gemini-ийн урьдчилсан дүн шинжилгээ:", geminiText);
  return lines.join("\n");
}

export async function runChat(input: {
  message: string;
  history: ChatTurn[];
  snippets: KnowledgeSnippet[];
}): Promise<ChatResult> {
  const { message, history, snippets } = input;
  const openRouter = await openRouterEnrich(snippets);
  const gemini = await geminiEnrich(snippets, openRouter.text);
  const groq = groqConfig();
  const backgroundProvider = openRouter.used && gemini.used
    ? "gemini+openrouter"
    : gemini.used
      ? "gemini"
      : openRouter.used
        ? "openrouter"
        : "local";

  if (!groq.configured) {
    return {
      reply: localReply(snippets, gemini.text),
      chatProvider: "local",
      backgroundProvider,
    };
  }

  const system = buildSystemPrompt(buildContextBlock(snippets), openRouter.text, gemini.text);
  const messages: ChatMessage[] = [
    { role: "system", content: system },
    ...history.slice(-8).map((turn): ChatMessage => ({ role: turn.role, content: turn.content })),
    { role: "user", content: message },
  ];

  try {
    const reply = await groqChat(messages, { maxTokens: 700 });
    return {
      reply,
      chatProvider: "groq",
      backgroundProvider,
      model: groq.model,
    };
  } catch (error) {
    return {
      reply: localReply(snippets, gemini.text),
      chatProvider: "local",
      backgroundProvider,
      note: `Groq дуудлага амжилтгүй (${error instanceof Error ? error.message : String(error)}) — орон нутгийн хариултыг ашиглалаа.`,
    };
  }
}
