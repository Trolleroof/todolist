import { Board } from "./types";
import { defaultBoard, uid } from "./board-defaults";

const KEY = "taskboard.v1";

// Which backend the current session is using. Decided on first fetch.
let backend: "kv" | "local" = "local";

export function getBackend() {
  return backend;
}

function loadLocal(): Board {
  if (typeof window === "undefined") return defaultBoard();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return defaultBoard();
    const parsed = JSON.parse(raw) as Board;
    if (!parsed.columns || !parsed.cards || !parsed.tags) return defaultBoard();
    return parsed;
  } catch {
    return defaultBoard();
  }
}

function saveLocal(board: Board) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(board));
}

/**
 * Load the board. Tries the server API (Vercel KV / Upstash Redis); if no
 * backend is configured there, falls back to this browser's localStorage.
 */
export async function fetchBoard(): Promise<Board> {
  try {
    const res = await fetch("/api/board", { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (data.configured) {
        backend = "kv";
        return (data.board as Board) ?? defaultBoard();
      }
    }
  } catch {
    // network/API unavailable — fall through to local
  }
  backend = "local";
  return loadLocal();
}

/**
 * Persist the board to whichever backend was detected on load. Always mirrors
 * to localStorage as well so an offline blip never loses work.
 */
export async function persistBoard(board: Board): Promise<void> {
  if (backend === "kv") {
    try {
      await fetch("/api/board", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(board),
      });
    } catch {
      // ignore — local mirror below keeps the data
    }
  }
  saveLocal(board);
}

export { uid, defaultBoard };
