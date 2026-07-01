import { pgTable, serial, integer, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { usersTable } from "./users";
import { chatsTable } from "./chats";

export const mutedChatsTable = pgTable("muted_chats", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  chatId: integer("chat_id").notNull().references(() => chatsTable.id, { onDelete: "cascade" }),
  mutedAt: timestamp("muted_at").defaultNow().notNull(),
}, (table) => ({
  userChatMutedIdx: uniqueIndex("user_chat_muted_idx").on(table.userId, table.chatId),
}));

export type MutedChat = typeof mutedChatsTable.$inferSelect;
export type NewMutedChat = typeof mutedChatsTable.$inferInsert;
