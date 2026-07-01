import { pgTable, serial, integer, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { usersTable } from "./users";
import { chatsTable } from "./chats";

export const pinnedChatsTable = pgTable("pinned_chats", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  chatId: integer("chat_id").notNull().references(() => chatsTable.id, { onDelete: "cascade" }),
  pinnedAt: timestamp("pinned_at").defaultNow().notNull(),
}, (table) => ({
  userChatPinnedIdx: uniqueIndex("user_chat_pinned_idx").on(table.userId, table.chatId),
}));

export type PinnedChat = typeof pinnedChatsTable.$inferSelect;
export type NewPinnedChat = typeof pinnedChatsTable.$inferInsert;
