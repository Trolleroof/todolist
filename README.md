# Taskboard

A stark black-and-white, Trello-style task board built with **Next.js** (App Router + TypeScript). Tasks persist to **Vercel KV / Upstash Redis** when configured, with automatic fallback to the browser's `localStorage` for local dev.

## Features

- **Columns** — To Do / In Progress / Done out of the box. Add, rename (double-click the title), delete, and **sort a column by deadline** (`⇅`).
- **Cards (full CRUD)** — create, edit, delete. Move cards by **dragging** _or_ the **◀ ▶ arrows** (hover a card) — no dragging required.
- **Assignees** — assign any of **Sojs**, **Trolleroof**, **OutcastVirus**, **Alexgaoth** (multiple allowed), each shown as a grayscale avatar.
- **Tags** — create tags with a grayscale shade, toggle per card, delete globally.
- **Deadlines** — per-card due date; **overdue tasks are inverted (white)** and counted in the header.
- **Search** — filter all cards by title/description.
- **Filter** — show only one assignee's cards.
- **Keyboard** — `⌘/Ctrl+Enter` saves the open card, `Esc` closes it.
- **Sync indicator** — header shows `● synced` (cloud) or `○ local`.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000. With no database configured it uses `localStorage`, so it works immediately.

## Deploy to Vercel with persistent, shared storage

1. Push this repo to GitHub and import it at [vercel.com/new](https://vercel.com/new) (Next.js is auto-detected).
2. In your Vercel project: **Storage → Create Database → Upstash for Redis (KV)**, then **Connect** it to the project. This automatically adds the required env vars (`KV_REST_API_URL` / `KV_REST_API_TOKEN`, or `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`).
3. **Redeploy.** The board now reads/writes the shared Redis store — tasks survive deploys and are the same for everyone who opens the URL.

The app reads either the `KV_*` or `UPSTASH_*` variable names, so both Vercel's KV integration and a direct Upstash connection work.

### How storage is wired

- `app/api/board/route.ts` — `GET`/`PUT` JSON board to Redis. Returns `{ configured: false }` when no env vars exist.
- `app/storage.ts` — client picks the backend on first load: cloud if the API reports `configured`, otherwise `localStorage`. Writes are debounced (500ms) and always mirrored to `localStorage` as a safety net.
- Data is stored as a single JSON blob under the key `taskboard:v1`.
