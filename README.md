# Cyberr - Operator Knowledge Dossier

A high-density cybersecurity knowledge vault, room report management system, and skill progression dossier.

## Features

- **Dashboard (Ерөнхий)**: Real activity calendar, report-date heatmap, task queue, and operator guidelines.
- **Reports (Тайлан)**: Comprehensive writeups for THM, picoCTF, HTB, and Cloud security challenges with tag filtering, search, real Markdown rendering (code blocks, tables, copy buttons), and Markdown / PDF / JSON export.
- **Playbooks (Сургалт)**: Quick reference tactics for Privilege Escalation, Packet Analysis, Cloud IAM, and Windows Event Log triage.
- **Roadmap (Замын зураг)**: five parallel tracks — **THM Free Path · picoCTF / CyLab · THM Paid / AD · HTB / flAWS · OSCP / Cloud** — each with sectioned items, per-item completion, and per-track progress (data lives in `client/src/data/roadmapTracks.ts`, ready for more detailed sections).
- **Dark theme**: dark is the default (green "operator terminal" on near-black paper); top-bar toggle switches to light, persisted per device.
- **Obsidian Sync**: Import notes from Obsidian markdown (`.md`) files; JSON backup/restore for lossless migration.
- **Public view**: toggle (or share a `?public=1` link) to show only Published, non-archived reports with all editing locked — a read-only view for anyone holding the link.
- **Cloud & Local Storage**: Synchronized with MongoDB Atlas via full-workspace sync (deletions and tag changes propagate); in-process memory fallback when `MONGODB_URI` is unset — the UI says so honestly.
- **Multi-device sync**: per-report last-write-wins by timestamp — concurrently edited reports don't clobber each other, deletions are tombstones, and a fresh device adopting the key can't wipe the vault.
- **Knowledge Atlas (Атлас)**: every report, roadmap track and shared tag on one interactive SVG concept map — pan/zoom, source + text filters, click a node to focus it, double-click (or the button) to open the report/track.
- **Document-to-Diagram (Диаграм)**: a report rendered as a **mind-map** (heading tree), **flowchart** (ordered steps) or **network** (concepts + co-occurrence links); a roadmap track rendered as a **tree** (track → sections → items). Zoom, pan and one-click **SVG export**.
- **Wiki-links (Round 6)**: Obsidian-style `[[Title]]` / `[[Title|alias]]` links with autocomplete while typing, hover preview popovers, one-click creation of missing pages, and an automatic **Backlinks** section on every note.
- **Split-pane editor (Round 6)**: write Markdown on the left, live preview on the right (sync-scroll), **Zen mode** for distraction-free fullscreen writing, word/character/read-time counters, `Ctrl+S` to save, up to 10 MB screenshots (oversized bytes spill to IndexedDB automatically).
- **Multi-tab workspace (Round 6)**: VS Code style tabs (max 12, middle-click to close) preserving each tab's scroll position, persisted across reloads.
- **Search 2.0 (Round 6)**: typo-tolerant fuzzy search with `tag:` / `stage:` / `status:` / `source:` / `date:` filters, highlighted snippets and relevance scores — plus **semantic (meaning-based) search** that runs 100% offline on local vectors, with an opt-in OpenRouter transformer upgrade (`OPENROUTER_EMBEDDING_MODEL`).
- **Offline-first PWA (Round 6)**: the vault lives in **IndexedDB** (GB quota instead of localStorage's 5 MB), installable app shell + service worker, MongoDB auto-sync when online.
- **Workspace keys**: editable sync key lets multiple devices share one vault.
- **Optional AI analysis**: diagrams can be annotated by a deterministic local analyzer (default, no network). Set `MOONSHOT_API_URL` + `MOONSHOT_API_KEY` to upgrade to Moonshot/Kimi — the key stays in the gitignored `.env`.

## Security model

- The vault is **readable** by anyone (personal public site) but **writes require sign-in** whenever OAuth is configured (`OAUTH_SERVER_URL`). Local development without an OAuth backend keeps writes open.
- Set a strong `JWT_SECRET` (32+ random chars, e.g. `openssl rand -hex 32`) — never deploy the `.env.example` placeholder.
- Reports API input is size-capped (300 KB content, 1.5 MB image, 500 reports/batch; 8 MB body limit).
- Public endpoints are rate-limited per IP (`/api/*`: 600 req/15 min; the OAuth callback, which mints sessions: 20 req/15 min).
- See [AUDIT.md](./AUDIT.md) for the full security & bug audit and the fixes shipped with this branch.

## Setup

```bash
pnpm install
cp .env.example .env   # then fill in JWT_SECRET, MONGODB_URI, OAuth vars
pnpm dev               # http://localhost:3000
```

## Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS 4, Lucide Icons, Radix UI, marked + DOMPurify
- **Backend**: Express, tRPC v11, MongoDB (with in-memory fallback), Drizzle/MySQL (user layer), TypeScript

## Scripts

- `pnpm dev` — dev server (Vite + tsx watch)
- `pnpm build` / `pnpm start` — production build / run
- `pnpm check` — TypeScript typecheck
- `pnpm test` — vitest (sync semantics incl. multi-device conflict merge, input caps, write gate, rate limiting, OAuth CSRF, auth)
