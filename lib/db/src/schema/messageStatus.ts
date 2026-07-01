import { pgTable, serial, integer, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { usersTable } from "./users";
import { messagesTable } from "./messages";

export const messageStatusTable = pgTable("message_status", {
  id: serial("id").primaryKey(),
  messageId: integer("message_id").notNull().references(() => messagesTable.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  status: text("status").notNull().default("sent"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
}, (table) => ({
  messageUserStatusIdx: uniqueIndex("message_user_status_idx").on(table.messageId, table.userId),
}));

export type MessageStatus = typeof messageStatusTable.$inferSelect;
export type NewMessageStatus = typeof messageStatusTable.$inferInsert;
