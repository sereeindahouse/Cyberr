# Cyberr (Operator Dossier) — Security & Bug Audit

Full-repository audit performed on 2026-09-16 against commit `fbb6d38`
(branch `arena/01a0a950-cyberr`). Every finding below was verified by reading
the code and, where practical, by running the app (`pnpm dev` + live HTTP
probes, `tsc --noEmit`, `vitest`, `vite build`).

Severity: **C**ritical / **H**igh / **M**edium / **L**ow.
Status: ✅ fixed in this branch · ⚠️ recommend (not yet changed)

---

## Round 2 (re-run 2026-09-16)

The original round-1 branch (`arena/01a0a950-cyberr`) was merged as PR #1,
but its follow-up commit (round-2 features) was never pushed and the branch
was deleted. This round re-implements the documented §5 roadmap items that
were product-safe to ship:

| Item | Status | What shipped |
| --- | --- | --- |
| §5.2 Dead template code | ✅ | Removed `AIChatBox`, `DashboardLayout(+Skeleton)`, `Map`, `ManusDialog`, `ComponentShowcase`, `NotFound`, the `wouter` dependency + patch, and `@types/google.maps`. None were referenced by `App.tsx` (single-page `Home` app). |
| §5.3 Publish/draft visibility | ✅ | **Public view** (top-bar toggle or `?public=1` shared link): only Published, non-archived reports are visible on every surface (list, detail, reader, calendar, heatmap, command palette), all mutations are UI-hidden AND handler-guarded (`guardPublicMode`), backup/full-Markdown export (which contain Drafts) is disabled, and the tab never writes to the workspace. The URL flag wins over the local setting, so a shared link always shows the public site. |
| §5.4 Rate limiting | ✅ | `express-rate-limit` per IP: `/api/*` + `/manus-storage` 600 req/15 min, `/api/oauth/callback` 20 req/15 min; `app.set("trust proxy", 1)` so limits see the real client. Covered by `server/rateLimit.test.ts` (per-IP budget, 429 + draft-7 headers, window reset). |
| §5.5 Multi-device conflicts | ✅ | `reports.sync` now does **per-report last-write-wins**: each report carries the client's last-known `updatedAt` (a per-workspace localStorage sidecar, seeded from `reports.list`, which now returns it); a newer stored copy survives and is returned. Deletions are tombstones via `seenIds` (ids the client has ever known) so a fresh device adopting the key can't wipe the vault; ids it never saw are kept and returned. The response is the full post-merge state, which the client adopts. Legacy clients (no `seenIds`/timestamps) keep the old full-mirror semantics. Covered by 5 new tests in `server/reports.sync.test.ts`. |
| §5.1 Split `Home.tsx` | ⚠️ still open | ~3,400-line component; a full extraction is a dedicated refactoring pass (kept out of this feature round on purpose). |
| §5.6 Rotate workspace key | ⚠️ ops task | Not code. |

S6 updates from this round: `trust proxy` is now set deliberately, and rate
limiting exists (both previously "note for the future").

---

## 1. Security

### S1 — Report write API was completely unauthenticated  — **C** ✅
`reports.upsert` / `reports.upsertMany` were `publicProcedure`s keyed only by
a client-generated `workspaceKey` that the profile dialog displays. Any
anonymous visitor could overwrite, inject, or destroy the entire vault with a
single POST (verified live: `curl -X POST /api/trpc/reports.upsert` from an
anonymous client returned `{"persisted":true}`).

