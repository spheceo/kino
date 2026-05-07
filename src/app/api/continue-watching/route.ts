import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth-server";
import { hideContinueWatching, listContinueWatching, saveContinueWatching } from "@/lib/media-store";

export async function GET(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json([]);
  const url = new URL(request.url);
  const mediaType = url.searchParams.get("mediaType") as "movie" | "tv" | null;
  const limit = Number(url.searchParams.get("limit") ?? 8);
  return NextResponse.json(await listContinueWatching(userId, limit, mediaType ?? undefined));
}

export async function POST(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  await saveContinueWatching(userId, body);
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  await hideContinueWatching(userId, body);
  return NextResponse.json({ ok: true });
}
