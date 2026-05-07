import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";

function itemKey(args: {
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

const itemArgs = {
  mediaType: v.union(v.literal("movie"), v.literal("tv")),
  tmdbId: v.string(),
  title: v.string(),
  seasonNumber: v.optional(v.number()),
  episodeNumber: v.optional(v.number()),
};

export const isSaved = query({
  args: {
    mediaType: v.union(v.literal("movie"), v.literal("tv")),
    tmdbId: v.string(),
    seasonNumber: v.optional(v.number()),
    episodeNumber: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const existing = await ctx.db
      .query("watchLater")
      .withIndex("by_user_key", (q) =>
        q.eq("userId", userId).eq("itemKey", itemKey(args)),
      )
      .unique();

    return existing?.visible ?? false;
  },
});

export const listForCurrentUser = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);

    return await ctx.db
      .query("watchLater")
      .withIndex("by_user_updated", (q) => q.eq("userId", userId))
      .order("desc")
      .filter((q) => q.eq(q.field("visible"), true))
      .take(args.limit ?? 12);
  },
});

export const toggle = mutation({
  args: itemArgs,
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const now = Date.now();
    const key = itemKey(args);
    const existing = await ctx.db
      .query("watchLater")
      .withIndex("by_user_key", (q) => q.eq("userId", userId).eq("itemKey", key))
      .unique();

    if (existing) {
      const visible = !existing.visible;
      await ctx.db.patch(existing._id, {
        visible,
        title: args.title,
        updatedAt: now,
      });
      return visible;
    }

    await ctx.db.insert("watchLater", {
      userId,
      itemKey: key,
      mediaType: args.mediaType,
      tmdbId: args.tmdbId,
      title: args.title,
      seasonNumber: args.mediaType === "tv" ? (args.seasonNumber ?? 1) : undefined,
      episodeNumber: args.mediaType === "tv" ? (args.episodeNumber ?? 1) : undefined,
      visible: true,
      createdAt: now,
      updatedAt: now,
    });

    return true;
  },
});
