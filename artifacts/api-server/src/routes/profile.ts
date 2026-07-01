import { Router } from "express";
import { db, usersTable, eq } from "@workspace/db";

const router = Router();

router.get("/profile", async (req, res) => {
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

router.put("/profile", async (req, res) => {
  try {
    const { displayName, bio, phone, avatar } = req.body;
    const [user] = await db.update(usersTable).set({
      ...(displayName && { displayName }),
      ...(bio !== undefined && { bio }),
      ...(phone && { phone }),
      ...(avatar && { avatar }),
      updatedAt: new Date(),
    }).where(eq(usersTable.firebaseUid, req.firebaseUid!)).returning();
    res.json({ user });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/users/:id", async (req, res) => {
  try {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, parseInt(req.params.id))).limit(1);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.json({ user });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/users", async (_req, res) => {
  try {
    const users = await db.select().from(usersTable);
    res.json({ users });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
