import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth-server";
import { getPreferences, setPreviewMuted } from "@/lib/media-store";

export async function GET() {
  const userId = await getCurrentUserId();
  return NextResponse.json(await getPreferences(userId));
}

export async function POST(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  await setPreviewMuted(userId, Boolean(body.muted));
  return NextResponse.json({ ok: true });
}
