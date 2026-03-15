import { getServerEnv } from "@elsesourav/config";
import { createApp } from "./app";

const env = getServerEnv();
const port = env.CATALOG_SERVICE_PORT ?? 4002;

const app = createApp();

app.listen(port, () => {
  console.log(`[catalog-service] listening on http://localhost:${port}`);
});
