import { Router } from "express";
import { db, notificationsTable, usersTable, eq, and, desc } from "@workspace/db";

const router = Router();

function getUserByFirebase(req: any) {
  return db.select().from(usersTable).where(eq(usersTable.firebaseUid, req.firebaseUid!)).limit(1);
}

router.get("/notifications", async (req, res) => {
  try {
    const [user] = await getUserByFirebase(req);
    if (!user) { res.status(404).json({ error: "User not found" }); return; }
    const notifications = await db.select().from(notificationsTable).where(eq(notificationsTable.userId, user.id)).orderBy(desc(notificationsTable.createdAt)).limit(50);
    res.json({ notifications });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/notifications/read", async (req, res) => {
  try {
    const [user] = await getUserByFirebase(req);
    if (!user) { res.status(404).json({ error: "User not found" }); return; }
    const { id } = req.body;
    if (id) {
      await db.update(notificationsTable).set({ read: true }).where(and(eq(notificationsTable.id, id), eq(notificationsTable.userId, user.id)));
    } else {
      await db.update(notificationsTable).set({ read: true }).where(eq(notificationsTable.userId, user.id));
    }
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/notifications/:id", async (req, res) => {
  try {
    const [user] = await getUserByFirebase(req);
    if (!user) { res.status(404).json({ error: "User not found" }); return; }
    await db.delete(notificationsTable).where(and(eq(notificationsTable.id, parseInt(req.params.id)), eq(notificationsTable.userId, user.id)));
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
