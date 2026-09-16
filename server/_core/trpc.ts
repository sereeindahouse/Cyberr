import { NOT_ADMIN_ERR_MSG, UNAUTHED_ERR_MSG } from '@shared/const';
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ENV } from "./env";
import type { TrpcContext } from "./context";

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;

const requireUser = t.middleware(async opts => {
  const { ctx, next } = opts;

  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

export const protectedProcedure = t.procedure.use(requireUser);

/**
 * Write gate for the shared knowledge vault.
 *
 * The app is readable by anyone (it is a personal public site), but the
 * reports API must not be writable by anonymous visitors: with the previous
 * setup, any visitor could overwrite or destroy the vault by POSTing to
 * `reports.upsert` with the workspace key shown in the profile dialog.
 *
 * When auth is configured (OAUTH_SERVER_URL set — true on the deployed
 * site), writes require a signed-in user. In local development without an
 * OAuth backend, auth cannot possibly work, so writes stay open to keep
 * `pnpm dev` usable.
 */
const requireUserIfAuthConfigured = t.middleware(async opts => {
  const { ctx, next } = opts;

  if (ENV.oAuthServerUrl && !ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: `${UNAUTHED_ERR_MSG} — sign in to edit the dossier`,
    });
  }

  return next({ ctx });
});

export const writeProcedure = t.procedure.use(requireUserIfAuthConfigured);

export const adminProcedure = t.procedure.use(
  t.middleware(async opts => {
    const { ctx, next } = opts;

    if (!ctx.user || ctx.user.role !== 'admin') {
      throw new TRPCError({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }

    return next({
      ctx: {
        ...ctx,
        user: ctx.user,
      },
    });
  }),
);
