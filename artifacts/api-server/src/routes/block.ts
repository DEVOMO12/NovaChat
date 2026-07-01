import { Router } from "express";
import { db, blockedUsersTable, usersTable, eq, and } from "@workspace/db";

const router = Router();

function getUserByFirebase(req: any) {
  return db.select().from(usersTable).where(eq(usersTable.firebaseUid, req.firebaseUid!)).limit(1);
}

router.get("/blocked", async (req, res) => {
  try {
    const [user] = await getUserByFirebase(req);
    if (!user) { res.status(404).json({ error: "User not found" }); return; }
    const blocked = await db.select({ blockedUser: usersTable }).from(blockedUsersTable).where(eq(blockedUsersTable.userId, user.id)).leftJoin(usersTable, eq(blockedUsersTable.blockedUserId, usersTable.id));
    res.json({ blocked: blocked.map(b => b.blockedUser) });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/block", async (req, res) => {
  try {
    const [user] = await getUserByFirebase(req);
    if (!user) { res.status(404).json({ error: "User not found" }); return; }
    const { blockedUserId } = req.body;
    await db.insert(blockedUsersTable).values({ userId: user.id, blockedUserId }).onConflictDoNothing();
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/unblock", async (req, res) => {
  try {
    const [user] = await getUserByFirebase(req);
    if (!user) { res.status(404).json({ error: "User not found" }); return; }
    const { blockedUserId } = req.body;
    await db.delete(blockedUsersTable).where(and(eq(blockedUsersTable.userId, user.id), eq(blockedUsersTable.blockedUserId, blockedUserId)));
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