**Fix:** new `writeProcedure` gate — writes require a signed-in user whenever
auth is configured (`OAUTH_SERVER_URL` set, i.e. the deployed site). Reads
stay public (it's a personal public site). Local dev without an OAuth backend
keeps working. Verified live with an `OAUTH_SERVER_URL`-configured server:
anonymous write → `401 UNAUTHORIZED`, anonymous read → `200`.

### S2 — OAuth login was 100% broken  — **H** ✅
Two independent breakages in the login flow:

1. The client sets the CSRF-nonce cookie with
   `document.cookie = "__Host-oauth_state=..."`. Browsers **silently reject**
   `__Host-` cookies set via JavaScript (they may only be set with a
   `Set-Cookie` header carrying `Secure; Path=/` and no `Domain`). The nonce
   was never stored, so `/api/oauth/callback` always failed its CSRF check
   with `403 invalid oauth state` — login could never complete.
2. `startLogin()` built `new URL(\`${VITE_OAUTH_PORTAL_URL}/app-auth\`)`, but
   `VITE_OAUTH_PORTAL_URL` is not in `.env.example`. Unset → `new URL("undefined/app-auth")` →
   `TypeError` thrown from the click handler.

**Fix:** cookie renamed to a regular `oauth_state` (host-only, `Max-Age=600`,
`SameSite=Lax`) that the browser actually stores; `startLogin()` now alerts
with an actionable message when the portal URL/app ID is missing;
`.env.example` documents the variable. Callback CSRF behavior covered by a
new test (`server/oauth.callback.test.ts`): no cookie → 403, forged nonce →
403, matching nonce → passes the gate.

### S3 — Session token weaknesses  — **H** ✅
* `JWT_SECRET` fell back to `""`. jose then crashes with a cryptic
  `Zero-length key is not supported` at sign time.
* `.env.example` ships `change-me-to-a-long-random-secret` — a **public**
  placeholder. If deployed as-is, anyone can forge a session token for any
  user, including the owner (admin) — verified: a token signed with the
  placeholder secret verifies cleanly.
* `verifySession()` never checked the `appId` claim, so a token minted for a
  *different* app sharing the same secret was accepted.

**Fix:** `assertSessionSecret()` fails loudly on an empty secret, warns
below 32 chars; `verifySession()` now rejects tokens whose `appId` claim
doesn't match `ENV.appId`; `.env.example` warns the placeholder must be
replaced (`openssl rand -hex 32`).

### S4 — Anonymous S3 signed-URL minting  — **M** ✅
`GET /manus-storage/*` issued signed S3 GET URLs for **any** storage path
with no auth — an information-disclosure/SSRF-adjacent endpoint.

**Fix:** when auth is configured the route requires a valid session
(verified: anonymous → `401`).

### S5 — No input-size limits + 50 MB body limit  — **M** ✅
`express.json({ limit: "50mb" })` plus an uncapped `content: z.string()`
let a single anonymous request push megabytes into the database before any
per-field rejection.

**Fix:** body limit → `8mb`; per-field zod caps (title 200, room 120, stage
40, excerpt 400, content 300 KB, image 1.5 MB base64, ≤ 50 tags × 60 chars,
≤ 500 reports/batch). Verified: 300 001-char content → HTTP 400.

### S6 — Remaining security notes  — ⚠️
* **Workspace key = read access.** Reads remain public-by-key (the key is
  copyable in the profile UI, and is now *editable* to enable cross-device
  sync). Anyone holding the key can read **everything, including Draft
  reports**. Consider a "publish" visibility split or key rotation.
* ~~**Cookie `secure` flag** relied on `X-Forwarded-Proto` without
  `app.set("trust proxy", …)`~~ — ✅ round 2 sets `app.set("trust proxy", 1)`
  deliberately.
* ~~**No rate limiting** on the OAuth callback or tRPC endpoints~~ — ✅ round 2
  adds per-IP limits (see §5.4 above).
* **Sessions last 1 year** with no revocation (logout only clears the
  browser cookie). Acceptable for a personal site; note for the future.
* **`authenticateRequest` writes `lastSignedIn` to MySQL on every request**
  when `DATABASE_URL` is set — write amplification; cache or throttle.

---

## 2. Data-integrity bugs

### D1 — Deleted reports resurrected on next load  — **H** ✅
`upsertMany`/`upsert` only ever upserted; there was no delete endpoint.
Deleting a report in the UI removed it from localStorage, but the next
`list` from MongoDB returned it again, and it was re-merged into state.
Same problem for tags: removing a tag from a report never removed it from
the `tags` collection, so stale tags lingered in the filter forever.

**Fix:** new `reports.sync` mutation — the client's full workspace state is
mirrored: upsert every report, `deleteMany` ids absent from the list, and
rebuild the tag index from scratch. Client now syncs with it. Covered by
tests (`server/reports.sync.test.ts`) and verified live.

### D2 — Unsynced local work silently dropped on reload  — **H** ✅
Hydration replaced local state with `remote + imported` — any report created
while offline (or after a failed sync) was discarded from state (and then
overwritten out of localStorage on the next save).

**Fix:** hydration now merges in local-only reports.

### D3 — localStorage quota crash  — **H** ✅
`saveReports` wrote the ~477 KB imported knowledge base + user reports +
base64 screenshots straight into `localStorage` (~5 MB quota). A single big
screenshot → `QuotaExceededError` thrown inside a React effect → the entire
app crashed into the ErrorBoundary.

**Fix:** all `localStorage.setItem` calls wrapped (`safeSetItem`) with a
one-time warning toast; screenshot uploads validated client-side
(image only, ≤ 1.5 MB) and server-side (zod cap).

### D4 — Hardcoded date "Sep 14, 2026"  — **M** ✅
Every new report and every Obsidian import without a `date:` field was
stamped `Sep 14, 2026`, corrupting "newest" sorting, the calendar, and the
heatmap. **Fix:** real `formatReportDate(new Date())`.

### D5 — In-memory Mongo fallback had driver-shape bugs  — **M** ✅
The RAM fallback (used whenever `MONGODB_URI` is unset — including on a
fresh local `pnpm dev`) deviated from the real driver:
* `toArray()` returned a plain array, but `reports.tags` chains
  `.toArray().then(...)` → **the tags query crashed in memory mode**.
* `project()` was a no-op (leaked extra fields).
* no `deleteMany`, no `$in`/`$nin` support.
**Fix:** all four behaviors implemented; covered by the sync tests.

### D6 — `reports.list` leaked Mongo internals  — **L** ✅
`withoutMongoFields` stripped `workspaceKey`/`updatedAt` but not `_id`.
**Fix:** `_id` is stripped; asserted in tests.

### D7 — Knowledge-base regeneration remapped note ids  — **M** ✅
`scripts/generate-ks-knowledge.mjs` assigned `id: 10000 + index + 1`. Adding
or removing *any* file shifted every id, so a report the user had edited in
the vault would attach to a **different note** after regeneration.
**Fix:** stable FNV-1a hash of the note path (`stableId`).

### D8 — Workspace-key switch could wipe the new workspace  — **M** ✅
Changing the sync key in the profile fired the persist effect with the old
workspace's data targeted at the new key (upsert + now even destructive
sync-delete). **Fix:** switch resets state to the canonical fresh set and
arms a `workspaceSwitched` guard that blocks persistence until the new key's
list has been fetched and hydrated.

