import { getServerEnv } from "@elsesourav/config";
import { createApp } from "./app";
import { startScheduledCategoryDeletionProcessor } from "./lib/category-deletion-processor";

const env = getServerEnv();
const port = env.CATALOG_SERVICE_PORT ?? 4002;

const app = createApp();
const stopScheduledCategoryDeletionProcessor =
  startScheduledCategoryDeletionProcessor();

const server = app.listen(port, () => {
  console.log(`[catalog-service] listening on http://localhost:${port}`);
});

function shutdown(signal: string) {
  console.log(`[catalog-service] received ${signal}, shutting down`);

  stopScheduledCategoryDeletionProcessor();

  server.close(() => {
    process.exit(0);
  });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
