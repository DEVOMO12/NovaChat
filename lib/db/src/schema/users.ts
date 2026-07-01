import { pgTable, text, timestamp, boolean, serial, uniqueIndex } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  firebaseUid: text("firebase_uid").notNull().unique(),
  username: text("username").notNull().unique(),
  displayName: text("display_name").notNull(),
  avatar: text("avatar"),
  bio: text("bio").default(""),
  phone: text("phone"),
  email: text("email").notNull(),
  lastSeen: timestamp("last_seen").defaultNow(),
  online: boolean("online").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  firebaseUidIdx: uniqueIndex("firebase_uid_idx").on(table.firebaseUid),
  emailIdx: uniqueIndex("email_idx").on(table.email),
}));

export type User = typeof usersTable.$inferSelect;
export type NewUser = typeof usersTable.$inferInsert;
