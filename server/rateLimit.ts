import rateLimit from "express-rate-limit";

/**
 * Rate limits for the public HTTP surface. Reads are public-by-design
 * (the site is shared via a workspace key), so without limits the API can
 * be used to hammer the database, flood logs, or brute-force the OAuth
 * callback. AUDIT.md §5.4.
 *
 * `index.ts` sets `app.set("trust proxy", 1)` BEFORE these limits are
 * mounted, so `req.ip` reflects the real client behind the TLS-terminating
 * proxy (also fixes the cookie `Secure` flag note in AUDIT.md S6).
 */
export function createLimiter(options: { windowMs?: number; limit: number }) {
  return rateLimit({
    windowMs: options.windowMs ?? 15 * 60 * 1000,
    limit: options.limit,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { error: "Too many requests — slow down." },
  });
}

// 600 req/15 min per IP is far above any human usage of this app (a full
// workspace sync is one request) but stops scraping and upload floods.
export const apiLimiter = createLimiter({ limit: 600 });

// The OAuth callback mints sessions; budget it far tighter so a forged
// state probe cannot be iterated quickly.
export const oauthCallbackLimiter = createLimiter({ limit: 20 });
