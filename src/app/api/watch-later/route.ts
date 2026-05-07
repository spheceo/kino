import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth-server";
import { isWatchLaterSaved, listWatchLater, toggleWatchLater } from "@/lib/media-store";

export async function GET(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json([]);
  const url = new URL(request.url);
  const tmdbId = url.searchParams.get("tmdbId");
  const mediaType = url.searchParams.get("mediaType") as "movie" | "tv" | null;
  if (tmdbId && mediaType) {
    return NextResponse.json({ saved: await isWatchLaterSaved(userId, { mediaType, tmdbId, seasonNumber: Number(url.searchParams.get("seasonNumber") || 1), episodeNumber: Number(url.searchParams.get("episodeNumber") || 1) }) });
  }
  return NextResponse.json(await listWatchLater(userId, Number(url.searchParams.get("limit") ?? 8)));
}

export async function POST(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const visible = await toggleWatchLater(userId, await request.json());
  return NextResponse.json({ saved: visible });
}
