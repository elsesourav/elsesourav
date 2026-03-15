import { z } from "zod";

const serverEnvSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  DATABASE_URL: z.string().url().optional(),
  INTERNAL_SERVICE_TOKEN: z.string().min(16).optional(),
  AUTH_JWT_SECRET: z.string().min(16).optional(),
  AUTH_SERVICE_URL: z.string().url().optional(),
  CATALOG_SERVICE_URL: z.string().url().optional(),
  USER_SERVICE_URL: z.string().url().optional(),
  CONTENT_SERVICE_URL: z.string().url().optional(),
  THEME_SERVICE_URL: z.string().url().optional(),
  AUTH_SERVICE_PORT: z.coerce.number().int().positive().optional(),
  CATALOG_SERVICE_PORT: z.coerce.number().int().positive().optional(),
  USER_SERVICE_PORT: z.coerce.number().int().positive().optional(),
  CONTENT_SERVICE_PORT: z.coerce.number().int().positive().optional(),
  THEME_SERVICE_PORT: z.coerce.number().int().positive().optional(),
  NEXTAUTH_URL: z.string().url().optional(),
  NEXTAUTH_SECRET: z.string().min(32).optional(),
  GITHUB_ID: z.string().min(1).optional(),
  GITHUB_SECRET: z.string().min(1).optional(),
  CLOUDINARY_CLOUD_NAME: z.string().min(1).optional(),
  CLOUDINARY_API_KEY: z.string().min(1).optional(),
  CLOUDINARY_API_SECRET: z.string().min(1).optional(),
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1).optional(),
  SENTRY_DSN: z.string().url().optional(),
  ADMIN_EMAIL: z.string().email().optional(),
  ADMIN_PASSWORD: z.string().min(8).optional(),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

let cachedEnv: ServerEnv | null = null;

export function getServerEnv(): ServerEnv {
  if (cachedEnv) {
    return cachedEnv;
  }

  const parsed = serverEnvSchema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ");
    throw new Error(`Invalid environment configuration: ${issues}`);
  }

  cachedEnv = parsed.data;
  return cachedEnv;
}

export function requireEnv<K extends keyof ServerEnv>(
  keys: K[],
): { [P in K]: NonNullable<ServerEnv[P]> } {
  const env = getServerEnv();
  const missing = keys.filter((key) => !env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`,
    );
  }

  return keys.reduce(
    (acc, key) => {
      acc[key] = env[key] as NonNullable<ServerEnv[K]>;
      return acc;
    },
    {} as { [P in K]: NonNullable<ServerEnv[P]> },
  );
}
