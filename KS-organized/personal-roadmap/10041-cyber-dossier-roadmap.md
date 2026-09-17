---
title: Interactive Cybersecurity Dossier Roadmap
category: personal-roadmap
tags: [ks-import, roadmap, interactive-ui, cybersecurity, implementation]
source: sd.md
sourceId: 10041
---
Implementation Plan

# Human-Usable Interactive Experience: Operator Knowledge Dossier

Transform the application from a partially static showcase into a fully interactive, production-grade cybersecurity dossier where every button, modal, task, playbook, and filter responds naturally to user interactions.

## User Review Required

NOTE

All new features will maintain local persistence (`localStorage`) alongside the existing MongoDB Atlas sync, ensuring no data loss and full offline capability.

## Key Deficiencies in Current Application

1. **Report Actions**: The report detail panel has dummy buttons (More options `...` and `Архивлах` do nothing; there is no way to edit an existing report or delete a report).
2. **Dashboard Tasks**: The task queue is hardcoded markup. Clicking tasks does not toggle completion; users cannot add, complete, or manage tasks.
3. **Mini-Calendar**: Month arrows and day numbers are non-interactive static spans.
4. **Playbooks ("Сургалт")**: Playbook cards are static non-clickable divs. Clicking "+ Шинэ playbook" erroneously opens the report editor. No playbook detail view or command copy exists.
5. **Roadmap ("Замын зураг")**: Stages are static; clicking a stage does not filter or navigate to relevant reports.
6. **Top Bar & Profile**: Search icon, bell icon, and profile button have no click handlers or modals.
7. **Sorting**: List sorting dropdown is hardcoded text without sort logic.
8. **Feedback**: No toast notifications despite Sonner being installed.

---

## Proposed Changes

### 1. Interactive Report Management (Full CRUD + Actions)

- **Edit Report**: Allow editing existing reports directly in the slide-out editor drawer (pre-filled with title, room, stage, tags, content, image).
- **Delete Report**: Add a delete button with a clean confirmation dialog.
- **Archive Report**: Implement real archive state (`status: "Draft" | "Published" | "Archived"`) with filter options.
- **Sort Reports**: Implement dynamic sorting (Newest first, Oldest first, Title A-Z, Reading time).
- **Quick Copy**: Add "Copy Markdown to clipboard" alongside file download.
- **Toasts**: Integrate `toast.success` and `toast.info` for save, delete, status toggle, and export.

### 2. Real Task Queue & Manager (Dashboard)

- State-driven task list with persistence (`tasks` stored in `localStorage`):
    - Today (Өнөөдөр), Tomorrow (Маргааш), Next / Later (Дараагийн).
- Clicking any task checkbox or row toggles its completed state with visual strike-through and count decrement.
- Add an interactive "+ Даалгавар нэмэх" button and inline input/modal to add custom tasks.
- Task counts (`02`, `01`, etc.) dynamically reflect active items.

### 3. Interactive Mini-Calendar

- Navigating previous / next month with working arrow buttons.
- Day selection highlights selected date and allows filtering reports/tasks created on that day.
- "Өнөөдөр" (Today) quick button.

### 4. Interactive Playbooks Engine ("Сургалт")

- Clickable playbook cards that open an interactive **Playbook Detail Modal**:
    - Full mitigation / testing methodology.
    - Step-by-step terminal commands with one-click "Хуулах" (Copy to clipboard) buttons.
    - Syntax highlighting / cheat sheet view.
- Dedicated "+ Шинэ playbook" modal allowing users to create custom attack/defense playbooks stored in state.

### 5. Interactive Roadmap Navigation ("Замын зураг")

- Clicking any stage in the roadmap automatically navigates to "Тайлан" (Reports) filtered by that stage (e.g. clicking "01 Суурь" filters to `Foundations`, "02 Бодит туршилт" to `Live Fire`).
- Visual challenge counter showing completed vs total writeups per stage.

### 6. Command Palette / Global Search (`Ctrl + K`) & Topbar Modals

- Topbar Search button (and `Ctrl + K` shortcut) opens a command palette searching across reports, tasks, and playbooks with instant navigation.
- Topbar Bell button opens a notifications popup showing recent activity (saved reports, completed tasks, database sync status).
- Profile button in topbar and sidebar opens a modal with user statistics, workspace key management, and data backup/export options.

---

## Verification Plan

### Automated Tests

- Run `npx tsc --noEmit` to verify 0 type errors across all added components and handlers.
- Run `npx vitest run` to ensure all existing and updated unit tests pass.
- Run `npm run build` to verify production bundle build.

### Manual / Browser Verification

- Test all buttons in `http://localhost:3003/`:
    - Create, Edit, Delete, and Archive reports.
    - Toggle tasks on dashboard, add a new task, verify count update.
    - Navigate calendar months and select dates.
    - Open playbooks, copy terminal commands, add custom playbook.
    - Click roadmap stage to navigate to filtered reports.
    - Test topbar search, notifications, and profile modals.
