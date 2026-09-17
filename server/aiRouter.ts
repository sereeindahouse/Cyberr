import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc";
import { aiConfig, analyze } from "./aiAnalyzer";

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
});
