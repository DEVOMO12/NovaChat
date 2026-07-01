import { pgTable, serial, integer, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { usersTable } from "./users";
import { chatsTable } from "./chats";

export const archivedChatsTable = pgTable("archived_chats", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  chatId: integer("chat_id").notNull().references(() => chatsTable.id, { onDelete: "cascade" }),
  archivedAt: timestamp("archived_at").defaultNow().notNull(),
}, (table) => ({
  userChatArchivedIdx: uniqueIndex("user_chat_archived_idx").on(table.userId, table.chatId),
}));

export type ArchivedChat = typeof archivedChatsTable.$inferSelect;
export type NewArchivedChat = typeof archivedChatsTable.$inferInsert;
