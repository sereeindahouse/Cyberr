/**
 * Server-side semantic search over the synced workspace.
 *
 * Two tiers, same cosine-similarity interface:
 *  1. **Local vectors** (always on, free, offline-friendly): deterministic
 *     hash embeddings from `@shared/embeddings` — including the
 *     Mongolian↔English cybersecurity glossary, so "хэрэглэгчийн эрх авах"
 *     matches a "Privilege escalation" note with zero network calls.
 *  2. **OpenRouter embeddings** (opt-in via `OPENROUTER_EMBEDDING_MODEL`):
 *     real transformer vectors, cached per (workspace, report, content-hash)
 *     in the `vectors` collection so each note is embedded once and every
 *     search only pays for the short query string.
 *
 * The browser always ships tier 1 for instant offline ranking; it calls this
 * endpoint to upgrade to tier 2 when the server reports it configured.
 */
import {
  cosineSimilarity,
  docTextForEmbedding,
  embedText,
  expandQueryText,
  type SemanticDoc,
} from "@shared/embeddings";
import { bestSnippet } from "@shared/search";
import { getMongoDb } from "./mongodb";
import { reportHash } from "./insights";
import { openRouterEmbed, openRouterEmbeddingConfig } from "./openrouter";

export type SemanticSearchHit = {
  id: number;
  title: string;
  source: string;
  stage: string;
  tags: string[];
  excerpt: string;
  /** 0..1 blended score (higher = more relevant). */
  score: number;
  /** Which vector space produced the winning score. */
  provider: "local" | "openrouter";
  snippet: string;
};

export type SemanticStatus = {
  local: true;
  dim: number;
  cloud: { configured: boolean; model: string };
  /** Reports in the workspace / cached cloud vectors for the active model. */
  total: number;
  cachedCloudVectors: number;
};

type WorkspaceDoc = SemanticDoc & {
  source: string;
  stage: string;
  excerpt: string;
  content: string;
  updatedAt?: unknown;
};

async function loadWorkspaceDocs(workspaceKey: string): Promise<WorkspaceDoc[]> {
  const db = await getMongoDb();
  if (!db) return [];
  const rows = (await db
    .collection("reports")
    .find({ workspaceKey })
    .project({ id: 1, title: 1, tags: 1, source: 1, stage: 1, excerpt: 1, content: 1, updatedAt: 1 })
    .toArray()) as any[];
  return rows
    .filter(r => typeof r.id === "number")
    .map(r => ({
      id: r.id,
      title: String(r.title ?? ""),
      tags: Array.isArray(r.tags) ? r.tags.filter((t: unknown) => typeof t === "string") : [],
      source: String(r.source ?? "Cyber"),
      stage: String(r.stage ?? "Foundations"),
      excerpt: String(r.excerpt ?? ""),
      content: String(r.content ?? ""),
      updatedAt: r.updatedAt,
    }));
}

type CachedVector = {
  workspaceKey: string;
  id: number;
  model: string;
  hash: string;
  vector: number[];
};

async function readCachedVectors(
  workspaceKey: string,
  ids: number[],
  model: string
): Promise<Map<number, CachedVector>> {
  const out = new Map<number, CachedVector>();
  if (!ids.length) return out;
  const db = await getMongoDb();
  if (!db) return out;
  const rows = (await db
    .collection<CachedVector>("vectors")
    .find({ workspaceKey, model })
    .toArray()) as CachedVector[];
  const wanted = new Set(ids);
  for (const row of rows) {
    if (wanted.has(row.id) && Array.isArray(row.vector) && row.vector.length > 8) {
      out.set(row.id, row);
    }
  }
  return out;
}

async function writeCachedVectors(rows: CachedVector[]): Promise<void> {
  if (!rows.length) return;
  const db = await getMongoDb();
  if (!db) return;
  const col = db.collection<CachedVector>("vectors");
  await col.bulkWrite(
    rows.map(row => ({
      updateOne: {
        filter: { workspaceKey: row.workspaceKey, id: row.id, model: row.model },
        update: { $set: row },
        upsert: true,
      },
    }))
  );
}

function docHash(doc: WorkspaceDoc): string {
  return reportHash({
    id: doc.id,
    title: doc.title,
    content: doc.content,
    tags: doc.tags,
    source: doc.source,
    stage: doc.stage,
    updatedAt: doc.updatedAt as string | Date | undefined,
  });
}

export async function getSemanticStatus(workspaceKey: string): Promise<SemanticStatus> {
  const emb = openRouterEmbeddingConfig();
  const docs = await loadWorkspaceDocs(workspaceKey);
  let cachedCloudVectors = 0;
  if (emb.configured && docs.length) {
    const cached = await readCachedVectors(workspaceKey, docs.map(d => d.id), emb.model);
    cachedCloudVectors = cached.size;
  }
  const { EMBED_DIM } = await import("@shared/embeddings");
  return {
    local: true,
    dim: EMBED_DIM,
    cloud: { configured: emb.configured, model: emb.model },
    total: docs.length,
    cachedCloudVectors,
  };
}

