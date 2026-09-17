import crypto from "node:crypto";
import { getMongoDb } from "./mongodb";
import { aiConfig, analyzeLocal, parseJsonObject } from "./aiAnalyzer";
import { extractConcepts } from "@shared/textModel";

export type Insight = {
  id: number;
  title: string;
  source: string;
  stage: string;
  tags: string[];
  summary: string;
  concepts: string[];
  steps: string[];
  provider: "local" | "moonshot";
  model?: string;
};

export type Relation = {
  source: number;
  target: number;
  weight: number;
  reason: string;
};

export type InsightsSnapshot = {
  provider: "local" | "moonshot";
  model?: string;
  analyzed: number;
  total: number;
  computedAt: string;
};

export type InsightsResult = {
  snapshot: InsightsSnapshot;
  insights: Insight[];
  relations: Relation[];
};

type ReportForInsight = {
  id: number;
  title: string;
  content: string;
  tags: string[];
  source: string;
  stage: string;
  updatedAt?: string | Date;
};

const AI_CHUNK = 14;
const AI_CONTENT_CHARS = 2200;
const AI_MAX_CALLS = 8;

function toISO(v: string | Date | undefined): string {
  if (!v) return "";
  if (v instanceof Date) return v.toISOString();
  const d = new Date(v);
  if (!Number.isNaN(d.getTime())) return d.toISOString();
  return String(v);
}

export function reportHash(report: ReportForInsight): string {
  const parts = [
    String(report.id),
    report.title ?? "",
    report.content ?? "",
    (report.tags ?? []).join(","),
    toISO(report.updatedAt),
  ];
  const joined = parts.join("\u0000");
  const sha = crypto.createHash("sha1").update(joined).digest("hex");
  return sha.slice(0, 16);
}

export function localInsight(report: ReportForInsight): Insight {
  const result = analyzeLocal(report.content ?? "", 8);
  return {
    id: report.id,
    title: report.title,
    source: report.source,
    stage: report.stage,
    tags: report.tags ?? [],
    summary: result.summary,
    concepts: result.concepts,
    steps: result.steps,
    provider: "local",
    model: result.model,
  };
}

export function buildLocalRelations(
  reports: ReportForInsight[],
  insights: Insight[],
  options: { minWeight?: number; perReport?: number; limit?: number } = {}
): Relation[] {
  const minWeight = options.minWeight ?? 0.18;
  const perReport = options.perReport ?? 6;
  const limit = options.limit ?? 400;

  const insightMap = new Map<number, Insight>();
  for (const ins of insights) insightMap.set(ins.id, ins);

  const tagMap = new Map<number, Set<string>>();
  const conceptMap = new Map<number, Set<string>>();

  for (const r of reports) {
    const tags = new Set((r.tags ?? []).map(t => String(t).toLowerCase().trim()).filter(Boolean));
    tagMap.set(r.id, tags);
    const ins = insightMap.get(r.id);
    const concepts = new Set((ins?.concepts ?? []).map(c => String(c).toLowerCase().trim()).filter(Boolean));
    conceptMap.set(r.id, concepts);
  }

  const allRelations: Relation[] = [];

  for (let i = 0; i < reports.length; i++) {
    for (let j = i + 1; j < reports.length; j++) {
      const a = reports[i];
      const b = reports[j];
      const tagsA = tagMap.get(a.id) ?? new Set();
      const tagsB = tagMap.get(b.id) ?? new Set();
      const conceptsA = conceptMap.get(a.id) ?? new Set();
      const conceptsB = conceptMap.get(b.id) ?? new Set();

      const sharedTags: string[] = [];
      for (const t of tagsA) if (tagsB.has(t)) sharedTags.push(t);
      const sharedConcepts: string[] = [];
      for (const c of conceptsA) if (conceptsB.has(c)) sharedConcepts.push(c);

      const minTagSize = Math.min(tagsA.size, tagsB.size);
      const minConceptSize = Math.min(conceptsA.size, conceptsB.size);
      const tagScore = minTagSize > 0 ? sharedTags.length / minTagSize : 0;
      const conceptScore = minConceptSize > 0 ? sharedConcepts.length / minConceptSize : 0;

      const weight = 0.6 * tagScore + 0.4 * conceptScore;
      if (weight < minWeight) continue;
      if (sharedTags.length === 0 && sharedConcepts.length === 0) continue;

      let reason: string;
      if (sharedTags.length >= sharedConcepts.length && sharedTags.length > 0) {
        reason = `нийтлэг шошго: ${sharedTags.slice(0, 3).join(", ")}`;
      } else {
        reason = `нийтлэг ойлголт: ${sharedConcepts.slice(0, 3).join(", ")}`;
      }

      allRelations.push({
        source: a.id,
        target: b.id,
        weight: Math.round(weight * 1000) / 1000,
        reason,
      });
    }
  }

  // per-report top
  const byReport = new Map<number, Relation[]>();
  for (const rel of allRelations) {
    if (!byReport.has(rel.source)) byReport.set(rel.source, []);
    if (!byReport.has(rel.target)) byReport.set(rel.target, []);
    byReport.get(rel.source)!.push(rel);
    byReport.get(rel.target)!.push(rel);
  }

  const selected = new Map<string, Relation>();
  for (const [reportId, rels] of byReport.entries()) {
    const top = [...rels].sort((a, b) => b.weight - a.weight).slice(0, perReport);
    for (const r of top) {
      const key = `${Math.min(r.source, r.target)}-${Math.max(r.source, r.target)}`;
      const existing = selected.get(key);
      if (!existing || r.weight > existing.weight) {
        selected.set(key, r);
      }
    }
  }

  let result = [...selected.values()].sort((a, b) => b.weight - a.weight);
  if (result.length > limit) result = result.slice(0, limit);
  return result;
}

