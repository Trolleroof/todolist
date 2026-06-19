import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { Board } from "@/app/types";
import { defaultBoard } from "@/app/board-defaults";

export const dynamic = "force-dynamic";

const KEY = "taskboard:v1";

/**
 * Build a Redis client from whichever env vars are present. Vercel's KV /
 * Upstash marketplace integration sets KV_REST_API_* or UPSTASH_REDIS_REST_*.
 * Returns null when nothing is configured (local dev without a DB).
 */
function getRedis(): Redis | null {
  const url =
    process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token =
    process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

export async function GET() {
  const redis = getRedis();
  if (!redis) {
    return NextResponse.json({ configured: false, board: null });
  }
  try {
    const board = (await redis.get<Board>(KEY)) ?? defaultBoard();
    return NextResponse.json({ configured: true, board });
  } catch (err) {
    return NextResponse.json(
      { configured: true, error: String(err) },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  const redis = getRedis();
  if (!redis) {
    return NextResponse.json({ configured: false });
  }
  try {
    const board = (await req.json()) as Board;
    if (!board?.columns || !board?.cards || !board?.tags) {
      return NextResponse.json({ error: "invalid board" }, { status: 400 });
    }
    await redis.set(KEY, board);
    return NextResponse.json({ configured: true, ok: true });
  } catch (err) {
    return NextResponse.json(
      { configured: true, error: String(err) },
      { status: 500 }
    );
  }
}
