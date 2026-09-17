/**
 * Framework-free markdown helpers shared by the client visual modules
 * (Knowledge Atlas / Document-to-Diagram) and the server-side analyzer.
 *
 * Kept in `shared/` so the Express/trpc server never has to import from
 * `client/`, while the browser bundle still gets the exact same behaviour.
 */

const EMOJI_RANGE =
  /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}\u{2190}-\u{21FF}]/gu;

/** Remove markdown emphasis, links, inline code and decorative emoji. */
export function cleanInline(raw: string): string {
  return String(raw ?? "")
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/`([^`]*)`/g, "$1")
    .replace(/(\*\*|__|==|~~)/g, "")
    .replace(/(^|[^*])\*([^*]+)\*/g, "$1$2")
    .replace(EMOJI_RANGE, "")
    .replace(/[>\s]+/g, " ")
    .trim();
}

export type Heading = { level: number; text: string };

/** Headings outside fenced code blocks. */
export function extractHeadings(markdown: string): Heading[] {
  const out: Heading[] = [];
  let inFence = false;
  for (const line of String(markdown ?? "").split(/\r?\n/)) {
    if (/^\s*(```|~~~)/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    const match = line.match(/^(#{1,6})\s+(.*)$/);
    if (!match) continue;
    const text = cleanInline(match[2]);
    if (text) out.push({ level: match[1].length, text });
  }
  return out;
}

export type ListItem = { ordered: boolean; text: string };

/** Ordered (`1. …`) or bullet (`- …`) list items outside code fences. */
export function extractListItems(markdown: string): ListItem[] {
  const out: ListItem[] = [];
  let inFence = false;
  for (const line of String(markdown ?? "").split(/\r?\n/)) {
    if (/^\s*(```|~~~)/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    const ordered = line.match(/^\s*\d+[.)]\s+(.*)$/);
    if (ordered) {
      const text = cleanInline(ordered[1]);
      if (text) out.push({ ordered: true, text });
      continue;
    }
    const bullet = line.match(/^\s*[-*+]\s+(?:\[[ xX]\]\s+)?(.*)$/);
    if (bullet) {
      const text = cleanInline(bullet[1]);
      if (text) out.push({ ordered: false, text });
    }
  }
  return out;
}

const STOPWORDS = new Set([
  // English
  "the", "and", "for", "with", "that", "this", "from", "into", "your", "you",
  "are", "not", "but", "can", "has", "have", "use", "using", "add", "all",
  "any", "one", "two", "new", "old", "get", "set", "via", "how", "why",
  "what", "when", "then", "than", "they", "them", "their", "there", "here",
  "will", "would", "should", "could", "also", "more", "most", "some", "such",
  "only", "other", "each", "which", "while", "where", "been", "being", "does",
  "did", "file", "files", "note", "notes", "vault", "obsidian", "title",
  "tags", "source", "name", "step", "steps", "command", "commands",
  // Mongolian
  "болон", "эсвэл", "тухай", "жишээ", "дараах", "дээр", "доор", "бидний",
  "таны", "энэ", "тэр", "эдгээр", "байна", "хийх", "ашиглах", "мөн", "буюу",
  "юм", "нь", "бол", "гэх", "мэт", "тулд", "дараа", "өмнө", "аль", "ямар",
  "харах", "шалгах", "тухайн", "зөвхөн",
]);

/** Split a line into normalised candidate tokens (latin words + Cyrillic words). */
function tokenize(text: string): string[] {
  const out: string[] = [];
  for (const token of text.match(/[A-Za-z][A-Za-z0-9._-]{2,}/g) ?? []) {
    out.push(normalizeToken(token));
  }
  for (const token of text.match(/[\p{Script=Cyrillic}]{4,}/gu) ?? []) {
    out.push(normalizeToken(token));
  }
  return out;
}

function normalizeToken(token: string): string {
  const trimmed = token.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, "");
  if (!trimmed) return "";
  // Keep acronyms (nmap, sudo, SUID…) upper-case, normalise the rest.
  const isAcronym = /^[A-Z0-9._-]{2,}$/.test(trimmed);
  return isAcronym ? trimmed : trimmed.toLowerCase();
}

/**
 * Deterministic keyword extractor: the most frequent technical tokens in a
 * document. Used by the network diagram, and as the always-available fallback
 * for the optional LLM analyzer.
 */
export function extractConcepts(markdown: string, limit = 8): string[] {
  const body = String(markdown ?? "");
  const counts = new Map<string, number>();
  const bump = (token: string, weight = 1) => {
    counts.set(token, (counts.get(token) ?? 0) + weight);
  };

  // Headings are the strongest signal.
  for (const heading of extractHeadings(body)) {
    tokenize(heading.text).forEach(token => bump(token, 3));
  }
  // Inline code / commands, then everything else.
  for (const match of body.matchAll(/`([^`\n]{2,40})`/g)) {
    tokenize(match[1]).forEach(token => bump(token, 2));
  }
  tokenize(cleanInline(body)).forEach(token => bump(token, 1));

  return [...counts.entries()]
    .filter(([token]) => token.length >= 3 && !STOPWORDS.has(token))
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, Math.max(1, limit))
    .map(([token]) => token);
}

/** First paragraph / lead sentence, used as the analyzer summary. */
export function extractSummary(markdown: string, maxLength = 240): string {
  const body = String(markdown ?? "");
  const paragraphs = body
    .replace(/^\s*---\n[\s\S]*?\n---\n?/, "") // front matter
    .split(/\n\s*\n/)
    .map(chunk => cleanInline(chunk))
    .filter(chunk => chunk.length > 24 && !/^#{1,6}\s/.test(chunk));
  const lead = paragraphs[0] ?? cleanInline(body.replace(/^#+.*$/gm, ""));
  return lead.length <= maxLength ? lead : `${lead.slice(0, maxLength - 1).trimEnd()}…`;
}

export function truncateLabel(label: string, max = 26): string {
  const text = String(label ?? "").trim();
  return text.length <= max ? text : `${text.slice(0, Math.max(1, max - 1)).trimEnd()}…`;
}

export function slug(value: string): string {
  return (
    String(value ?? "")
      .toLowerCase()
      .replace(/[^\p{L}\p{N}]+/gu, "-")
      .replace(/^-+|-+$/g, "") || "node"
  );
}

export function dedupe(values: string[], limit: number): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const value of values) {
    const key = String(value ?? "").toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(value);
    if (out.length >= limit) break;
  }
  return out;
}
