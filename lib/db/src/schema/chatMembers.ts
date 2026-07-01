import { pgTable, serial, integer, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { usersTable } from "./users";
import { chatsTable } from "./chats";

export const chatMembersTable = pgTable("chat_members", {
  id: serial("id").primaryKey(),
  chatId: integer("chat_id").notNull().references(() => chatsTable.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  role: text("role").default("member").notNull(),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
}, (table) => ({
  chatUserIdx: uniqueIndex("chat_user_member_idx").on(table.chatId, table.userId),
}));

export type ChatMember = typeof chatMembersTable.$inferSelect;
export type NewChatMember = typeof chatMembersTable.$inferInsert;
