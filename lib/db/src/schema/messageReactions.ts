import { pgTable, serial, integer, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { usersTable } from "./users";
import { messagesTable } from "./messages";

export const messageReactionsTable = pgTable("message_reactions", {
  id: serial("id").primaryKey(),
  messageId: integer("message_id").notNull().references(() => messagesTable.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  reaction: text("reaction").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  messageUserReactionIdx: uniqueIndex("message_user_reaction_idx").on(table.messageId, table.userId),
}));

export type MessageReaction = typeof messageReactionsTable.$inferSelect;
export type NewMessageReaction = typeof messageReactionsTable.$inferInsert;
