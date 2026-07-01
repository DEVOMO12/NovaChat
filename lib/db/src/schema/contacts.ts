import { pgTable, serial, integer, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const contactsTable = pgTable("contacts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  contactId: integer("contact_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  addedAt: timestamp("added_at").defaultNow().notNull(),
}, (table) => ({
  userContactIdx: uniqueIndex("user_contact_idx").on(table.userId, table.contactId),
}));

export type Contact = typeof contactsTable.$inferSelect;
export type NewContact = typeof contactsTable.$inferInsert;