### D9 — Misleading status reporting  — **L** ✅
* UI claimed "Клауд холбогдсон" (cloud connected) whenever the list query
  succeeded — which is true in **in-memory** mode too.
* Server logged "collections are ready" even when no `MONGODB_URI` was set.
**Fix:** new `reports.status` query (`memory` | `mongodb`) drives the badge
and notification; startup log now warns that data is volatile in memory
mode.

---

## 3. Usability / quality

### U1 — Markdown was rendered as raw text  — **H (UX)** ✅
The "Markdown" preview only understood `## ` headings; every code fence,
table, list, link, blockquote and `<details>` block in the 56 imported
knowledge notes displayed as literal text. **Fix:** real renderer
(`marked` GFM + `DOMPurify` sanitization — important because content comes
from Obsidian imports) with styled headings/tables/code/quotes and a copy
button on every code block. Full CSS added for the rendered output.

### U2 — Fake calendar  — **M (UX)** ✅
Hardcoded 3-month array (Aug–Oct 2026), a fixed 31+30 day grid, and fixed
"marked" days 9/21 regardless of month. **Fix:** real month grid (correct
day counts, Monday-first alignment, working ±1 month navigation), days with
reports are marked, clicking a day jumps to that day's newest report, today
is highlighted.

### U3 — Fake heatmap  — **M (UX)** ✅
Deterministic `index % N` pattern pretending to be activity. **Fix:** 18-week
grid derived from real report dates (1 / 2 / 3+ reports per day intensity),
correct week alignment, decorative fallback only when no parseable dates
exist.

