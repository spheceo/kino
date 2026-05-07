import { and, desc, eq, ne } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { db } from "@/db";
import { continueWatching, userPreferences, watchHistory, watchLater } from "@/db/schema";

export type MediaType = "movie" | "tv";

type ProgressIdentity = {
  mediaType: MediaType;
  tmdbId: string;
  seasonNumber?: number;
  episodeNumber?: number;
};

type SaveProgressArgs = ProgressIdentity & {
  title: string;
  currentTime: number;
  duration?: number;
  paused?: boolean;
  completed?: boolean;
  eventType?: string;
};

export function progressKey(args: ProgressIdentity) {
  return args.mediaType === "tv"
    ? `tv:${args.tmdbId}`
    : `movie:${args.tmdbId}`;
}

function historyKey(args: ProgressIdentity) {
  return args.mediaType === "tv"
    ? `tv:${args.tmdbId}:s${args.seasonNumber ?? 1}:e${args.episodeNumber ?? 1}`
    : `movie:${args.tmdbId}`;
}

export const itemKey = progressKey;

export async function listContinueWatching(
  userId: string,
  limit = 8,
  mediaType?: MediaType,
) {
  return await db.query.continueWatching.findMany({
    where: mediaType
      ? and(
          eq(continueWatching.userId, userId),
          eq(continueWatching.completed, false),
          ne(continueWatching.visible, false),
          eq(continueWatching.mediaType, mediaType),
        )
      : and(
          eq(continueWatching.userId, userId),
          eq(continueWatching.completed, false),
          ne(continueWatching.visible, false),
        ),
    orderBy: [desc(continueWatching.updatedAt)],
    limit,
  });
}

export async function getContinueWatching(userId: string, args: ProgressIdentity) {
  return await db.query.continueWatching.findFirst({
    where: and(
      eq(continueWatching.userId, userId),
      eq(continueWatching.progressKey, progressKey(args)),
    ),
  });
}

export async function saveContinueWatching(userId: string, args: SaveProgressArgs) {
  const now = new Date();
  const key = progressKey(args);
  const duration = Math.floor(args.duration ?? 0);
  const progress = Math.max(0, Math.floor(args.currentTime));
  const completed =
    args.completed ?? (duration > 0 ? progress / duration >= 0.92 : false);

  await db.insert(watchHistory).values({
    id: randomUUID(),
    userId,
    mediaType: args.mediaType,
    tmdbId: args.tmdbId,
    title: args.title,
    seasonNumber: args.mediaType === "tv" ? (args.seasonNumber ?? 1) : null,
    episodeNumber: args.mediaType === "tv" ? (args.episodeNumber ?? 1) : null,
    progressSeconds: progress,
    durationSeconds: duration,
    paused: args.paused ?? false,
    completed,
    eventType: args.eventType ?? "progress",
    createdAt: now,
  });

  const existing = await getContinueWatching(userId, args);
  const value = {
    userId,
    progressKey: key,
    mediaType: args.mediaType,
    tmdbId: args.tmdbId,
    title: args.title,
    seasonNumber: args.mediaType === "tv" ? (args.seasonNumber ?? 1) : null,
    episodeNumber: args.mediaType === "tv" ? (args.episodeNumber ?? 1) : null,
    progressSeconds: progress,
    durationSeconds: duration,
    paused: args.paused ?? false,
    completed,
    visible: true,
    updatedAt: now,
  };

  if (existing) {
    return await db
      .update(continueWatching)
      .set(value)
      .where(eq(continueWatching.id, existing.id));
  }

  return await db.insert(continueWatching).values({ id: randomUUID(), ...value });
}

export async function hideContinueWatching(userId: string, args: ProgressIdentity) {
  return await db
    .update(continueWatching)
    .set({ visible: false })
    .where(
      and(
        eq(continueWatching.userId, userId),
        eq(continueWatching.progressKey, progressKey(args)),
      ),
    );
}

export async function listWatchLater(userId: string, limit = 8) {
  return await db.query.watchLater.findMany({
    where: and(eq(watchLater.userId, userId), eq(watchLater.visible, true)),
    orderBy: [desc(watchLater.updatedAt)],
    limit,
  });
}

export async function isWatchLaterSaved(userId: string, args: ProgressIdentity) {
  const item = await db.query.watchLater.findFirst({
    where: and(eq(watchLater.userId, userId), eq(watchLater.itemKey, itemKey(args))),
  });
  return item?.visible ?? false;
}

export async function toggleWatchLater(
  userId: string,
  args: ProgressIdentity & { title: string },
) {
  const now = new Date();
  const key = itemKey(args);
  const existing = await db.query.watchLater.findFirst({
    where: and(eq(watchLater.userId, userId), eq(watchLater.itemKey, key)),
  });

  if (existing) {
    const visible = !existing.visible;
    await db
      .update(watchLater)
      .set({ visible, title: args.title, updatedAt: now })
      .where(eq(watchLater.id, existing.id));
    return visible;
  }

  await db.insert(watchLater).values({
    id: randomUUID(),
    userId,
    itemKey: key,
    mediaType: args.mediaType,
    tmdbId: args.tmdbId,
    title: args.title,
    seasonNumber: args.mediaType === "tv" ? (args.seasonNumber ?? 1) : null,
    episodeNumber: args.mediaType === "tv" ? (args.episodeNumber ?? 1) : null,
    visible: true,
    createdAt: now,
    updatedAt: now,
  });
  return true;
}

export async function getPreferences(userId?: string | null) {
  if (!userId) return { previewsMutedByDefault: true };
  const prefs = await db.query.userPreferences.findFirst({
    where: eq(userPreferences.userId, userId),
  });
  return { previewsMutedByDefault: prefs?.previewsMutedByDefault ?? true };
}

export async function setPreviewMuted(userId: string, muted: boolean) {
  const now = new Date();
  const existing = await db.query.userPreferences.findFirst({
    where: eq(userPreferences.userId, userId),
  });
  if (existing) {
    return await db
      .update(userPreferences)
      .set({ previewsMutedByDefault: muted, updatedAt: now })
      .where(eq(userPreferences.id, existing.id));
  }
  return await db.insert(userPreferences).values({
    id: randomUUID(),
    userId,
    previewsMutedByDefault: muted,
    createdAt: now,
    updatedAt: now,
  });
}
