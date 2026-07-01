import { pgTable, serial, integer, text, timestamp, boolean } from "drizzle-orm/pg-core";
import { usersTable } from "./users";
import { chatsTable } from "./chats";

export const messagesTable = pgTable("messages", {
  id: serial("id").primaryKey(),
  chatId: integer("chat_id").notNull().references(() => chatsTable.id, { onDelete: "cascade" }),
  senderId: integer("sender_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  text: text("text").default(""),
  type: text("type").default("text").notNull(),
  replyToId: integer("reply_to_id"),
  forwardedFromId: integer("forwarded_from_id"),
  isDeleted: boolean("is_deleted").default(false),
  deletedForEveryone: boolean("deleted_for_everyone").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Message = typeof messagesTable.$inferSelect;
export type NewMessage = typeof messagesTable.$inferInsert;
