import { createServer } from "http";
import app from "./app";
import { setupSocket } from "./socket";
import { logger } from "./lib/logger";
import { ensureBucketExists } from "./lib/supabase";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error("PORT environment variable is required but was not provided.");
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const httpServer = createServer(app);
setupSocket(httpServer);

ensureBucketExists().catch((err) => {
  logger.warn({ err }, "Failed to ensure Supabase storage bucket exists");
});

httpServer.listen(port, () => {
  logger.info({ port }, "Server listening with Socket.IO");
});
