import { pgTable, serial, integer, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { usersTable } from "./users";
import { chatsTable } from "./chats";

export const typingStatusTable = pgTable("typing_status", {
  id: serial("id").primaryKey(),
  chatId: integer("chat_id").notNull().references(() => chatsTable.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  isTyping: integer("is_typing").notNull().default(0),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  chatUserTypingIdx: uniqueIndex("chat_user_typing_idx").on(table.chatId, table.userId),
}));

export type TypingStatus = typeof typingStatusTable.$inferSelect;
export type NewTypingStatus = typeof typingStatusTable.$inferInsert;
