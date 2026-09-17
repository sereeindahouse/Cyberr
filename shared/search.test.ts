import { describe, expect, it } from "vitest";
import {
  bestSnippet,
  extractSnippet,
  fuzzyReportScore,
  fuzzyTokenScore,
  levenshtein,
  matchesFilters,
  parseSearchQuery,
  rankFuzzy,
  type SearchableReport,
} from "./search";

describe("parseSearchQuery", () => {
  it("splits filters from free text", () => {
    const q = parseSearchQuery('privesc tag:linux stage:"live fire" status:draft');
    expect(q.text).toBe("privesc");
    expect(q.tokens).toEqual(["privesc"]);
    expect(q.filters.tags).toEqual(["linux"]);
    expect(q.filters.stages).toEqual(["live fire"]);
    expect(q.filters.statuses).toEqual(["draft"]);
  });

  it("accepts aliases and is case-insensitive", () => {
    const q = parseSearchQuery("TAG:Linux SRC:thm DATE:2026-09");
    expect(q.text).toBe("");
    expect(q.filters.tags).toEqual(["linux"]);
    expect(q.filters.sources).toEqual(["thm"]);
    expect(q.filters.dates).toEqual(["2026-09"]);
  });

  it("keeps unknown key:value pairs as text", () => {
    const q = parseSearchQuery("foo:bar hello");
    expect(q.text).toBe("foo:bar hello");
  });
});

describe("levenshtein", () => {
  it("computes small distances and bails out past max", () => {
    expect(levenshtein("linux", "linxu")).toBe(2);
    expect(levenshtein("same", "same")).toBe(0);
    expect(levenshtein("abcdef", "xyz", 2)).toBeGreaterThan(2);
  });
});

describe("fuzzyTokenScore", () => {
  it("scores exact and prefix matches highest", () => {
    expect(fuzzyTokenScore("linux", "Linux PrivEsc")).toBe(1);
    expect(fuzzyTokenScore("priv", "Linux PrivEsc")).toBeGreaterThanOrEqual(0.9);
  });

  it("tolerates typos", () => {
    expect(fuzzyTokenScore("linxu", "install linux today")).toBeGreaterThan(0.4);
    expect(fuzzyTokenScore("privesk", "linux privesc escalation")).toBeGreaterThan(0.4);
  });

  it("rejects unrelated tokens", () => {
    expect(fuzzyTokenScore("banana", "linux privilege escalation")).toBe(0);
    expect(fuzzyTokenScore("q", "linux")).toBe(0);
  });
});

const reports: SearchableReport[] = [
  {
    id: 1, title: "Linux Privilege Escalation", room: "Linux PrivEsc", source: "THM",
    stage: "Live Fire", tags: ["linux", "suid"], status: "Published",
    date: "Sep 14, 2026", excerpt: "SUID binaries", content: "find SUID files and escalate to root",
  },
  {
    id: 2, title: "AWS IAM Policy Reasoning", room: "CloudGoat", source: "Cloud",
    stage: "Foundations", tags: ["aws", "iam"], status: "Draft",
    date: "Sep 12, 2026", excerpt: "wildcard policies", content: "overly broad iam permissions",
  },
  {
    id: 3, title: "Packet Anatomy", room: "Networking Basics", source: "THM",
    stage: "Foundations", tags: ["tcp", "packets"], status: "Published",
    date: "Aug 30, 2026", excerpt: "handshake notes", content: "tcp three-way handshake",
  },
];

describe("matchesFilters", () => {
  it("ANDs tag/stage/status/source/date filters", () => {
    const q = parseSearchQuery("tag:linux status:published source:thm date:2026-09");
    expect(reports.filter(r => matchesFilters(r, q.filters)).map(r => r.id)).toEqual([1]);
  });

  it("matches year-only dates and stage substrings", () => {
    const q = parseSearchQuery("date:2026 stage:found");
    expect(reports.filter(r => matchesFilters(r, q.filters)).map(r => r.id).sort()).toEqual([2, 3]);
  });
});

describe("rankFuzzy", () => {
  it("finds typo'd queries and ranks title hits first", () => {
    const ranked = rankFuzzy(reports, parseSearchQuery("linxu privileg"));
    expect(ranked[0].report.id).toBe(1);
    expect(ranked[0].score).toBeGreaterThan(0.1);
  });

  it("returns nothing relevant for gibberish", () => {
    expect(rankFuzzy(reports, parseSearchQuery("zzzqqqxxx"))).toEqual([]);
  });

  it("keeps filter-only queries in stable order", () => {
    const ranked = rankFuzzy(reports, parseSearchQuery("status:published"));
    expect(ranked.map(r => r.report.id).sort()).toEqual([1, 3]);
  });

  it("combines filters with fuzzy text", () => {
    const ranked = rankFuzzy(reports, parseSearchQuery("handshake source:thm"));
    expect(ranked.map(r => r.report.id)).toEqual([3]);
  });
});

describe("fuzzyReportScore", () => {
  it("weights titles above body text", () => {
    const titleHit = fuzzyReportScore(reports[0], ["escalation"]);
    const bodyOnly: SearchableReport = { ...reports[0], title: "Unrelated", tags: [], room: "x", excerpt: "" };
    expect(titleHit).toBeGreaterThan(fuzzyReportScore(bodyOnly, ["escalation"]));
  });
});

describe("extractSnippet / bestSnippet", () => {
  it("returns a window around hits with relative ranges", () => {
    const content = "alpha ".repeat(40) + "needle in the haystack here " + "omega ".repeat(40);
    const s = extractSnippet(content, ["needle"]);
    expect(s.text).toContain("needle");
    expect(s.text.startsWith("…")).toBe(true);
    for (const r of s.ranges) {
      expect(s.text.slice(r.start, r.end).toLowerCase()).toBe("needle");
    }
  });

  it("prefers title matches over body", () => {
    const s = bestSnippet(reports[0], ["escalation"]);
    expect(s.field).toBe("title");
    expect(s.ranges.length).toBeGreaterThan(0);
  });

  it("falls back to head excerpt without tokens", () => {
    expect(bestSnippet(reports[1], []).text).toContain("wildcard");
  });
});
