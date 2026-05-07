import { boolean, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const userPreferences = pgTable("user_preferences", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().unique(),
  previewsMutedByDefault: boolean("previews_muted_by_default").notNull(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});
