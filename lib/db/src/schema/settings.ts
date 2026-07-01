import { pgTable, serial, integer, text, uniqueIndex } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const settingsTable = pgTable("settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  key: text("key").notNull(),
  value: text("value").notNull(),
}, (table) => ({
  userSettingIdx: uniqueIndex("user_setting_idx").on(table.userId, table.key),
}));

export type Setting = typeof settingsTable.$inferSelect;
export type NewSetting = typeof settingsTable.$inferInsert;
