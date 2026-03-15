import { getServerEnv } from "@elsesourav/config";
import { createApp } from "./app";

const env = getServerEnv();
const port = env.THEME_SERVICE_PORT ?? 4005;

const app = createApp();

app.listen(port, () => {
  console.log(`[theme-service] listening on http://localhost:${port}`);
});
