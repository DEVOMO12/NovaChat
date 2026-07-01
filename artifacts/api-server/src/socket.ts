import { Server as HTTPServer } from "http";
import { Server, Socket } from "socket.io";
import admin from "firebase-admin";
import { db, usersTable, typingStatusTable, eq, and, sql } from "@workspace/db";

let io: Server | null = null;

export function getIO(): Server | null {
  return io;
}

export function setupSocket(httpServer: HTTPServer) {
  io = new Server(httpServer, {
    cors: { origin: "*", methods: ["GET", "POST"] },
  });

  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error("Authentication required"));
    }
    try {
      const decoded = await admin.auth().verifyIdToken(token);
      (socket as any).firebaseUid = decoded.uid;
      next();
    } catch {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", async (socket: Socket) => {
    const firebaseUid = (socket as any).firebaseUid;
    const [user] = await db.select().from(usersTable).where(eq(usersTable.firebaseUid, firebaseUid)).limit(1);
    if (!user) {
      socket.disconnect();
      return;
    }

    socket.join(`user:${user.id}`);
    socket.data.userId = user.id;

    await db.update(usersTable).set({ online: true, lastSeen: new Date() }).where(eq(usersTable.id, user.id));
    io!.emit("presence", { userId: user.id, online: true });

    socket.on("typing:start", async (data: { chatId: number }) => {
      socket.to(`chat:${data.chatId}`).emit("typing:start", { userId: user.id, chatId: data.chatId });
      await db.insert(typingStatusTable).values({ chatId: data.chatId, userId: user.id, isTyping: 1 }).onConflictDoUpdate({ target: [typingStatusTable.chatId, typingStatusTable.userId], set: { isTyping: 1, updatedAt: new Date() } });
    });

    socket.on("typing:stop", async (data: { chatId: number }) => {
      socket.to(`chat:${data.chatId}`).emit("typing:stop", { userId: user.id, chatId: data.chatId });
      await db.update(typingStatusTable).set({ isTyping: 0, updatedAt: new Date() }).where(and(eq(typingStatusTable.chatId, data.chatId), eq(typingStatusTable.userId, user.id)));
    });

    socket.on("call:offer", (data: { to: number; sdp: any }) => {
      io!.to(`user:${data.to}`).emit("call:offer", { from: user.id, sdp: data.sdp });
    });

    socket.on("call:answer", (data: { to: number; sdp: any }) => {
      io!.to(`user:${data.to}`).emit("call:answer", { from: user.id, sdp: data.sdp });
    });

    socket.on("call:ice-candidate", (data: { to: number; candidate: any }) => {
      io!.to(`user:${data.to}`).emit("call:ice-candidate", { from: user.id, candidate: data.candidate });
    });

    socket.on("call:end", (data: { to: number }) => {
      io!.to(`user:${data.to}`).emit("call:end", { from: user.id });
    });

    socket.on("disconnect", async () => {
      await db.update(usersTable).set({ online: false, lastSeen: new Date() }).where(eq(usersTable.id, user.id));
      io?.emit("presence", { userId: user.id, online: false });
    });

    socket.on("join:chat", (chatId: number) => {
      socket.join(`chat:${chatId}`);
    });

    socket.on("leave:chat", (chatId: number) => {
      socket.leave(`chat:${chatId}`);
    });
  });

  return io;
}
