import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getSemanticStatus, refreshCloudVectors, searchSemantic } from "./semantic";
import { getMongoDb } from "./mongodb";

const WORKSPACE = "semantic-test-workspace";

const SEED = [
  {
    id: 101, title: "Linux Privilege Escalation", room: "Linux PrivEsc", source: "THM",
    stage: "Live Fire", tags: ["linux", "suid", "privesc"], status: "Published",
    readTime: "12 min", date: "Sep 14, 2026", excerpt: "SUID binaries",
    content: "find SUID files with the find command then escalate to a root shell",
    updatedAt: new Date("2026-09-14T00:00:00Z"),
  },
  {
    id: 102, title: "AWS IAM Policy Reasoning", room: "CloudGoat", source: "Cloud",
    stage: "Foundations", tags: ["aws", "iam"], status: "Published",
    readTime: "08 min", date: "Sep 12, 2026", excerpt: "wildcard policies",
    content: "overly broad iam permissions allow assuming an admin role",
    updatedAt: new Date("2026-09-12T00:00:00Z"),
  },
  {
    id: 103, title: "Packet Anatomy", room: "Networking Basics", source: "THM",
    stage: "Foundations", tags: ["tcp", "packets"], status: "Published",
    readTime: "05 min", date: "Sep 09, 2026", excerpt: "handshake notes",
    content: "tcp three-way handshake with syn ack and sequence numbers",
    updatedAt: new Date("2026-09-09T00:00:00Z"),
  },
];

beforeEach(async () => {
  const db = await getMongoDb();
  await db!.collection("reports").deleteMany({ workspaceKey: WORKSPACE });
  await db!.collection("vectors").deleteMany({ workspaceKey: WORKSPACE });
  for (const row of SEED) {
    await db!.collection("reports").updateOne(
      { workspaceKey: WORKSPACE, id: row.id },
      { $set: { ...row, workspaceKey: WORKSPACE } },
      { upsert: true }
    );
  }
});

afterEach(() => {
  delete process.env.OPENROUTER_API_KEY;
  delete process.env.OPENROUTER_EMBEDDING_MODEL;
  vi.unstubAllGlobals();
});

describe("searchSemantic (local tier)", () => {
  it("matches a Mongolian intent query to the English privesc note", async () => {
    const { hits, provider } = await searchSemantic(WORKSPACE, "хэрэглэгчийн эрх авах арга");
    expect(provider).toBe("local");
    expect(hits.length).toBeGreaterThan(0);
    expect(hits[0].id).toBe(101);
    expect(hits[0].provider).toBe("local");
  });

  it("matches paraphrases without shared keywords", async () => {
    const { hits } = await searchSemantic(WORKSPACE, "getting root on a linux machine");
    expect(hits[0].id).toBe(101);
  });

  it("respects the limit and returns snippets", async () => {
    const { hits } = await searchSemantic(WORKSPACE, "network packets", { limit: 1 });
    expect(hits).toHaveLength(1);
    expect(hits[0].id).toBe(103);
    expect(typeof hits[0].snippet).toBe("string");
  });

  it("returns [] for blank queries", async () => {
    expect((await searchSemantic(WORKSPACE, "   ")).hits).toEqual([]);
  });

  it("returns [] for unknown workspaces", async () => {
    expect((await searchSemantic("no-such-workspace-key", "linux")).hits).toEqual([]);
  });
});

describe("cloud tier", () => {
  it("status reports local-only when no embedding model is set", async () => {
    const status = await getSemanticStatus(WORKSPACE);
    expect(status.local).toBe(true);
    expect(status.total).toBe(3);
    expect(status.cloud.configured).toBe(false);
  });

  it("refresh is a no-op without configuration and never throws", async () => {
    const result = await refreshCloudVectors(WORKSPACE);
    expect(result).toMatchObject({ scanned: 3, updated: 0, skipped: 3 });
  });

  it("caches cloud vectors and uses them for ranking when configured", async () => {
    process.env.OPENROUTER_API_KEY = "or-test";
    process.env.OPENROUTER_EMBEDDING_MODEL = "test-embed";
    // Deterministic fake embedding space: dimension = (charCode sum) buckets.
    vi.stubGlobal("fetch", vi.fn(async (_url: string, init: any) => {
      const body = JSON.parse(init.body);
      const inputs: string[] = Array.isArray(body.input) ? body.input : [body.input];
      const data = inputs.map(text => {
        const vec = new Array(16).fill(0);
        for (const ch of text.toLowerCase()) vec[ch.charCodeAt(0) % 16] += 1;
        return { embedding: vec };
      });
      return new Response(JSON.stringify({ data }), { status: 200 });
    }));

    const refreshed = await refreshCloudVectors(WORKSPACE, { batch: 10 });
    expect(refreshed.updated).toBe(3);
    const status = await getSemanticStatus(WORKSPACE);
    expect(status.cloud.configured).toBe(true);
    expect(status.cachedCloudVectors).toBe(3);

    const { provider } = await searchSemantic(WORKSPACE, "linux root");
    expect(provider).toBe("openrouter+local");

    // Second refresh finds everything fresh — no paid calls needed.
    const again = await refreshCloudVectors(WORKSPACE, { batch: 10 });
    expect(again.updated).toBe(0);
  });

  it("falls back to local vectors when the cloud call fails", async () => {
    process.env.OPENROUTER_API_KEY = "or-test";
    process.env.OPENROUTER_EMBEDDING_MODEL = "test-embed";
    vi.stubGlobal("fetch", vi.fn(async () => new Response("boom", { status: 500 })));
    const { hits, provider } = await searchSemantic(WORKSPACE, "хэрэглэгчийн эрх авах");
    expect(provider).toBe("local");
    expect(hits[0].id).toBe(101);
  });
});
