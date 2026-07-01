import { Router } from "express";
import { db, messagesTable, messageStatusTable, messageReactionsTable, usersTable, chatMembersTable, attachmentsTable, chatsTable, eq, and, desc, asc, sql } from "@workspace/db";
import { getIO } from "../socket";

const router = Router();

function getUserByFirebase(req: any) {
  return db.select().from(usersTable).where(eq(usersTable.firebaseUid, req.firebaseUid!)).limit(1);
}

router.get("/chats/:chatId/messages", async (req, res) => {
  try {
    const [user] = await getUserByFirebase(req);
    if (!user) { res.status(404).json({ error: "User not found" }); return; }
    const chatId = parseInt(req.params.chatId);
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = (page - 1) * limit;
    const messages = await db.select().from(messagesTable).where(
      and(eq(messagesTable.chatId, chatId), eq(messagesTable.isDeleted, false))
    ).orderBy(desc(messagesTable.createdAt)).limit(limit).offset(offset);
    const enriched = await Promise.all(messages.map(async (msg) => {
      const statusRows = await db.select().from(messageStatusTable).where(eq(messageStatusTable.messageId, msg.id));
      const reactionRows = await db.select({
        reaction: messageReactionsTable.reaction, userId: messageReactionsTable.userId, user: usersTable,
      }).from(messageReactionsTable).where(eq(messageReactionsTable.messageId, msg.id)).leftJoin(usersTable, eq(messageReactionsTable.userId, usersTable.id));
      const attachmentRows = await db.select().from(attachmentsTable).where(eq(attachmentsTable.messageId, msg.id));
      const [sender] = await db.select().from(usersTable).where(eq(usersTable.id, msg.senderId)).limit(1);
      return { ...msg, statuses: statusRows, reactions: reactionRows, attachments: attachmentRows, sender };
    }));
    res.json({ messages: enriched, page, limit });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/chats/:chatId/messages", async (req, res) => {
  try {
    const [user] = await getUserByFirebase(req);
    if (!user) { res.status(404).json({ error: "User not found" }); return; }
    const chatId = parseInt(req.params.chatId);
    const { text, type, replyToId, forwardedFromId } = req.body;
    const [message] = await db.insert(messagesTable).values({
      chatId, senderId: user.id, text: text || "", type: type || "text", replyToId, forwardedFromId,
    }).returning();
    const members = await db.select().from(chatMembersTable).where(eq(chatMembersTable.chatId, chatId));
    for (const member of members) {
      if (member.userId !== user.id) {
        await db.insert(messageStatusTable).values({ messageId: message.id, userId: member.userId, status: "sent" });
      }
    }
    await db.insert(messageStatusTable).values({ messageId: message.id, userId: user.id, status: "read" });
    await db.update(chatsTable).set({ updatedAt: new Date() }).where(eq(chatsTable.id, chatId));
    const [sender] = await db.select().from(usersTable).where(eq(usersTable.id, user.id)).limit(1);
    const enriched = { ...message, sender, statuses: [], reactions: [], attachments: [] };
    const io = getIO();
    if (io) {
      for (const member of members) {
        io.to(`user:${member.userId}`).emit("new_message", { message: enriched, chatId });
      }
    }
    res.status(201).json({ message: enriched });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/messages/:id", async (req, res) => {
  try {
    const [user] = await getUserByFirebase(req);
    if (!user) { res.status(404).json({ error: "User not found" }); return; }
    const { deleteFor } = req.query;
    const msgId = parseInt(req.params.id);
    if (deleteFor === "everyone") {
      await db.update(messagesTable).set({ isDeleted: true, deletedForEveryone: true }).where(eq(messagesTable.id, msgId));
    } else {
      await db.update(messagesTable).set({ isDeleted: true }).where(and(eq(messagesTable.id, msgId), eq(messagesTable.senderId, user.id)));
    }
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/messages/:id", async (req, res) => {
  try {
    const [user] = await getUserByFirebase(req);
    if (!user) { res.status(404).json({ error: "User not found" }); return; }
    const { text } = req.body;
    const [message] = await db.update(messagesTable).set({ text, updatedAt: new Date() }).where(and(eq(messagesTable.id, parseInt(req.params.id)), eq(messagesTable.senderId, user.id))).returning();
    if (!message) { res.status(404).json({ error: "Message not found or not yours" }); return; }
    const members = await db.select().from(chatMembersTable).where(eq(chatMembersTable.chatId, message.chatId));
    const io = getIO();
    if (io) {
      for (const m of members) {
        io.to(`user:${m.userId}`).emit("message_edited", { message, chatId: message.chatId });
      }
    }
    res.json({ message });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/messages/:id/react", async (req, res) => {
  try {
    const [user] = await getUserByFirebase(req);
    if (!user) { res.status(404).json({ error: "User not found" }); return; }
    const { reaction } = req.body;
    const msgId = parseInt(req.params.id);
    const existing = await db.select().from(messageReactionsTable).where(and(eq(messageReactionsTable.messageId, msgId), eq(messageReactionsTable.userId, user.id))).limit(1);
    if (existing.length > 0) {
      await db.update(messageReactionsTable).set({ reaction }).where(eq(messageReactionsTable.id, existing[0].id));
    } else {
      await db.insert(messageReactionsTable).values({ messageId: msgId, userId: user.id, reaction });
    }
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/messages/:id/react", async (req, res) => {
  try {
    const [user] = await getUserByFirebase(req);
    if (!user) { res.status(404).json({ error: "User not found" }); return; }
    await db.delete(messageReactionsTable).where(and(eq(messageReactionsTable.messageId, parseInt(req.params.id)), eq(messageReactionsTable.userId, user.id)));
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
