import { pgTable, serial, text, boolean, timestamp } from "drizzle-orm/pg-core";

export const chatsTable = pgTable("chats", {
  id: serial("id").primaryKey(),
  name: text("name"),
  avatar: text("avatar"),
  isGroup: boolean("is_group").default(false).notNull(),
  createdBy: text("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Chat = typeof chatsTable.$inferSelect;
export type NewChat = typeof chatsTable.$inferInsert;
