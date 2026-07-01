import { pgTable, serial, integer, text, timestamp, integer as int } from "drizzle-orm/pg-core";
import { messagesTable } from "./messages";

export const attachmentsTable = pgTable("attachments", {
  id: serial("id").primaryKey(),
  messageId: integer("message_id").notNull().references(() => messagesTable.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  url: text("url").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  fileName: text("file_name"),
  fileSize: int("file_size"),
  mimeType: text("mime_type"),
  width: int("width"),
  height: int("height"),
  duration: int("duration"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Attachment = typeof attachmentsTable.$inferSelect;
export type NewAttachment = typeof attachmentsTable.$inferInsert;
