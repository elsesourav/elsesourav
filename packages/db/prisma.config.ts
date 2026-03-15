import { config as loadEnv } from "dotenv";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "prisma/config";

const currentDir = dirname(fileURLToPath(import.meta.url));

// Load repository-level env by default, then allow package-local overrides.
loadEnv({ path: resolve(currentDir, "../../.env") });
loadEnv({ path: resolve(currentDir, ".env"), override: true });

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL ?? "",
  },
});
