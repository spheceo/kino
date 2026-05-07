import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";

const progressArgs = {
  mediaType: v.union(v.literal("movie"), v.literal("tv")),
  tmdbId: v.string(),
  title: v.string(),
  seasonNumber: v.optional(v.number()),
  episodeNumber: v.optional(v.number()),
  currentTime: v.number(),
  duration: v.optional(v.number()),
  paused: v.optional(v.boolean()),
  completed: v.optional(v.boolean()),
};

function progressKey(args: {
  mediaType: "movie" | "tv";
  tmdbId: string;
  seasonNumber?: number;
  episodeNumber?: number;
}) {
  if (args.mediaType === "tv") {
    return `tv:${args.tmdbId}:s${args.seasonNumber ?? 1}:e${args.episodeNumber ?? 1}`;
  }

  return `movie:${args.tmdbId}`;
}

async function requireUserId(ctx: MutationCtx | QueryCtx) {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) {
    throw new Error("Not authenticated");
  }

  return identity.subject;
}

export const saveProgress = mutation({
  args: progressArgs,
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const now = Date.now();
    const key = progressKey(args);
    const duration = args.duration ?? 0;
    const currentTime = Math.max(0, args.currentTime);
    const progressRatio = duration > 0 ? currentTime / duration : 0;
    const completed = args.completed ?? progressRatio >= 0.92;

    const existing = await ctx.db
      .query("continueWatching")
      .withIndex("by_user_key", (q) => q.eq("userId", userId).eq("progressKey", key))
      .unique();

    const value = {
      userId,
      progressKey: key,
      mediaType: args.mediaType,
      tmdbId: args.tmdbId,
      title: args.title,
      seasonNumber: args.mediaType === "tv" ? (args.seasonNumber ?? 1) : undefined,
      episodeNumber: args.mediaType === "tv" ? (args.episodeNumber ?? 1) : undefined,
      progressSeconds: currentTime,
      durationSeconds: duration,
      paused: args.paused ?? false,
      completed,
      visible: true,
      updatedAt: now,
    };

    if (existing) {
      await ctx.db.patch(existing._id, value);
      return existing._id;
    }

    return await ctx.db.insert("continueWatching", value);
  },
});

export const getForCurrentUser = query({
  args: {
    mediaType: v.union(v.literal("movie"), v.literal("tv")),
    tmdbId: v.string(),
    seasonNumber: v.optional(v.number()),
    episodeNumber: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);

    return await ctx.db
      .query("continueWatching")
      .withIndex("by_user_key", (q) =>
        q.eq("userId", userId).eq("progressKey", progressKey(args)),
      )
      .unique();
  },
});

export const hideForCurrentUser = mutation({
  args: {
    mediaType: v.union(v.literal("movie"), v.literal("tv")),
    tmdbId: v.string(),
    seasonNumber: v.optional(v.number()),
    episodeNumber: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const existing = await ctx.db
      .query("continueWatching")
      .withIndex("by_user_key", (q) =>
        q.eq("userId", userId).eq("progressKey", progressKey(args)),
      )
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, { visible: false });
    }
  },
});

export const listForCurrentUser = query({
  args: {
    limit: v.optional(v.number()),
    mediaType: v.optional(v.union(v.literal("movie"), v.literal("tv"))),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const limit = args.limit ?? 12;

    return await ctx.db
      .query("continueWatching")
      .withIndex("by_user_updated", (q) => q.eq("userId", userId))
      .order("desc")
      .filter((q) =>
        q.and(
          q.eq(q.field("completed"), false),
          q.neq(q.field("visible"), false),
          args.mediaType
            ? q.eq(q.field("mediaType"), args.mediaType)
            : q.neq(q.field("mediaType"), ""),
        ),
      )
      .take(limit);
  },
});
