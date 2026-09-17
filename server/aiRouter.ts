import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { publicProcedure, router } from "./_core/trpc";
import { aiConfig, analyze } from "./aiAnalyzer";
import { getInsights, relatedReports } from "./insights";
import { groqConfig } from "./groq";
import { openRouterConfig } from "./openrouter";
import { runChat, type ChatTurn, type KnowledgeSnippet } from "./knowledgeChat";
import { getSemanticStatus, refreshCloudVectors, searchSemantic } from "./semantic";

const workspaceSchema = z.object({
  workspaceKey: z.string().min(12).max(160),
});

const chatTurnSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().max(4000),
});

const knowledgeSnippetSchema = z.object({
  kind: z.enum(["report", "playbook", "room"]),
  id: z.string().max(64),
  title: z.string().max(200),
  extract: z.string().max(600),
  meta: z.string().max(120).optional(),
});

// Per-IP sliding-window budget for the chat endpoint: it makes real Groq /
// Gemini API calls (cost + latency), so it gets a tighter cap than the
// generic 600/15min Express-level `apiLimiter` in server/_core/index.ts.
const CHAT_WINDOW_MS = 60_000;
const CHAT_LIMIT_PER_WINDOW = 12;
const chatHits = new Map<string, number[]>();

function isChatRateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (chatHits.get(ip) ?? []).filter(t => now - t < CHAT_WINDOW_MS);
  recent.push(now);
  chatHits.set(ip, recent);
  return recent.length > CHAT_LIMIT_PER_WINDOW;
}

/**
 * Optional AI surface for the Round 4 visual modules.
 *
 * `status` lets the client label the UI ("Kimi/Moonshot" vs "Local") without
 * ever receiving the key. `analyze` always succeeds: when Moonshot is not
 * configured (the default) it returns the deterministic local analysis.
 */
export const aiRouter = router({
  status: publicProcedure.query(() => {
    const config = aiConfig();
    return {
      configured: config.configured,
      provider: config.configured ? ("moonshot" as const) : ("local" as const),
      model: config.model,
    };
  }),

  analyze: publicProcedure
    .input(
      z.object({
        content: z.string().max(300_000),
        maxConcepts: z.number().int().min(1).max(24).optional(),
      })
    )
    .mutation(async ({ input }) =>
      analyze(input.content, { maxConcepts: input.maxConcepts ?? 8 })
    ),

  insights: router({
    status: publicProcedure.input(workspaceSchema).query(async ({ input }) => {
      const result = await getInsights(input.workspaceKey);
      return result.snapshot;
    }),

    atlas: publicProcedure.input(workspaceSchema).query(async ({ input }) => {
      const result = await getInsights(input.workspaceKey);
      return result;
    }),

    report: publicProcedure
      .input(workspaceSchema.extend({ id: z.number() }))
      .query(async ({ input }) => {
        const result = await getInsights(input.workspaceKey);
        return result.insights.find(i => i.id === input.id) ?? null;
      }),

    related: publicProcedure
      .input(
        workspaceSchema.extend({
          id: z.number(),
          limit: z.number().int().min(1).max(24).optional(),
        })
      )
      .query(async ({ input }) => {
        const result = await getInsights(input.workspaceKey);
        return relatedReports(result, input.id, input.limit ?? 6);
      }),

    refresh: publicProcedure.input(workspaceSchema).mutation(async ({ input }) => {
      const result = await getInsights(input.workspaceKey, { force: true });
      return result.snapshot;
    }),
  }),

  // Second Brain — semantic (meaning-based) search over the synced
  // workspace. Local hash vectors always work; OpenRouter transformer
  // embeddings upgrade the ranking when configured.
  semantic: router({
    status: publicProcedure.input(workspaceSchema).query(async ({ input }) => {
      return getSemanticStatus(input.workspaceKey);
    }),

    search: publicProcedure
      .input(
        workspaceSchema.extend({
          query: z.string().min(1).max(500),
          limit: z.number().int().min(1).max(50).optional(),
        })
      )
      .query(async ({ input }) => {
        return searchSemantic(input.workspaceKey, input.query, { limit: input.limit });
      }),

    refresh: publicProcedure
      .input(workspaceSchema.extend({ batch: z.number().int().min(1).max(50).optional() }))
      .mutation(async ({ input }) => {
        return refreshCloudVectors(input.workspaceKey, { batch: input.batch });
      }),
  }),

  // Round 6 — Operator Assistant chatbot: Groq (fast reply) + Gemini
  // (background enrichment) collaborating over the local knowledge base.
  chat: router({
    status: publicProcedure.query(() => {
      const groq = groqConfig();
      const gemini = aiConfig();
      const openRouter = openRouterConfig();
      return {
        groqConfigured: groq.configured,
        groqKeyCount: groq.keys.length,
        groqModel: groq.model,
        geminiConfigured: gemini.configured,
        geminiModel: gemini.model,
        openRouterConfigured: openRouter.configured,
        openRouterModel: openRouter.model,
      };
    }),

    ask: publicProcedure
      .input(
        z.object({
          message: z.string().min(1).max(2000),
          history: z.array(chatTurnSchema).max(12).optional(),
          snippets: z.array(knowledgeSnippetSchema).max(10).optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const ip = ctx.req.ip ?? "unknown";
        if (isChatRateLimited(ip)) {
          throw new TRPCError({
            code: "TOO_MANY_REQUESTS",
            message: "Хэт олон зурвас илгээлээ — түр хүлээгээд дахин оролдоно уу.",
          });
        }
        const history: ChatTurn[] = input.history ?? [];
        const snippets: KnowledgeSnippet[] = input.snippets ?? [];
        return runChat({ message: input.message, history, snippets });
      }),
  }),
});
