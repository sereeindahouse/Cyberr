import { describe, expect, it } from "vitest";
import {
  cosineSimilarity,
  docTextForEmbedding,
  embedText,
  EMBED_DIM,
  expandQueryText,
  fnv1a,
  hybridBlend,
  semanticRank,
} from "./embeddings";

describe("fnv1a / embedText", () => {
  it("is deterministic", () => {
    expect(fnv1a("hello")).toBe(fnv1a("hello"));
    expect(embedText("linux privesc")).toEqual(embedText("linux privesc"));
  });

  it("produces L2-normalised vectors of EMBED_DIM", () => {
    const v = embedText("some text here");
    expect(v).toHaveLength(EMBED_DIM);
    const norm = Math.sqrt(v.reduce((s, x) => s + x * x, 0));
    expect(norm).toBeCloseTo(1, 6);
  });

  it("returns a zero vector for empty input", () => {
    expect(embedText("   ")).toEqual(new Array(EMBED_DIM).fill(0));
  });

  it("self-similarity is 1 and unrelated texts score low", () => {
    const a = embedText("linux privilege escalation suid sudo");
    const b = embedText("linux privilege escalation suid sudo");
    const c = embedText("chocolate cake recipe vanilla frosting");
    expect(cosineSimilarity(a, b)).toBeCloseTo(1, 6);
    expect(cosineSimilarity(a, c)).toBeLessThan(0.6);
  });
});

describe("expandQueryText", () => {
  it("expands Mongolian cyber phrases to English", () => {
    const expanded = expandQueryText("хэрэглэгчийн эрх авах");
    expect(expanded).toContain("privesc");
    expect(expanded).toContain("privilege escalation");
  });

  it("expands English shorthand aliases", () => {
    expect(expandQueryText("privesc via cron")).toContain("privilege escalation");
    expect(expandQueryText("LFI in upload")).toContain("local file inclusion");
  });

  it("returns empty string for blank queries", () => {
    expect(expandQueryText("   ")).toBe("");
  });
});

const docs = [
  { id: 1, title: "Linux Privilege Escalation", tags: ["linux", "suid", "privesc"], excerpt: "SUID binaries", content: "find SUID files with find command then escalate to root shell" },
  { id: 2, title: "AWS IAM Policy Reasoning", tags: ["aws", "iam"], excerpt: "wildcard policies", content: "overly broad iam permissions allow role assumption" },
  { id: 3, title: "Packet Anatomy", tags: ["tcp", "packets"], excerpt: "handshake notes", content: "tcp three-way handshake syn ack sequence numbers" },
];

describe("semanticRank", () => {
  it("matches Mongolian intent to the English privesc note", () => {
    const hits = semanticRank("хэрэглэгчийн эрх авах арга", docs);
    expect(hits.length).toBeGreaterThan(0);
    expect(hits[0].id).toBe(1);
  });

  it("matches paraphrases without shared keywords", () => {
    const hits = semanticRank("getting root on a linux box", docs);
    expect(hits[0].id).toBe(1);
  });

  it("prefers network content for packet questions", () => {
    const hits = semanticRank("how does tcp handshake work", docs);
    expect(hits[0].id).toBe(3);
  });

  it("returns [] for blank queries", () => {
    expect(semanticRank("  ", docs)).toEqual([]);
  });

  it("reuses cached vectors", () => {
    const cache = new Map<number, readonly number[]>();
    for (const d of docs) cache.set(d.id, embedText(docTextForEmbedding(d)));
    const fresh = semanticRank("root shell", docs);
    const cached = semanticRank("root shell", docs, cache);
    expect(cached).toEqual(fresh);
  });
});

describe("hybridBlend", () => {
  it("merges fuzzy + semantic rankings into one ordering", () => {
    const blended = hybridBlend(
      [{ id: 1, score: 0.9 }, { id: 2, score: 0.2 }],
      [{ id: 2, score: 0.8 }, { id: 3, score: 0.7 }]
    );
    const ids = blended.map(h => h.id);
    expect(ids).toContain(1);
    expect(ids).toContain(2);
    expect(ids).toContain(3);
    expect(blended[0].score).toBeGreaterThanOrEqual(blended[1].score);
  });
});
