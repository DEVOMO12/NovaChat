import { Router } from "express";
import { db, storiesTable, storyViewsTable, usersTable, eq, and, desc, sql } from "@workspace/db";

const router = Router();

function getUserByFirebase(req: any) {
  return db.select().from(usersTable).where(eq(usersTable.firebaseUid, req.firebaseUid!)).limit(1);
}

router.get("/stories", async (req, res) => {
  try {
    const [user] = await getUserByFirebase(req);
    if (!user) { res.status(404).json({ error: "User not found" }); return; }
    const now = new Date();
    const stories = await db.select().from(storiesTable).where(sql`${storiesTable.expiresAt} > ${now}`).orderBy(desc(storiesTable.createdAt));
    const enriched = await Promise.all(stories.map(async (story) => {
      const [storyUser] = await db.select().from(usersTable).where(eq(usersTable.id, story.userId)).limit(1);
      const viewRows = await db.select({ user: usersTable }).from(storyViewsTable).where(eq(storyViewsTable.storyId, story.id)).leftJoin(usersTable, eq(storyViewsTable.userId, usersTable.id));
      const myView = viewRows.find(v => v.user?.id === user.id);
      return { ...story, user: storyUser, views: viewRows.map(v => v.user), viewed: !!myView };
    }));
    res.json({ stories: enriched });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/stories", async (req, res) => {
  try {
    const [user] = await getUserByFirebase(req);
    if (!user) { res.status(404).json({ error: "User not found" }); return; }
    const { type, content, mediaUrl } = req.body;
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const [story] = await db.insert(storiesTable).values({ userId: user.id, type: type || "text", content, mediaUrl, expiresAt }).returning();
    res.status(201).json({ story });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/stories/:id/view", async (req, res) => {
  try {
    const [user] = await getUserByFirebase(req);
    if (!user) { res.status(404).json({ error: "User not found" }); return; }
    await db.insert(storyViewsTable).values({ storyId: parseInt(req.params.id), userId: user.id }).onConflictDoNothing();
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/stories/:id", async (req, res) => {
  try {
    const [user] = await getUserByFirebase(req);
    if (!user) { res.status(404).json({ error: "User not found" }); return; }
    await db.delete(storiesTable).where(and(eq(storiesTable.id, parseInt(req.params.id)), eq(storiesTable.userId, user.id)));
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
