/**
 * Client-side retrieval for the Operator Assistant chatbot: scores the
 * user's local reports/playbooks/THM rooms against the chat message and
 * returns a short list of "knowledge snippets". These travel to the server
 * (server/knowledgeChat.ts) so Gemini/Groq can ground their reply in the
 * user's own vault instead of guessing. Pure and framework-free so it is
 * easy to unit test with plain objects.
 */

export type KnowledgeSnippet = {
  kind: "report" | "playbook" | "room";
  id: string;
  title: string;
  extract: string;
  meta?: string;
};

export type ChatReportLike = {
  id: number;
  title: string;
  room: string;
  tags: string[];
  content: string;
  source: string;
};

export type ChatPlaybookLike = {
  id: string;
  title: string;
  category: string;
  description: string;
  commands: { label: string; cmd: string }[];
};

export type ChatRoomLike = {
  id: string;
  levelId: string;
  title: string;
  slug: string;
};

/** Category keywords widen a short query (e.g. "linux") to related terms. */
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  linux: ["linux", "privesc", "suid", "sudo", "gtfobins", "cron", "kernel"],
  windows: ["windows", "active directory", "kerberos", "powershell", "ntlm", "registry"],
  network: ["network", "nmap", "port", "tcp", "udp", "recon", "traceroute", "dns"],
  cloud: ["cloud", "aws", "iam", "s3", "azure", "gcp"],
  web: ["web", "sql", "xss", "http", "injection", "juice shop"],
};

function tokenize(text: string): string[] {
  return String(text ?? "")
    .toLowerCase()
    .replace(/[^a-zа-яөүёa-z0-9\s-]/gi, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function expandTokens(tokens: string[]): string[] {
  const expanded = [...tokens];
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (tokens.includes(category) || keywords.some(k => tokens.includes(k))) {
      expanded.push(category, ...keywords);
    }
  }
  return expanded;
}

function scoreText(haystack: string, tokens: string[]): number {
  const lower = haystack.toLowerCase();
  let score = 0;
  for (const token of tokens) {
    if (token.length < 3) continue;
    if (lower.includes(token)) score += 1;
  }
  return score;
}

function truncate(text: string, max = 220): string {
  const clean = String(text ?? "").replace(/\s+/g, " ").trim();
  return clean.length > max ? `${clean.slice(0, max - 1)}…` : clean;
}

export function buildChatSnippets(
  query: string,
  data: { reports: ChatReportLike[]; playbooks: ChatPlaybookLike[]; rooms: ChatRoomLike[] },
  limits: { reports?: number; playbooks?: number; rooms?: number } = {}
): KnowledgeSnippet[] {
  const tokens = expandTokens(tokenize(query));

  const reportMatches = data.reports
    .map(item => ({
      item,
      score: scoreText(`${item.title} ${item.room} ${item.tags.join(" ")} ${item.content.slice(0, 800)}`, tokens),
    }))
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limits.reports ?? 3)
    .map(({ item }): KnowledgeSnippet => ({
      kind: "report",
      id: String(item.id),
      title: item.title,
      extract: truncate(item.content || item.room),
      meta: `${item.source} / ${item.room}`,
    }));

  const playbookMatches = data.playbooks
    .map(item => ({
      item,
      score: scoreText(
        `${item.title} ${item.category} ${item.description} ${item.commands.map(c => c.label).join(" ")}`,
        tokens
      ),
    }))
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limits.playbooks ?? 2)
    .map(({ item }): KnowledgeSnippet => ({
      kind: "playbook",
      id: String(item.id),
      title: item.title,
      extract: truncate(
        `${item.description}${item.commands[0] ? ` Жишээ комманд: ${item.commands[0].cmd}` : ""}`
      ),
      meta: item.category,
    }));

  const roomMatches = data.rooms
    .map(item => ({ item, score: scoreText(`${item.title} ${item.levelId}`, tokens) }))
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limits.rooms ?? 4)
    .map(({ item }): KnowledgeSnippet => ({
      kind: "room",
      id: item.slug,
      title: item.title,
      extract: `TryHackMe room: tryhackme.com/room/${item.slug}`,
      meta: item.levelId,
    }));

  const combined = [...reportMatches, ...playbookMatches, ...roomMatches];
  if (combined.length) return combined;

  // Nothing matched (e.g. a plain greeting) — surface a small starter set
  // so the bot is never empty-handed and can still suggest a first room.
  return data.rooms.slice(0, 3).map((item): KnowledgeSnippet => ({
    kind: "room",
    id: item.slug,
    title: item.title,
    extract: `TryHackMe room: tryhackme.com/room/${item.slug}`,
    meta: item.levelId,
  }));
}
