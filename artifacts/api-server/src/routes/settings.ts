import { Router } from "express";
import { db, settingsTable, usersTable, eq, and } from "@workspace/db";

const router = Router();

function getUserByFirebase(req: any) {
  return db.select().from(usersTable).where(eq(usersTable.firebaseUid, req.firebaseUid!)).limit(1);
}

router.get("/settings", async (req, res) => {
  try {
    const [user] = await getUserByFirebase(req);
    if (!user) { res.status(404).json({ error: "User not found" }); return; }
    const settings = await db.select().from(settingsTable).where(eq(settingsTable.userId, user.id));
    const map: Record<string, string> = {};
    for (const s of settings) map[s.key] = s.value;
    res.json({ settings: map });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/settings", async (req, res) => {
  try {
    const [user] = await getUserByFirebase(req);
    if (!user) { res.status(404).json({ error: "User not found" }); return; }
    const { settings } = req.body;
    for (const [key, value] of Object.entries(settings)) {
      const existing = await db.select().from(settingsTable).where(and(eq(settingsTable.userId, user.id), eq(settingsTable.key, key))).limit(1);
      if (existing.length > 0) {
        await db.update(settingsTable).set({ value: value as string }).where(eq(settingsTable.id, existing[0].id));
      } else {
        await db.insert(settingsTable).values({ userId: user.id, key, value: value as string });
      }
    }
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
