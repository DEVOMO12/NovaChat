import { Router } from "express";
import { db, callsTable, usersTable, eq, and, or, desc } from "@workspace/db";

const router = Router();

function getUserByFirebase(req: any) {
  return db.select().from(usersTable).where(eq(usersTable.firebaseUid, req.firebaseUid!)).limit(1);
}

router.get("/calls", async (req, res) => {
  try {
    const [user] = await getUserByFirebase(req);
    if (!user) { res.status(404).json({ error: "User not found" }); return; }
    const calls = await db.select().from(callsTable).where(
      or(eq(callsTable.callerId, user.id), eq(callsTable.receiverId, user.id))
    ).orderBy(desc(callsTable.createdAt));
    const enriched = await Promise.all(calls.map(async (call) => {
      const otherId = call.callerId === user.id ? call.receiverId : call.callerId;
      const [otherUser] = await db.select().from(usersTable).where(eq(usersTable.id, otherId)).limit(1);
      return { ...call, otherUser };
    }));
    res.json({ calls: enriched });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/calls", async (req, res) => {
  try {
    const [user] = await getUserByFirebase(req);
    if (!user) { res.status(404).json({ error: "User not found" }); return; }
    const { receiverId, type } = req.body;
    const [call] = await db.insert(callsTable).values({ callerId: user.id, receiverId, type, direction: "outgoing", status: "calling" }).returning();
    res.status(201).json({ call });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/calls/:id/status", async (req, res) => {
  try {
    const { status, duration } = req.body;
    const updateData: any = { status };
    if (status === "answered") updateData.startedAt = new Date();
    if (status === "ended" || status === "missed") updateData.endedAt = new Date();
    if (duration) updateData.duration = duration;
    const [call] = await db.update(callsTable).set(updateData).where(eq(callsTable.id, parseInt(req.params.id))).returning();
    res.json({ call });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
