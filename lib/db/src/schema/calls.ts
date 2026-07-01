import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const callsTable = pgTable("calls", {
  id: serial("id").primaryKey(),
  callerId: integer("caller_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  receiverId: integer("receiver_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  direction: text("direction").notNull(),
  status: text("status").notNull().default("missed"),
  duration: integer("duration").default(0),
  startedAt: timestamp("started_at"),
  endedAt: timestamp("ended_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Call = typeof callsTable.$inferSelect;
export type NewCall = typeof callsTable.$inferInsert;
