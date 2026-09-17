/**
 * Obsidian-style wiki-link model: `[[Note title]]`, `[[Note title|alias]]`
 * and `[[Note title#heading]]`.
 *
 * Framework-free so the browser (rendering, backlinks, autocomplete) and the
 * server (atlas relations) share the exact same parsing behaviour.
 */

export type WikiLink = {
  /** Full matched text, e.g. `[[Linux PrivEsc|privesc]]`. */
  raw: string;
  /** Link target without alias/anchor, e.g. `Linux PrivEsc`. */
  target: string;
  /** Display text: alias when present, otherwise the target. */
  alias: string;
  /** `#anchor` part when present (without the `#`), else null. */
  anchor: string | null;
  /** Offset of `[[` in the source text. */
  start: number;
  /** Offset just past `]]` in the source text. */
  end: number;
};

const WIKI_RE = /\[\[([^\][\n]+?)\]\]/g;

/** Lines inside fenced code blocks never produce wiki-links. */
function fencedRanges(text: string): { start: number; end: number }[] {
  const ranges: { start: number; end: number }[] = [];
  let inFence = false;
  let fenceStart = 0;
  let offset = 0;
  for (const line of String(text ?? "").split("\n")) {
    const lineStart = offset;
    const lineEnd = offset + line.length;
    if (/^\s*(```|~~~)/.test(line)) {
      if (!inFence) {
        inFence = true;
        fenceStart = lineStart;
      } else {
        inFence = false;
        ranges.push({ start: fenceStart, end: lineEnd });
      }
    }
    offset = lineEnd + 1; // + "\n"
  }
  if (inFence) ranges.push({ start: fenceStart, end: text.length });
  return ranges;
}

function inRanges(ranges: { start: number; end: number }[], pos: number): boolean {
  return ranges.some(r => pos >= r.start && pos < r.end);
}

function parseInner(inner: string): { target: string; alias: string; anchor: string | null } {
  const trimmed = inner.trim();
  const pipe = trimmed.indexOf("|");
  const left = (pipe >= 0 ? trimmed.slice(0, pipe) : trimmed).trim();
  const aliasGiven = pipe >= 0 ? trimmed.slice(pipe + 1).trim() : "";
  const hash = left.indexOf("#");
  const target = (hash >= 0 ? left.slice(0, hash) : left).trim();
  const anchor = hash >= 0 ? left.slice(hash + 1).trim() || null : null;
  return { target, alias: aliasGiven || target || left, anchor };
}

/** All wiki-links in `text`, skipping fenced code blocks. */
export function parseWikiLinks(text: string): WikiLink[] {
  const src = String(text ?? "");
  if (!src.includes("[[")) return [];
  const fences = fencedRanges(src);
  const out: WikiLink[] = [];
  WIKI_RE.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = WIKI_RE.exec(src)) !== null) {
    const start = match.index;
    if (inRanges(fences, start)) continue;
    const { target, alias, anchor } = parseInner(match[1]);
    if (!target) continue; // pure `[[#anchor]]` — self-reference, not a note link
    out.push({ raw: match[0], target, alias, anchor, start, end: start + match[0].length });
  }
  return out;
}

/** Normalise a title for matching: case/whitespace/punctuation-insensitive. */
export function normalizeWikiTitle(value: string): string {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[_\-]+/g, " ")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export type TitleIndexEntry = { id: number; title: string };

/**
 * First-wins index of normalised title → report. Titles that normalise to an
 * empty string are skipped.
 */
export function buildTitleIndex(
  reports: readonly TitleIndexEntry[]
): Map<string, TitleIndexEntry> {
  const index = new Map<string, TitleIndexEntry>();
  for (const report of reports) {
    const key = normalizeWikiTitle(report.title);
    if (!key || index.has(key)) continue;
    index.set(key, report);
  }
  return index;
}

/** Resolve a parsed link against a title index. Returns the report or null. */
export function resolveWikiLink(
  link: WikiLink,
  index: Map<string, TitleIndexEntry>
): TitleIndexEntry | null {
  return index.get(normalizeWikiTitle(link.target)) ?? null;
}

export type Backlink = {
  id: number;
  title: string;
  /** Short context around the first `[[...]]` pointing here. */
  snippet: string;
};

/** Surrounding context for a link occurrence (single line, trimmed). */
function linkContext(content: string, link: WikiLink, radius = 90): string {
  const lineStart = content.lastIndexOf("\n", link.start) + 1;
  let lineEnd = content.indexOf("\n", link.end);
  if (lineEnd < 0) lineEnd = content.length;
  let line = content.slice(lineStart, lineEnd).replace(/\s+/g, " ").trim();
  if (line.length <= radius * 2) return line;
  const rel = link.start - lineStart;
  const from = Math.max(0, rel - radius);
  const to = Math.min(line.length, rel + link.raw.length + radius);
  line = line.slice(from, to).trim();
  return `${from > 0 ? "…" : ""}${line}${to < content.length ? "…" : ""}`;
}

export type BacklinkSource = { id: number; title: string; content: string };

/**
 * "Энэ тэмдэглэл рүү заасан бусад тэмдэглэлүүд": every report whose content
 * contains a wiki-link resolving to `reportId`.
 */
export function findBacklinks(
  reportId: number,
  reports: readonly BacklinkSource[]
): Backlink[] {
  const index = buildTitleIndex(reports);
  const out: Backlink[] = [];
  for (const report of reports) {
    if (report.id === reportId) continue;
    if (!report.content || !report.content.includes("[[")) continue;
    for (const link of parseWikiLinks(report.content)) {
      const resolved = resolveWikiLink(link, index);
      if (resolved && resolved.id === reportId) {
        out.push({
          id: report.id,
          title: report.title,
          snippet: stripWikiSyntax(linkContext(report.content, link)),
        });
        break; // one row per linking note
      }
    }
  }
  return out.sort((a, b) => a.title.localeCompare(b.title));
}

export type OutgoingLink = {
  /** Id of the note containing the link. */
  from: number;
  /** Id of the resolved note. */
  to: number;
  /** Display alias used at the link site. */
  alias: string;
};

/** All resolved outgoing wiki-links of one report (deduped by target). */
export function outgoingWikiLinks(
  report: BacklinkSource,
  reports: readonly BacklinkSource[]
): OutgoingLink[] {
  const index = buildTitleIndex(reports);
  const seen = new Set<number>();
  const out: OutgoingLink[] = [];
  for (const link of parseWikiLinks(report.content ?? "")) {
    const resolved = resolveWikiLink(link, index);
    if (!resolved || resolved.id === report.id || seen.has(resolved.id)) continue;
    seen.add(resolved.id);
    out.push({ from: report.id, to: resolved.id, alias: link.alias });
  }
  return out;
}

/** All resolved wiki edges across the vault (for the Atlas overlay). */
export function allWikiEdges(
  reports: readonly BacklinkSource[]
): OutgoingLink[] {
  const index = buildTitleIndex(reports);
  const seen = new Set<string>();
  const out: OutgoingLink[] = [];
  for (const report of reports) {
    if (!report.content || !report.content.includes("[[")) continue;
    for (const link of parseWikiLinks(report.content)) {
      const resolved = resolveWikiLink(link, index);
      if (!resolved || resolved.id === report.id) continue;
      const key = `${report.id}->${resolved.id}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({ from: report.id, to: resolved.id, alias: link.alias });
    }
  }
  return out;
}

/** Unresolved `[[targets]]` across the vault (broken-link / stubs list). */
export function findUnresolvedTargets(
  reports: readonly BacklinkSource[]
): { target: string; usedBy: { id: number; title: string }[] }[] {
  const index = buildTitleIndex(reports);
  const acc = new Map<string, { target: string; usedBy: { id: number; title: string }[] }>();
  for (const report of reports) {
    if (!report.content || !report.content.includes("[[")) continue;
    for (const link of parseWikiLinks(report.content)) {
      if (resolveWikiLink(link, index)) continue;
      const key = normalizeWikiTitle(link.target);
      if (!key) continue;
      let entry = acc.get(key);
      if (!entry) {
        entry = { target: link.target, usedBy: [] };
        acc.set(key, entry);
      }
      if (!entry.usedBy.some(u => u.id === report.id)) {
        entry.usedBy.push({ id: report.id, title: report.title });
      }
    }
  }
  return [...acc.values()].sort((a, b) => b.usedBy.length - a.usedBy.length);
}

/** Replace `[[target|alias]]` with its display text (for excerpts/snippets). */
export function stripWikiSyntax(text: string): string {
  return String(text ?? "").replace(
    /\[\[([^\][\n]+?)\]\]/g,
    (_m, inner: string) => {
      const { alias } = parseInner(inner);
      return alias || inner;
    }
  );
}
