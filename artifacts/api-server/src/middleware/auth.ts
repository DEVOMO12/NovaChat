import { Request, Response, NextFunction } from "express";
import admin from "firebase-admin";

try {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
    });
  }
} catch (e) {
  console.warn("Firebase Admin init failed (auth endpoints will 500):", (e as Error).message);
}

declare global {
  namespace Express {
    interface Request {
      userId?: number;
      firebaseUid?: string;
    }
  }
}

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized: No token provided" });
    return;
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.firebaseUid = decoded.uid;
    next();
  } catch {
    res.status(401).json({ error: "Unauthorized: Invalid token" });
  }
}
