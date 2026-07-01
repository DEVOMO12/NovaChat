import { io, Socket } from "socket.io-client";
import { auth } from "./firebase";

let socket: Socket | null = null;

export async function connectSocket() {
  if (socket?.connected) return socket;
  const token = await auth.currentUser?.getIdToken();
  if (!token) return null;
  const url = process.env.EXPO_PUBLIC_API_URL || "http://localhost:5000";
  socket = io(url, { auth: { token }, transports: ["websocket"] });
  socket.on("connect_error", (err) => console.error("Socket error:", err.message));
  return socket;
}

export function getSocket() {
  return socket;
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}
