import { getServerEnv } from "@elsesourav/config";
import { createApp } from "./app";

const env = getServerEnv();
const port = env.USER_SERVICE_PORT ?? 4003;

const app = createApp();

app.listen(port, () => {
  console.log(`[user-service] listening on http://localhost:${port}`);
});
