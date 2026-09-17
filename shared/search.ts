/**
 * Search 2.0 — typo-tolerant fuzzy search with field filters and highlighted
 * snippets. Framework-free: used by the reports list, the command palette and
 * (via re-export) the server-side semantic endpoint for hybrid ranking.
 *
 * Query grammar:
 *   free text words            matched fuzzily against title/tags/room/content
 *   tag:linux                  exact tag match (case-insensitive)
 *   stage:"live fire"          substring match on stage
 *   status:draft|published     status match
 *   source:thm                 source match (thm/picoctf/htb/cloud/cyber)
 *   date:2026-09               prefix match on parsed date (YYYY or YYYY-MM or full)
 */

export type SearchFilters = {
  tags: string[];
  stages: string[];
  statuses: string[];
  sources: string[];
  dates: string[];
};

export type ParsedQuery = {
  /** Free-text remainder (filters stripped). */
  text: string;
  /** Individual free-text tokens. */
  tokens: string[];
  filters: SearchFilters;
};

const FILTER_KEYS: Record<string, keyof SearchFilters> = {
  tag: "tags",
  tags: "tags",
  stage: "stages",
  status: "statuses",
  state: "statuses",
  source: "sources",
  src: "sources",
  date: "dates",
  day: "dates",
};

// `key:"quoted value"` must tokenize as ONE token even though it contains a
// space, so the filter-with-quotes alternative comes first.
const TOKEN_RE = /[^\s"']+:"[^"]*"|[^\s"']+:'[^']*'|"([^"]+)"|'([^']+)'|(\S+)/g;

export function emptyFilters(): SearchFilters {
  return { tags: [], stages: [], statuses: [], sources: [], dates: [] };
}

export function parseSearchQuery(raw: string): ParsedQuery {
  const filters = emptyFilters();
  const textParts: string[] = [];
  const input = String(raw ?? "");
  TOKEN_RE.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = TOKEN_RE.exec(input)) !== null) {
    // Groups 1-3 are the quoted/plain alternatives; the `key:"..."` filter
    // alternatives carry no group, so fall back to the whole match.
    const token = (match[1] ?? match[2] ?? match[3] ?? match[0] ?? "").trim();
    if (!token) continue;
    const colon = token.indexOf(":");
    if (colon > 0) {
      const key = token.slice(0, colon).toLowerCase();
      const field = FILTER_KEYS[key];
      const value = token.slice(colon + 1).trim().replace(/^["']|["']$/g, "");
      if (field && value) {
        filters[field].push(value.toLowerCase());
        continue;
      }
    }
    textParts.push(token);
  }
  const text = textParts.join(" ").trim();
  return { text, tokens: text ? textParts : [], filters };
}

export function hasActiveFilters(filters: SearchFilters): boolean {
  return (
    filters.tags.length > 0 ||
    filters.stages.length > 0 ||
    filters.statuses.length > 0 ||
    filters.sources.length > 0 ||
    filters.dates.length > 0
  );
}

/** Bounded Levenshtein distance (early exit past `max`). */
export function levenshtein(a: string, b: string, max = 3): number {
  if (a === b) return 0;
  let s = a;
  let t = b;
  if (s.length > t.length) [s, t] = [t, s];
  const n = s.length;
  const m = t.length;
  if (m - n > max) return max + 1;
  let prev = new Array<number>(n + 1);
  let curr = new Array<number>(n + 1);
  for (let i = 0; i <= n; i++) prev[i] = i;
  for (let j = 1; j <= m; j++) {
    curr[0] = j;
    let rowMin = curr[0];
    const tj = t.charAt(j - 1);
    for (let i = 1; i <= n; i++) {
      const cost = s.charAt(i - 1) === tj ? 0 : 1;
      curr[i] = Math.min(prev[i] + 1, curr[i - 1] + 1, prev[i - 1] + cost);
      if (curr[i] < rowMin) rowMin = curr[i];
    }
    if (rowMin > max) return max + 1;
    [prev, curr] = [curr, prev];
  }
  return prev[n];
}

function tokenizeHaystack(text: string): string[] {
  return String(text ?? "")
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter(t => t.length >= 2);
}

/**
 * Similarity of one needle token against a haystack string, 0..1.
 * 1.0 = exact substring · 0.85 = word-prefix · 0.6..0.8 = small typo
 * (bounded edit distance) · 0.35 = subsequence fallback.
 */
export function fuzzyTokenScore(needleRaw: string, haystackRaw: string): number {
  const needle = needleRaw.toLowerCase().trim();
  const haystack = haystackRaw.toLowerCase();
  if (!needle || !haystack) return 0;
  if (haystack.includes(needle)) {
    // Bonus when the match starts a word — "priv" ≈ "privilege".
    const idx = haystack.indexOf(needle);
    const atBoundary = idx === 0 || /[^\p{L}\p{N}]/u.test(haystack.charAt(idx - 1));
    return atBoundary ? 1 : 0.9;
  }
  if (needle.length < 3) return 0;
  let best = 0;
  const maxDist = needle.length <= 4 ? 1 : needle.length <= 7 ? 2 : 3;
  for (const word of tokenizeHaystack(haystack)) {
    if (Math.abs(word.length - needle.length) > maxDist + 1) {
      // still allow prefix matches on much longer words
      if (!(word.startsWith(needle) || needle.startsWith(word.slice(0, needle.length)))) {
        if (!word.startsWith(needle.slice(0, Math.max(3, needle.length - 1)))) continue;
      }
    }
    if (word.startsWith(needle) || needle.startsWith(word)) {
      best = Math.max(best, 0.85);
      continue;
    }
    const dist = levenshtein(needle, word, maxDist);
    if (dist <= maxDist) {
      best = Math.max(best, 0.8 - (dist / Math.max(needle.length, word.length)) * 0.5);
    }
  }
  if (best > 0) return best;
  // Subsequence fallback: "lnx" ≈ "linux".
  outer: for (const word of tokenizeHaystack(haystack)) {
    let j = 0;
    for (let i = 0; i < word.length && j < needle.length; i++) {
      if (word.charAt(i) === needle.charAt(j)) j++;
    }
    if (j === needle.length) {
      best = Math.max(best, 0.35);
      break outer;
    }
  }
  return best;
}

export type SearchableReport = {
  id: number;
  title: string;
  room: string;
  source: string;
  stage: string;
  tags: string[];
  status: string;
  date: string;
  excerpt: string;
  content: string;
  archived?: boolean;
};

const FIELD_WEIGHTS = {
  title: 3.2,
  tags: 2.4,
  room: 1.6,
  excerpt: 1.2,
  content: 1.0,
} as const;

function fieldTexts(report: SearchableReport): { text: string; weight: number }[] {
  return [
    { text: report.title, weight: FIELD_WEIGHTS.title },
    { text: (report.tags ?? []).join(" "), weight: FIELD_WEIGHTS.tags },
    { text: report.room, weight: FIELD_WEIGHTS.room },
    { text: report.excerpt ?? "", weight: FIELD_WEIGHTS.excerpt },
    { text: String(report.content ?? "").slice(0, 4000), weight: FIELD_WEIGHTS.content },
  ];
}

/** Weighted fuzzy score of free-text tokens against a report, 0..~1. */
export function fuzzyReportScore(report: SearchableReport, tokens: string[]): number {
  if (!tokens.length) return 0;
  const fields = fieldTexts(report);
  const totalWeight = fields.reduce((sum, f) => sum + f.weight, 0);
  let acc = 0;
  for (const token of tokens) {
    let best = 0;
    for (const field of fields) {
      const s = fuzzyTokenScore(token, field.text);
      if (s > 0) best = Math.max(best, s * field.weight);
    }
    acc += best / totalWeight;
  }
  return acc / tokens.length;
}

function isoPrefixOf(dateStr: string): string {
  const d = new Date(String(dateStr ?? ""));
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Hard field filters (AND semantics). Unknown free text is ignored here. */
export function matchesFilters(report: SearchableReport, filters: SearchFilters): boolean {
  for (const tag of filters.tags) {
    if (!(report.tags ?? []).some(t => t.toLowerCase() === tag || t.toLowerCase().includes(tag))) {
      return false;
    }
  }
  for (const stage of filters.stages) {
    if (!String(report.stage ?? "").toLowerCase().includes(stage)) return false;
  }
  for (const status of filters.statuses) {
    const want = status.toLowerCase();
    const actual = String(report.status ?? "").toLowerCase();
    if (want === "archive" || want === "archived") {
      if (!report.archived) return false;
    } else if (actual !== want && !actual.includes(want)) {
      return false;
    }
  }
  for (const source of filters.sources) {
    if (!String(report.source ?? "").toLowerCase().includes(source)) return false;
  }
  for (const date of filters.dates) {
    const want = date.replace(/[./]/g, "-");
    const iso = isoPrefixOf(report.date);
    if (!iso || !iso.startsWith(want)) return false;
  }
  return true;
}

export type RankedReport<T extends SearchableReport> = {
  report: T;
  /** 0..1 blend-ready score (filters already applied). */
  score: number;
};

export const FUZZY_SCORE_CUTOFF = 0.08;

/**
 * Filter + fuzzy-rank a report list. Empty free text keeps filter-matching
 * order (stable by id desc); otherwise fuzzy score desc.
 */
export function rankFuzzy<T extends SearchableReport>(
  reports: readonly T[],
  query: ParsedQuery
): RankedReport<T>[] {
  const filtered = reports.filter(r => matchesFilters(r, query.filters));
  if (!query.tokens.length) {
    return filtered.map(report => ({ report, score: 1 }));
  }
  const ranked: RankedReport<T>[] = [];
  for (const report of filtered) {
    const score = fuzzyReportScore(report, query.tokens);
    if (score >= FUZZY_SCORE_CUTOFF) ranked.push({ report, score });
  }
  ranked.sort((a, b) => b.score - a.score || b.report.id - a.report.id);
  return ranked;
}

export type HighlightRange = { start: number; end: number };

export type Snippet = {
  text: string;
  ranges: HighlightRange[];
  /** Which field the snippet came from. */
  field: "title" | "tags" | "room" | "excerpt" | "content";
};

/** Find case-insensitive occurrences of tokens (exact substrings). */
function exactRanges(text: string, tokens: string[]): HighlightRange[] {
  const lower = text.toLowerCase();
  const ranges: HighlightRange[] = [];
  for (const token of tokens) {
    const needle = token.toLowerCase();
    if (needle.length < 2) continue;
    let from = 0;
    for (;;) {
      const idx = lower.indexOf(needle, from);
      if (idx < 0) break;
      ranges.push({ start: idx, end: idx + needle.length });
      from = idx + needle.length;
    }
  }
  return mergeRanges(ranges);
}

function mergeRanges(ranges: HighlightRange[]): HighlightRange[] {
  const sorted = [...ranges].sort((a, b) => a.start - b.start || a.end - b.end);
  const out: HighlightRange[] = [];
  for (const r of sorted) {
    const last = out[out.length - 1];
    if (last && r.start <= last.end + 1) {
      last.end = Math.max(last.end, r.end);
    } else {
      out.push({ ...r });
    }
  }
  return out;
}

/**
 * Best ~180-char window of `content` covering the most token hits, with
 * highlight ranges relative to the returned text.
 */
export function extractSnippet(
  content: string,
  tokens: string[],
  windowSize = 180
): Snippet {
  const clean = String(content ?? "").replace(/\s+/g, " ").trim();
  if (!clean) return { text: "", ranges: [], field: "content" };
  const ranges = exactRanges(clean, tokens);
  if (!ranges.length) {
    const head = clean.slice(0, windowSize).trimEnd();
    return { text: clean.length > windowSize ? `${head}…` : head, ranges: [], field: "content" };
  }
  // Densest window: slide over hit starts.
  let bestStart = 0;
  let bestHits = -1;
  for (const r of ranges) {
    const start = Math.max(0, r.start - 40);
    const end = start + windowSize;
    const hits = ranges.filter(x => x.start >= start && x.end <= end).length;
    if (hits > bestHits) {
      bestHits = hits;
      bestStart = start;
    }
  }
  let start = bestStart;
  // Snap to a word boundary.
  const space = clean.indexOf(" ", start);
  if (space >= 0 && space - start < 24) start = space + 1;
  let end = Math.min(clean.length, start + windowSize);
  const endSpace = clean.lastIndexOf(" ", end);
  if (end < clean.length && endSpace > start + windowSize * 0.6) end = endSpace;
  const prefix = start > 0 ? "…" : "";
  const suffix = end < clean.length ? "…" : "";
  const text = `${prefix}${clean.slice(start, end).trim()}${suffix}`;
  const shift = start - prefix.length;
  const rel = ranges
    .filter(r => r.end > start && r.start < end)
    .map(r => ({
      start: Math.max(0, r.start - shift),
      end: Math.min(text.length, r.end - shift),
    }))
    .filter(r => r.end > r.start);
  return { text, ranges: mergeRanges(rel), field: "content" };
}

/** Pick the most relevant field + snippet for a ranked hit. */
export function bestSnippet<T extends SearchableReport>(
  report: T,
  tokens: string[]
): Snippet {
  if (!tokens.length) {
    const head = String(report.excerpt || report.content || "").replace(/\s+/g, " ").trim().slice(0, 180);
    return { text: head, ranges: [], field: "excerpt" };
  }
  const fields: { text: string; field: Snippet["field"] }[] = [
    { text: report.title, field: "title" },
    { text: (report.tags ?? []).join(" "), field: "tags" },
    { text: report.excerpt ?? "", field: "excerpt" },
  ];
  for (const f of fields) {
    const ranges = exactRanges(f.text, tokens);
    if (ranges.length) return { text: f.text, ranges, field: f.field };
  }
  return extractSnippet(report.content ?? "", tokens);
}
