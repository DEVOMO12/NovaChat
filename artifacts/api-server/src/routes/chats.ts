import { Router } from "express";
import { db, chatsTable, chatMembersTable, messagesTable, messageStatusTable, usersTable, pinnedChatsTable, mutedChatsTable, archivedChatsTable, eq, and, or, desc, asc, sql } from "@workspace/db";
import { getIO } from "../socket";

const router = Router();

function getUserByFirebase(req: any) {
  return db.select().from(usersTable).where(eq(usersTable.firebaseUid, req.firebaseUid!)).limit(1);
}

router.get("/chats", async (req, res) => {
  try {
    const [user] = await getUserByFirebase(req);
    if (!user) { res.status(404).json({ error: "User not found" }); return; }
    const memberships = await db.select().from(chatMembersTable).where(eq(chatMembersTable.userId, user.id));
    const chatIds = memberships.map(m => m.chatId);
    if (chatIds.length === 0) { res.json({ chats: [] }); return; }
    const chats = await db.select().from(chatsTable).where(sql`${chatsTable.id} = ANY(${chatIds})`).orderBy(desc(chatsTable.updatedAt));
    const pinned = await db.select().from(pinnedChatsTable).where(eq(pinnedChatsTable.userId, user.id));
    const muted = await db.select().from(mutedChatsTable).where(eq(mutedChatsTable.userId, user.id));
    const archived = await db.select().from(archivedChatsTable).where(eq(archivedChatsTable.userId, user.id));
    const pinnedChatIds = new Set(pinned.map(p => p.chatId));
    const mutedChatIds = new Set(muted.map(m => m.chatId));
    const archivedChatIds = new Set(archived.map(a => a.chatId));
    const enriched = await Promise.all(chats.map(async (chat) => {
      const lastMsgRows = await db.select().from(messagesTable).where(eq(messagesTable.chatId, chat.id)).orderBy(desc(messagesTable.createdAt)).limit(1);
      const lastMsg = lastMsgRows[0] || null;
      const unreadRows = await db.select().from(messageStatusTable).where(
        and(eq(messageStatusTable.messageId, lastMsg?.id || 0), eq(messageStatusTable.userId, user.id), eq(messageStatusTable.status, "sent"))
      );
      const memberRows = await db.select({ user: usersTable }).from(chatMembersTable).where(eq(chatMembersTable.chatId, chat.id)).leftJoin(usersTable, eq(chatMembersTable.userId, usersTable.id));
      return {
        ...chat,
        lastMessage: lastMsg?.text || "",
        lastTime: lastMsg?.createdAt || chat.createdAt,
        unread: unreadRows.length,
        members: memberRows.map(r => r.user),
        pinned: pinnedChatIds.has(chat.id),
        muted: mutedChatIds.has(chat.id),
        archived: archivedChatIds.has(chat.id),
      };
    }));
    res.json({ chats: enriched });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/chats", async (req, res) => {
  try {
    const { participantIds, name, isGroup } = req.body;
    const [user] = await getUserByFirebase(req);
    if (!user) { res.status(404).json({ error: "User not found" }); return; }
    const allIds = [user.id, ...participantIds.filter((id: number) => id !== user.id)];
    if (!isGroup && allIds.length === 2) {
      const existing = await db.select({ chatId: chatMembersTable.chatId }).from(chatMembersTable).where(
        and(eq(chatMembersTable.userId, allIds[0]), sql`${chatMembersTable.chatId} IN (SELECT ${chatMembersTable.chatId} FROM ${chatMembersTable} WHERE ${chatMembersTable.userId} = ${allIds[1]})`)
      ).limit(1);
      if (existing.length > 0) {
        const [chat] = await db.select().from(chatsTable).where(eq(chatsTable.id, existing[0].chatId)).limit(1);
        if (chat) { res.json({ chat }); return; }
      }
    }
    const [chat] = await db.insert(chatsTable).values({ name: name || null, isGroup: isGroup || false }).returning();
    for (const uid of allIds) {
      await db.insert(chatMembersTable).values({ chatId: chat.id, userId: uid, role: uid === user.id ? "admin" : "member" });
    }
    res.status(201).json({ chat });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/chats/:id", async (req, res) => {
  try {
    const [user] = await getUserByFirebase(req);
    if (!user) { res.status(404).json({ error: "User not found" }); return; }
    const [chat] = await db.select().from(chatsTable).where(eq(chatsTable.id, parseInt(req.params.id))).limit(1);
    if (!chat) { res.status(404).json({ error: "Chat not found" }); return; }
    const members = await db.select({ user: usersTable }).from(chatMembersTable).where(eq(chatMembersTable.chatId, chat.id)).leftJoin(usersTable, eq(chatMembersTable.userId, usersTable.id));
    res.json({ chat, members: members.map(m => m.user) });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/chats/:id/leave", async (req, res) => {
  try {
    const [user] = await getUserByFirebase(req);
    if (!user) { res.status(404).json({ error: "User not found" }); return; }
    await db.delete(chatMembersTable).where(and(eq(chatMembersTable.chatId, parseInt(req.params.id)), eq(chatMembersTable.userId, user.id)));
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/chats/:id/read", async (req, res) => {
  try {
    const [user] = await getUserByFirebase(req);
    if (!user) { res.status(404).json({ error: "User not found" }); return; }
    const chatId = parseInt(req.params.id);
    await db.update(messageStatusTable).set({ status: "read", timestamp: new Date() }).where(
      and(eq(messageStatusTable.userId, user.id), eq(messageStatusTable.status, "sent"), sql`${messageStatusTable.messageId} IN (SELECT ${messagesTable.id} FROM ${messagesTable} WHERE ${messagesTable.chatId} = ${chatId})`)
    );
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/chats/:id/pin", async (req, res) => {
  try {
    const [user] = await getUserByFirebase(req);
    if (!user) { res.status(404).json({ error: "User not found" }); return; }
    await db.insert(pinnedChatsTable).values({ userId: user.id, chatId: parseInt(req.params.id) }).onConflictDoNothing();
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/chats/:id/unpin", async (req, res) => {
  try {
    const [user] = await getUserByFirebase(req);
    if (!user) { res.status(404).json({ error: "User not found" }); return; }
    await db.delete(pinnedChatsTable).where(and(eq(pinnedChatsTable.userId, user.id), eq(pinnedChatsTable.chatId, parseInt(req.params.id))));
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/chats/:id/mute", async (req, res) => {
  try {
    const [user] = await getUserByFirebase(req);
    if (!user) { res.status(404).json({ error: "User not found" }); return; }
    await db.insert(mutedChatsTable).values({ userId: user.id, chatId: parseInt(req.params.id) }).onConflictDoNothing();
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/chats/:id/unmute", async (req, res) => {
  try {
    const [user] = await getUserByFirebase(req);
    if (!user) { res.status(404).json({ error: "User not found" }); return; }
    await db.delete(mutedChatsTable).where(and(eq(mutedChatsTable.userId, user.id), eq(mutedChatsTable.chatId, parseInt(req.params.id))));
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/chats/:id/archive", async (req, res) => {
  try {
    const [user] = await getUserByFirebase(req);
    if (!user) { res.status(404).json({ error: "User not found" }); return; }
    await db.insert(archivedChatsTable).values({ userId: user.id, chatId: parseInt(req.params.id) }).onConflictDoNothing();
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/chats/:id/unarchive", async (req, res) => {
  try {
    const [user] = await getUserByFirebase(req);
    if (!user) { res.status(404).json({ error: "User not found" }); return; }
    await db.delete(archivedChatsTable).where(and(eq(archivedChatsTable.userId, user.id), eq(archivedChatsTable.chatId, parseInt(req.params.id))));
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
