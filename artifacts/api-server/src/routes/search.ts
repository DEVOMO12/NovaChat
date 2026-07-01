import { Router } from "express";
import { db, usersTable, messagesTable, eq, ilike, or, and, desc } from "@workspace/db";

const router = Router();

router.get("/search/users", async (req, res) => {
  try {
    const q = req.query.q as string || "";
    if (!q.trim()) { res.json({ users: [] }); return; }
    const users = await db.select().from(usersTable).where(
      or(ilike(usersTable.displayName, `%${q}%`), ilike(usersTable.username, `%${q}%`), ilike(usersTable.email, `%${q}%`))
    ).limit(20);
    res.json({ users });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/search/messages", async (req, res) => {
  try {
    const q = req.query.q as string || "";
    if (!q.trim()) { res.json({ messages: [] }); return; }
    const messages = await db.select().from(messagesTable).where(
      and(ilike(messagesTable.text, `%${q}%`), eq(messagesTable.isDeleted, false))
    ).orderBy(desc(messagesTable.createdAt)).limit(50);
    res.json({ messages });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
