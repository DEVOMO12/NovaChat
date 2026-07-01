import { pgTable, serial, integer, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { usersTable } from "./users";
import { storiesTable } from "./stories";

export const storyViewsTable = pgTable("story_views", {
  id: serial("id").primaryKey(),
  storyId: integer("story_id").notNull().references(() => storiesTable.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  viewedAt: timestamp("viewed_at").defaultNow().notNull(),
}, (table) => ({
  storyUserViewIdx: uniqueIndex("story_user_view_idx").on(table.storyId, table.userId),
}));

export type StoryView = typeof storyViewsTable.$inferSelect;
export type NewStoryView = typeof storyViewsTable.$inferInsert;
