# Cyberr - Operator Knowledge Dossier

A high-density cybersecurity knowledge vault, room report management system, and skill progression dossier.

## Features
- **Dashboard (Ерөнхий)**: Real activity calendar, report-date heatmap, task queue, and operator guidelines.
- **Reports (Тайлан)**: Comprehensive writeups for THM, picoCTF, HTB, and Cloud security challenges with tag filtering, search, real Markdown rendering (code blocks, tables, copy buttons), and Markdown / PDF / JSON export.
- **Playbooks (Сургалт)**: Quick reference tactics for Privilege Escalation, Packet Analysis, Cloud IAM, and Windows Event Log triage.
- **Roadmap (Замын зураг)**: 5-stage progression tracker from Foundations to Cloud Security Architecture with a THM Free Path room tracker.
- **Obsidian Sync**: Import notes from Obsidian markdown (`.md`) files; JSON backup/restore for lossless migration.
- **Cloud & Local Storage**: Synchronized with MongoDB Atlas via full-workspace sync (deletions and tag changes propagate); in-process memory fallback when `MONGODB_URI` is unset — the UI says so honestly.
- **Workspace keys**: editable sync key lets multiple devices share one vault.

## Security model
- The vault is **readable** by anyone (personal public site) but **writes require sign-in** whenever OAuth is configured (`OAUTH_SERVER_URL`). Local development without an OAuth backend keeps writes open.
- Set a strong `JWT_SECRET` (32+ random chars, e.g. `openssl rand -hex 32`) — never deploy the `.env.example` placeholder.
- Reports API input is size-capped (300 KB content, 1.5 MB image, 500 reports/batch; 8 MB body limit).
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
- `pnpm test` — vitest (sync semantics, input caps, write gate, OAuth CSRF, auth)
