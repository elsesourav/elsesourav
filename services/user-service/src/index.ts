import { getServerEnv } from "@elsesourav/config";
import { createApp } from "./app";
import { startScheduledDeletionProcessor } from "./lib/deletion-processor";

const env = getServerEnv();
const port = env.USER_SERVICE_PORT ?? 4003;

const app = createApp();
const stopScheduledDeletionProcessor = startScheduledDeletionProcessor();

const server = app.listen(port, () => {
  console.log(`[user-service] listening on http://localhost:${port}`);
});

function shutdown(signal: string) {
  console.log(`[user-service] received ${signal}, shutting down`);

  stopScheduledDeletionProcessor();

  server.close(() => {
    process.exit(0);
  });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
