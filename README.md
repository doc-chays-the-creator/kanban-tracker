# Kanban Tracker

A personal productivity desktop app built with Electron. Track tasks across a Kanban board, monitor weekly progress, and keep a daily learning log that syncs to GitHub.

---

## Features

**Board**
- Four columns: Backlog, In Progress, In Review, Done
- Drag and drop cards between columns
- Priority levels (Critical, High, Medium, Low) and category tags
- Sort cards by priority or creation date per column
- `completedAt` timestamp auto-set when a card lands in Done

**Progress Tab**
- Cards grouped by ISO week
- Inline "What I learned" field per card, saves on focus loss

**Log Tab**
- Daily learning entries with Accomplished / Learned / Goals sections
- Sync entries to a markdown file in any GitHub repo via the Contents API
- Pull entries back from GitHub into the app
- Ctrl+`+` / Ctrl+`-` to zoom in/out, Ctrl+`0` to reset

---

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or later)
- [Git](https://git-scm.com/)

### Install & Run

```bash
git clone https://github.com/doc-chays-the-creator/kanban-tracker.git
cd kanban-tracker
npm install
npm start
```

> **Windows note:** The start script includes `SET ELECTRON_RUN_AS_NODE=&&` — this is intentional and required on Windows. Do not remove it.

---

## GitHub Sync Setup (optional)

The Log tab can sync your entries to a markdown file in a GitHub repo.

1. Generate a GitHub Personal Access Token with `repo` scope
2. Open the app, go to the **Log** tab, click the settings icon
3. Enter your token, repo owner, repo name, and file path
4. Click **Sync to GitHub**

Config is stored locally in your OS app data folder and is never committed to this repo.

---

## Data Storage

All data is saved locally on your machine:

| File | Location |
|------|----------|
| Board & log data | `%APPDATA%/kanban-tracker/kanban-board.json` |
| GitHub sync config | `%APPDATA%/kanban-tracker/kanban-config.json` |

---

## Stack

- [Electron](https://www.electronjs.org/) v28
- Vanilla JavaScript — no frameworks
- GitHub Contents API for log sync

---

## License

MIT
