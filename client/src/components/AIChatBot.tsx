import { useEffect, useRef, useState } from "react";
import { Bot, ExternalLink, FileText, Send, Sparkles, X } from "lucide-react";
import DOMPurify from "dompurify";
import { marked } from "marked";
import { trpc } from "@/lib/trpc";
import {
  buildChatSnippets,
  type ChatPlaybookLike,
  type ChatReportLike,
  type ChatRoomLike,
  type KnowledgeSnippet,
} from "@/lib/chatContext";

type ChatTurn = {
  role: "user" | "assistant";
  content: string;
  sources?: KnowledgeSnippet[];
  provider?: string;
  background?: string;
  note?: string;
};

const HISTORY_KEY = "operator-dossier-chat-history";
const HISTORY_LIMIT = 40;

function ChatMarkdown({ content }: { content: string }) {
  const html = DOMPurify.sanitize(String(marked.parse(content, { breaks: true, async: false })));
  return <div className="chatbot-markdown" dangerouslySetInnerHTML={{ __html: html }} />;
}

function readHistory(): ChatTurn[] {
  try {
    const saved = localStorage.getItem(HISTORY_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function saveHistory(turns: ChatTurn[]) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(turns.slice(-HISTORY_LIMIT)));
  } catch {
    /* storage full or unavailable — chat still works, just not persisted */
  }
}

export type AIChatBotProps = {
  reports: ChatReportLike[];
  playbooks: ChatPlaybookLike[];
  rooms: ChatRoomLike[];
  open: boolean;
  onClose: () => void;
  onOpenReport?: (reportId: number) => void;
  onOpenRoom?: (slug: string) => void;
};

/**
 * Operator Assistant — Groq (fast, visible chat) + OpenRouter/Gemini
 * background enrichment collaborating over the local knowledge base.
 */
export default function AIChatBot({
  reports,
  playbooks,
  rooms,
  open,
  onClose,
  onOpenReport,
  onOpenRoom,
}: AIChatBotProps) {
  const [turns, setTurns] = useState<ChatTurn[]>(readHistory);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const status = trpc.ai.chat.status.useQuery(undefined, { staleTime: 60_000 });
  const ask = trpc.ai.chat.ask.useMutation();

  useEffect(() => saveHistory(turns), [turns]);

  useEffect(() => {
    if (open) scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [turns, open]);

  async function send() {
    const message = input.trim();
    if (!message || sending) return;
    setInput("");
    const snippets = buildChatSnippets(message, { reports, playbooks, rooms });
    const history = turns.slice(-6).map(t => ({ role: t.role, content: t.content }));
    setTurns(current => [...current, { role: "user", content: message }]);
    setSending(true);
    try {
      const result = await ask.mutateAsync({ message, history, snippets });
      setTurns(current => [
        ...current,
        {
          role: "assistant",
          content: result.reply,
          sources: snippets,
          provider:
            result.chatProvider === "groq"
              ? `Groq · ${result.model ?? ""}`.trim()
              : "Локал (Groq key тохируулаагүй)",
          background: result.backgroundProvider,
          note: result.note,
        },
      ]);
    } catch {
      setTurns(current => [
        ...current,
        { role: "assistant", content: "Уучлаарай, chatbot одоогоор хариу өгч чадсангүй. Дахин оролдоно уу." },
      ]);
    } finally {
      setSending(false);
    }
  }

  if (!open) return null;

  return (
    <div
      className="chatbot-overlay"
      onClick={event => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="chatbot-panel">
        <div className="chatbot-head">
          <div>
            <div className="section-kicker">Operator Assistant</div>
            <h3>
              <Bot size={16} /> Groq + Gemini chatbot
            </h3>
            <small>
              Groq: {status.data?.groqConfigured ? `идэвхтэй (${status.data.groqModel})` : "тохируулаагүй"} ·
              keys: {status.data?.groqKeyCount ?? 0} · OpenRouter: {status.data?.openRouterConfigured ? "идэвхтэй" : "тохируулаагүй"} ·
              Gemini: {status.data?.geminiConfigured ? "идэвхтэй" : "тохируулаагүй"}
            </small>
          </div>
          <button className="icon-button" onClick={onClose} title="Хаах">
            <X size={17} />
          </button>
        </div>

        <div className="chatbot-messages" ref={scrollRef}>
          {turns.length === 0 && (
            <div className="chatbot-empty">
              <Sparkles size={18} />
              <p>
                Жишээ асуулт: “Linux privesc-ийн жишээ room санал болго”, “SMB enumeration яаж хийх вэ?”, “AWS
                IAM privilege escalation юу вэ?”
              </p>
            </div>
          )}
          {turns.map((turn, index) => (
            <div key={index} className={`chatbot-bubble ${turn.role}`}>
              <ChatMarkdown content={turn.content} />
              {turn.provider && <div className="chatbot-provider">{turn.provider}</div>}
              {turn.background && <div className="chatbot-provider">Background: {turn.background}</div>}
              {turn.note && <div className="chatbot-note">{turn.note}</div>}
              {turn.sources && turn.sources.length > 0 && (
                <div className="chatbot-sources">
                  {turn.sources.map(source => (
                    <button
                      key={`${source.kind}-${source.id}`}
                      className="chatbot-source-chip"
                      onClick={() => {
                        if (source.kind === "report") onOpenReport?.(Number(source.id));
                        else if (source.kind === "room") onOpenRoom?.(source.id);
                      }}
                      title={source.extract}
                    >
                      {source.kind === "room" ? <ExternalLink size={11} /> : <FileText size={11} />}
                      {source.title}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
          {sending && <div className="chatbot-bubble assistant chatbot-typing">Бодож байна…</div>}
        </div>

        <div className="chatbot-input-row">
          <input
            value={input}
            onChange={event => setInput(event.target.value)}
            placeholder="Жишээ: Linux privesc room санал болгоно уу?"
            onKeyDown={event => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                send();
              }
            }}
          />
          <button className="primary-button" onClick={send} disabled={sending || !input.trim()} title="Илгээх">
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