export async function searchSemantic(
  workspaceKey: string,
  query: string,
  options: { limit?: number } = {}
): Promise<{ hits: SemanticSearchHit[]; provider: "local" | "openrouter+local" }> {
  const limit = Math.min(Math.max(options.limit ?? 10, 1), 50);
  const trimmed = String(query ?? "").trim().slice(0, 500);
  if (!trimmed) return { hits: [], provider: "local" };
  const docs = await loadWorkspaceDocs(workspaceKey);
  if (!docs.length) return { hits: [], provider: "local" };

  // Tier 1 — local hash vectors over every doc (cheap enough per request).
  const expanded = expandQueryText(trimmed);
  const qLocal = embedText(expanded);
  const localScores = new Map<number, number>();
  for (const doc of docs) {
    const score = cosineSimilarity(qLocal, embedText(docTextForEmbedding(doc)));
    if (score > 0.02) localScores.set(doc.id, score);
  }

  // Tier 2 — OpenRouter vectors for docs that already have cached embeddings
  // under the active model (missing ones keep their local score; nothing here
  // triggers a paid call except the single short query embedding).
  const emb = openRouterEmbeddingConfig();
  const cloudScores = new Map<number, number>();
  let cloudUsed = false;
  if (emb.configured) {
    try {
      const cached = await readCachedVectors(workspaceKey, docs.map(d => d.id), emb.model);
      if (cached.size > 0) {
        const [qCloud] = await openRouterEmbed([trimmed]);
        for (const doc of docs) {
          const row = cached.get(doc.id);
          if (!row || row.hash !== docHash(doc)) continue; // stale → local score stands
          const score = cosineSimilarity(qCloud, row.vector);
          if (score > 0.05) {
            cloudScores.set(doc.id, score);
            cloudUsed = true;
          }
        }
      }
    } catch {
      // Cloud failure never breaks search — local scores stand.
    }
  }

  const localMax = Math.max(0.0001, ...localScores.values());
  const cloudMax = Math.max(0.0001, ...cloudScores.values());
  const byId = new Map(docs.map(d => [d.id, d]));
  const tokens = trimmed.split(/\s+/).filter(Boolean);
  const hits: SemanticSearchHit[] = [];
  const ids = new Set([...localScores.keys(), ...cloudScores.keys()]);
  for (const id of ids) {
    const doc = byId.get(id);
    if (!doc) continue;
    const ln = (localScores.get(id) ?? 0) / localMax;
    const cn = (cloudScores.get(id) ?? 0) / cloudMax;
    // Cloud wins ties: when both fire, the transformer vector is trusted more.
    const score = Math.max(ln * 0.85, cn);
    const provider = cn >= ln * 0.85 && cloudScores.has(id) ? "openrouter" : "local";
    const snippet = bestSnippet(
      {
        id: doc.id, title: doc.title, room: "", source: doc.source, stage: doc.stage,
        tags: doc.tags, status: "Published", date: "", excerpt: doc.excerpt, content: doc.content,
      },
      tokens
    );
    hits.push({
      id, title: doc.title, source: doc.source, stage: doc.stage, tags: doc.tags,
      excerpt: doc.excerpt, score: Math.round(score * 1000) / 1000, provider, snippet: snippet.text,
    });
  }
  hits.sort((a, b) => b.score - a.score);
  return { hits: hits.slice(0, limit), provider: cloudUsed ? "openrouter+local" : "local" };
}

/**
 * Pre-compute + cache OpenRouter vectors for docs that lack a fresh one.
 * Capped per call so a single refresh can't trigger hundreds of paid
 * embeddings; call repeatedly (or on a schedule) for large vaults.
 */
export async function refreshCloudVectors(
  workspaceKey: string,
  options: { batch?: number } = {}
): Promise<{ scanned: number; updated: number; skipped: number; model: string }> {
  const batch = Math.min(Math.max(options.batch ?? 12, 1), 50);
  const emb = openRouterEmbeddingConfig();
  const docs = await loadWorkspaceDocs(workspaceKey);
  const result = { scanned: docs.length, updated: 0, skipped: 0, model: emb.model };
  if (!emb.configured || !docs.length) {
    result.skipped = docs.length;
    return result;
  }
  const cached = await readCachedVectors(workspaceKey, docs.map(d => d.id), emb.model);
  const stale = docs.filter(doc => {
    const row = cached.get(doc.id);
    return !row || row.hash !== docHash(doc);
  });
  const todo = stale.slice(0, batch);
  result.skipped = docs.length - todo.length;
  if (!todo.length) return result;
  const vectors = await openRouterEmbed(todo.map(docTextForEmbedding));
  await writeCachedVectors(
    todo.map((doc, i) => ({
      workspaceKey, id: doc.id, model: emb.model, hash: docHash(doc), vector: vectors[i],
    }))
  );
  result.updated = todo.length;
  return result;
}
