import { pgTable, serial, integer, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const blockedUsersTable = pgTable("blocked_users", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  blockedUserId: integer("blocked_user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  userBlockedIdx: uniqueIndex("user_blocked_idx").on(table.userId, table.blockedUserId),
}));

export type BlockedUser = typeof blockedUsersTable.$inferSelect;
export type NewBlockedUser = typeof blockedUsersTable.$inferInsert;
