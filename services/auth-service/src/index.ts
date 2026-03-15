import { getServerEnv } from "@elsesourav/config";
import { createApp } from "./app";

const env = getServerEnv();
const port = env.AUTH_SERVICE_PORT ?? 4001;

const app = createApp();

app.listen(port, () => {
  console.log(`[auth-service] listening on http://localhost:${port}`);
});
