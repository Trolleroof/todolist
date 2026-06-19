# Taskboard

A Trello-style task board built with **Next.js** (App Router + TypeScript). Data is stored in the browser's `localStorage`, so there's no backend to configure — it deploys to Vercel as-is.

## Features

- **Columns** — To Do / In Progress / Done out of the box. Add, rename (double-click the title), and delete columns.
- **Cards (full CRUD)** — create, edit, and delete tasks. Drag cards between columns.
- **Assignees** — assign any of **Sojs**, **Trolleroof**, **OutcastVirus**, **Alexgaoth** to a card (multiple allowed), each with its own color avatar.
- **Tags** — create tags with a color from the palette, toggle them per card, delete them globally.
- **Deadlines** — set a due date per card; overdue dates are highlighted in red.
- **Filter** — filter the board by assignee.
- **Reset** — restore the default board.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Deploy to Vercel

1. Push this repo to GitHub.
2. Import it at [vercel.com/new](https://vercel.com/new) — Vercel auto-detects Next.js; no settings needed.
3. Deploy.

Or with the CLI: `npx vercel`.

## Notes

Data lives in `localStorage` under the key `taskboard.v1`, scoped to each browser/device. To make the board shared across users, swap `app/storage.ts` for a database-backed API.
