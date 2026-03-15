import { getServerEnv } from "@elsesourav/config";
import { createApp } from "./app";

const env = getServerEnv();
const port = env.CONTENT_SERVICE_PORT ?? 4004;

const app = createApp();

app.listen(port, () => {
  console.log(`[content-service] listening on http://localhost:${port}`);
});