### U4 — Hardcoded identity  — **L (UX)** ✅
Profile said "Operator / Ulaanbaatar, Mongolia" for everyone. **Fix:** real
`useAuth` user name/email, avatar initials, and a "Нэвтрэх" (sign in) button
that actually works now that S2 is fixed.

### U5 — No lossless backup  — **M (UX)** ✅
Only Markdown export existed (drops tasks, playbooks, THM progress,
attachments). **Fix:** JSON backup export + import (merge by report id, with
validation and a confirm dialog) in the profile dialog.

### U6 — Sync key couldn't be adopted on another device  — **M (UX)** ✅
The key was shown read-only, so "cross-device sync" was impossible.
**Fix:** the key is now editable (validated 12–160 chars, the server's
schema) with a plain-language warning that holding the key equals write
access.

### U7 — Broken analytics tag  — **L** ✅
`index.html` unconditionally loads `%VITE_ANALYTICS_ENDPOINT%/umami` — when
unset that's `src="/umami"`, a request that 404s/fails to parse as JS on
every page load. **Fix:** Vite plugin strips the tag unless configured.

---

## 4. What was checked and is OK

* `tsc --noEmit` — clean.
* 16 tests pass (4 pre-existing + 12 new), production build succeeds.
* Live verification: sync upsert/delete/tag-rebuild, `_id` non-leak, input
  caps (400), write gate (401 anonymous / 200 read / 401 storage proxy),
  memory-mode status, dev-server UI module compilation.
* Memory DB upsert semantics, `ensureMongoCollections` index creation, and
  the OAuth callback nonce flow (post-fix) — reviewed.
* `drizzle`/MySQL user layer, `heartbeat`, `notification`, `llm`,
  `imageGeneration`, `voiceTranscription`, `dataApi` — template plumbing,
  unused by the current app, no findings that affect this product today.

## 5. Suggested next steps (product decisions)

1. **Split `Home.tsx`** (~3,400 lines) into components (Calendar, Heatmap,
   ReportList, ReportDetail, ProfileDialog, modals) — maintainability.
   ⚠️ still open after round 2 (dedicated refactoring pass).
2. ~~**Remove dead template code**~~ — ✅ round 2.
3. ~~**Publish/draft visibility**~~ — ✅ round 2 (public view / `?public=1`).
4. ~~**Rate limiting**~~ — ✅ round 2 (`express-rate-limit`, see above).
5. ~~**Real multi-device conflict handling**~~ — ✅ round 2 (per-report
   `updatedAt` merging + tombstone deletes in `reports.sync`).
6. **Rotate the workspace key** once: old workspaces are still reachable by
   their old key on any MongoDB that already has the data. ⚠️ ops task.

## Round 6 (2026-09-17) — Second Brain

New surface, all verified with `tsc --noEmit`, `vitest` (shared 46 · server
semantic/openrouter 11 · client vault 6, plus the pre-existing suites) and
`vite build`:

* `[[wiki-links]]` (`shared/wikiLinks.ts`, `WikiMarkdown.tsx`) — rendered
  through the existing `marked` + DOMPurify pipeline, so no new XSS vector;
  popover previews are same-vault data only.
* Split editor (`SplitEditor.tsx`) — 10 MB attachment cap, >1.5 MB bytes go
  to IndexedDB (`vault.ts`) and never touch the sync payload; inline images
  keep the 1.5 MB server cap.
* Search 2.0 (`shared/search.ts`, `shared/embeddings.ts`) — pure functions,
  fully offline; cloud embeddings are opt-in via
  `OPENROUTER_EMBEDDING_MODEL` (unset = $0, local-only).
* Offline-first vault (`client/src/lib/vault.ts`) — IndexedDB primary,
  ≤1.5 MB localStorage mirror; legacy keys migrate once, then stay valid.
* PWA (`client/public/sw.js`) — navigations/assets cached, `/api/*` never
  cached (network-only + JSON 503 offline fallback), versioned cache cleanup.
* New tRPC surface: `ai.semantic.{status,search,refresh}` — workspace-key
  scoped like the rest of the API; `refresh` batch capped at 50, vectors
  cached in Mongo by content hash.
