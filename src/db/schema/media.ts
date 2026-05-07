import { boolean, index, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const watchHistory = pgTable(
  "watch_history",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    mediaType: text("media_type", { enum: ["movie", "tv"] }).notNull(),
    tmdbId: text("tmdb_id").notNull(),
    title: text("title"),
    seasonNumber: integer("season_number"),
    episodeNumber: integer("episode_number"),
    progressSeconds: integer("progress_seconds").notNull(),
    durationSeconds: integer("duration_seconds").notNull(),
    paused: boolean("paused").notNull(),
    completed: boolean("completed").notNull(),
    eventType: text("event_type").notNull(),
    createdAt: timestamp("created_at").notNull(),
  },
  (table) => [
    index("watch_history_user_created_idx").on(table.userId, table.createdAt),
    index("watch_history_user_media_idx").on(table.userId, table.mediaType, table.tmdbId),
  ],
);

export const continueWatching = pgTable(
  "continue_watching",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    progressKey: text("progress_key").notNull(),
    mediaType: text("media_type", { enum: ["movie", "tv"] }).notNull(),
    tmdbId: text("tmdb_id").notNull(),
    title: text("title"),
    seasonNumber: integer("season_number"),
    episodeNumber: integer("episode_number"),
    progressSeconds: integer("progress_seconds").notNull(),
    durationSeconds: integer("duration_seconds").notNull(),
    paused: boolean("paused").notNull(),
    completed: boolean("completed").notNull(),
    visible: boolean("visible").notNull().default(true),
    updatedAt: timestamp("updated_at").notNull(),
  },
  (table) => [
    index("continue_watching_user_key_idx").on(
      table.userId,
      table.progressKey,
    ),
    index("continue_watching_user_show_idx").on(
      table.userId,
      table.mediaType,
      table.tmdbId,
    ),
    index("continue_watching_user_updated_idx").on(
      table.userId,
      table.updatedAt,
    ),
  ],
);

export const watchLater = pgTable(
  "watch_later",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    itemKey: text("item_key").notNull(),
    mediaType: text("media_type", { enum: ["movie", "tv"] }).notNull(),
    tmdbId: text("tmdb_id").notNull(),
    title: text("title").notNull(),
    seasonNumber: integer("season_number"),
    episodeNumber: integer("episode_number"),
    visible: boolean("visible").notNull(),
    createdAt: timestamp("created_at").notNull(),
    updatedAt: timestamp("updated_at").notNull(),
  },
  (table) => [
    index("watch_later_user_key_idx").on(table.userId, table.itemKey),
    index("watch_later_user_updated_idx").on(table.userId, table.updatedAt),
  ],
);
