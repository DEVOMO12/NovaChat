import { Router } from "express";
import { db, contactsTable, usersTable, friendRequestsTable, and, eq, or } from "@workspace/db";

const router = Router();

router.get("/contacts", async (req, res) => {
  try {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.firebaseUid, req.firebaseUid!)).limit(1);
    if (!user) { res.status(404).json({ error: "User not found" }); return; }
    const contacts = await db.select({
      contact: usersTable,
    }).from(contactsTable).where(eq(contactsTable.userId, user.id)).leftJoin(usersTable, eq(contactsTable.contactId, usersTable.id));
    res.json({ contacts: contacts.map(c => c.contact) });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/contacts/add", async (req, res) => {
  try {
    const { contactId } = req.body;
    const [user] = await db.select().from(usersTable).where(eq(usersTable.firebaseUid, req.firebaseUid!)).limit(1);
    if (!user) { res.status(404).json({ error: "User not found" }); return; }
    await db.insert(contactsTable).values({ userId: user.id, contactId }).onConflictDoNothing();
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/contacts/remove", async (req, res) => {
  try {
    const { contactId } = req.body;
    const [user] = await db.select().from(usersTable).where(eq(usersTable.firebaseUid, req.firebaseUid!)).limit(1);
    if (!user) { res.status(404).json({ error: "User not found" }); return; }
    await db.delete(contactsTable).where(and(eq(contactsTable.userId, user.id), eq(contactsTable.contactId, contactId)));
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/friend-requests", async (req, res) => {
  try {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.firebaseUid, req.firebaseUid!)).limit(1);
    if (!user) { res.status(404).json({ error: "User not found" }); return; }
    const requests = await db.select().from(friendRequestsTable).where(
      and(eq(friendRequestsTable.toUserId, user.id), eq(friendRequestsTable.status, "pending"))
    );
    res.json({ requests });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/friend-requests/send", async (req, res) => {
  try {
    const { toUserId } = req.body;
    const [user] = await db.select().from(usersTable).where(eq(usersTable.firebaseUid, req.firebaseUid!)).limit(1);
    if (!user) { res.status(404).json({ error: "User not found" }); return; }
    const [request] = await db.insert(friendRequestsTable).values({ fromUserId: user.id, toUserId }).returning();
    res.status(201).json({ request });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/friend-requests/accept", async (req, res) => {
  try {
    const { requestId } = req.body;
    const [request] = await db.update(friendRequestsTable).set({ status: "accepted", updatedAt: new Date() }).where(eq(friendRequestsTable.id, requestId)).returning();
    if (request) {
      await db.insert(contactsTable).values({ userId: request.fromUserId, contactId: request.toUserId }).onConflictDoNothing();
      await db.insert(contactsTable).values({ userId: request.toUserId, contactId: request.fromUserId }).onConflictDoNothing();
    }
    res.json({ request });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/friend-requests/reject", async (req, res) => {
  try {
    const { requestId } = req.body;
    const [request] = await db.update(friendRequestsTable).set({ status: "rejected", updatedAt: new Date() }).where(eq(friendRequestsTable.id, requestId)).returning();
    res.json({ request });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