async function moonshotJson(system: string, user: string): Promise<Record<string, unknown> | null> {
  const config = aiConfig();
  if (!config.configured) return null;
  try {
    const response = await fetch(`${config.url}/chat/completions`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${config.key}`,
      },
      body: JSON.stringify({
        model: config.model,
        temperature: 0.2,
        max_tokens: 2400,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
      signal: AbortSignal.timeout(45000),
    });
    if (!response.ok) return null;
    const payload = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = payload.choices?.[0]?.message?.content ?? "";
    return parseJsonObject(content);
  } catch {
    return null;
  }
}

async function aiAnalyseChunk(
  chunk: ReportForInsight[]
): Promise<{ insights: Map<number, Insight>; relations: Relation[] }> {
  const insights = new Map<number, Insight>();
  const relations: Relation[] = [];
  if (!chunk.length) return { insights, relations };

  const system =
    "You analyse cybersecurity lab reports. Given a list of reports with id, title, tags and content, " +
    "return a single JSON object with two keys: " +
    '{"items": [{id:number, summary:string, concepts:string[], steps:string[]}], ' +
    '"relations": [{source:number, target:number, weight:number (0-1), reason:string}]}. ' +
    "Keep summary under 60 words, concepts max 8 short technical nouns, steps max 6. " +
    "Relations should link semantically related reports (shared topic, technique, or attack path). " +
    "Weight is 0-1 similarity. Reason is short Mongolian or English phrase. " +
    "Return ONLY valid JSON, no extra text.";

  const userPayload = chunk.map(r => ({
    id: r.id,
    title: r.title,
    tags: r.tags,
    source: r.source,
    stage: r.stage,
    content: String(r.content ?? "").slice(0, AI_CONTENT_CHARS),
  }));

  const user = JSON.stringify({ reports: userPayload });

  const parsed = await moonshotJson(system, user);
  if (!parsed) return { insights, relations };

  const items = Array.isArray((parsed as any).items) ? (parsed as any).items : [];
  const rels = Array.isArray((parsed as any).relations) ? (parsed as any).relations : [];

  const config = aiConfig();

  for (const item of items) {
    if (!item || typeof item.id !== "number") continue;
    const original = chunk.find(c => c.id === item.id);
    if (!original) continue;
    const summary = typeof item.summary === "string" ? item.summary.trim() : "";
    const concepts = Array.isArray(item.concepts)
      ? item.concepts.filter((c: unknown) => typeof c === "string").map((c: string) => c.trim()).filter(Boolean).slice(0, 8)
      : extractConcepts(original.content, 8);
    const steps = Array.isArray(item.steps)
      ? item.steps.filter((s: unknown) => typeof s === "string").map((s: string) => s.trim()).filter(Boolean).slice(0, 10)
      : [];
    insights.set(item.id, {
      id: item.id,
      title: original.title,
      source: original.source,
      stage: original.stage,
      tags: original.tags,
      summary: summary || original.title,
      concepts: concepts.length ? concepts : extractConcepts(original.content, 8),
      steps,
      provider: "moonshot",
      model: config.model,
    });
  }

  for (const rel of rels) {
    if (!rel || typeof rel.source !== "number" || typeof rel.target !== "number") continue;
    if (rel.source === rel.target) continue;
    const weight = typeof rel.weight === "number" ? Math.min(1, Math.max(0, rel.weight)) : 0.5;
    const reason = typeof rel.reason === "string" ? rel.reason.slice(0, 120) : "AI холбоос";
    relations.push({
      source: rel.source,
      target: rel.target,
      weight: Math.round(weight * 1000) / 1000,
      reason,
    });
  }

  return { insights, relations };
}

async function loadWorkspaceReports(workspaceKey: string): Promise<ReportForInsight[]> {
  try {
    const db = await getMongoDb();
    if (!db) return [];
    const rows = await db
      .collection("reports")
      .find({ workspaceKey })
      .project({ id: 1, title: 1, content: 1, tags: 1, source: 1, stage: 1, updatedAt: 1 })
      .toArray();
    return (rows as any[]).map(r => ({
      id: r.id,
      title: r.title ?? "",
      content: r.content ?? "",
      tags: Array.isArray(r.tags) ? r.tags : [],
      source: r.source ?? "Cyber",
      stage: r.stage ?? "Foundations",
      updatedAt: r.updatedAt,
    }));
  } catch {
    return [];
  }
}

type CacheEntry = {
  insights: Map<number, { insight: Insight; hash: string }>;
  relations: Relation[];
  snapshot: InsightsSnapshot;
};

const globalCache = new Map<string, CacheEntry>();

export async function getInsights(
  workspaceKey: string,
  opts: { force?: boolean } = {}
): Promise<InsightsResult> {
  const reports = await loadWorkspaceReports(workspaceKey);
  const total = reports.length;

  let entry = globalCache.get(workspaceKey);
  if (!entry) {
    entry = {
      insights: new Map(),
      relations: [],
      snapshot: {
        provider: "local",
        analyzed: 0,
        total: 0,
        computedAt: new Date().toISOString(),
      },
    };
    globalCache.set(workspaceKey, entry);
  }

  // 1. Remove deleted ids
  const existingIds = new Set(reports.map(r => r.id));
  for (const id of [...entry.insights.keys()]) {
    if (!existingIds.has(id)) entry.insights.delete(id);
  }

  // 2. stale = hash mismatch / missing
  const stale: ReportForInsight[] = [];
  const hashMap = new Map<number, string>();
  for (const r of reports) {
    const h = reportHash(r);
    hashMap.set(r.id, h);
    const cached = entry.insights.get(r.id);
    if (opts.force || !cached || cached.hash !== h) {
      stale.push(r);
    }
  }

  // 3. AI chunk
  const covered = new Set<number>();
  let aiRelations: Relation[] = [];
  const aiCollected = new Map<number, Insight>();

  const config = aiConfig();
  const provider: "local" | "moonshot" = config.configured ? "moonshot" : "local";

  if (config.configured && stale.length > 0) {
    const toAnalyse = opts.force ? reports : stale;
    const chunks: ReportForInsight[][] = [];
    for (let i = 0; i < toAnalyse.length; i += AI_CHUNK) {
      chunks.push(toAnalyse.slice(i, i + AI_CHUNK));
    }
    const limited = chunks.slice(0, AI_MAX_CALLS);
    for (const chunk of limited) {
      const { insights: chunkInsights, relations: chunkRelations } = await aiAnalyseChunk(chunk);
      for (const [id, ins] of chunkInsights.entries()) {
        aiCollected.set(id, ins);
        covered.add(id);
      }
      for (const rel of chunkRelations) {
        // only keep if both ids exist
        if (existingIds.has(rel.source) && existingIds.has(rel.target)) {
          aiRelations.push(rel);
        }
      }
    }
  }

  // 4. stale not covered -> local
  for (const r of stale) {
    if (covered.has(r.id)) continue;
    const ins = localInsight(r);
    // ensure provider reflects actual (local)
    aiCollected.set(r.id, ins);
  }

  // Merge into cache
  for (const r of reports) {
    const h = hashMap.get(r.id) ?? reportHash(r);
    const collected = aiCollected.get(r.id);
    if (collected) {
      entry.insights.set(r.id, { insight: collected, hash: h });
    }
  }

  const allInsights = [...entry.insights.values()].map(v => v.insight);

  // 5. relations = AI relations (only existing) ∪ buildLocalRelations, dedupe max weight
  const localRels = buildLocalRelations(reports, allInsights);

  const deduped = new Map<string, Relation>();
  const addRel = (rel: Relation) => {
    if (!existingIds.has(rel.source) || !existingIds.has(rel.target)) return;
    const key = `${Math.min(rel.source, rel.target)}-${Math.max(rel.source, rel.target)}`;
    const existing = deduped.get(key);
    if (!existing || rel.weight > existing.weight) deduped.set(key, rel);
  };
  for (const rel of aiRelations) addRel(rel);
  for (const rel of localRels) addRel(rel);

  const finalRelations = [...deduped.values()].sort((a, b) => b.weight - a.weight);

  // 6. update snapshot if stale or force
  if (opts.force || stale.length > 0 || entry.snapshot.total !== total) {
    entry.snapshot = {
      provider,
      model: config.configured ? config.model : "local-heuristic",
      analyzed: allInsights.length,
      total,
      computedAt: new Date().toISOString(),
    };
  }
  entry.relations = finalRelations;

  // If no reports, return empty snapshot
  if (total === 0) {
    return {
      snapshot: {
        provider,
        model: config.configured ? config.model : "local-heuristic",
        analyzed: 0,
        total: 0,
        computedAt: new Date().toISOString(),
      },
      insights: [],
      relations: [],
    };
  }

  return {
    snapshot: entry.snapshot,
    insights: allInsights,
    relations: finalRelations,
  };
}

export function relatedReports(result: InsightsResult, id: number, limit = 6) {
  const neighbours = result.relations
    .filter(r => r.source === id || r.target === id)
    .map(r => ({
      id: r.source === id ? r.target : r.source,
      weight: r.weight,
      reason: r.reason,
    }))
    .sort((a, b) => b.weight - a.weight)
    .slice(0, limit);
  return neighbours;
}

export function clearInsightsCache() {
  globalCache.clear();
}
