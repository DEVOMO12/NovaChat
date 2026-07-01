import { Router } from "express";
import { db, usersTable, eq } from "@workspace/db";

const router = Router();

router.post("/auth/register", async (req, res) => {
  try {
    const { firebaseUid, username, displayName, email } = req.body;
    if (!firebaseUid || !username || !displayName || !email) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }
    const existing = await db.select().from(usersTable).where(eq(usersTable.firebaseUid, firebaseUid)).limit(1);
    if (existing.length > 0) {
      res.json({ user: existing[0] });
      return;
    }
    const [user] = await db.insert(usersTable).values({
      firebaseUid,
      username,
      displayName,
      email,
    }).returning();
    res.status(201).json({ user });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/auth/me", async (req, res) => {
  try {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.firebaseUid, req.firebaseUid!)).limit(1);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.json({ user });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
