import { z } from 'zod';

export const ServerEnvSchema = z.object({
  DATABASE_URL: z
    .string()
    .min(1, 'DATABASE_URL connection string is required for Prisma ORM')
    .optional(),
  DIRECT_URL: z
    .string()
    .min(1, 'DIRECT_URL connection string is required for Prisma migrations')
    .optional(),
  SUPABASE_SERVICE_ROLE_KEY: z
    .string()
    .min(1, 'SUPABASE_SERVICE_ROLE_KEY is required for privileged server actions')
    .optional(),
  CLOUDINARY_API_KEY: z
    .string()
    .min(1, 'CLOUDINARY_API_KEY is required for server upload signatures')
    .optional(),
  CLOUDINARY_API_SECRET: z
    .string()
    .min(1, 'CLOUDINARY_API_SECRET is required for server upload signatures')
    .optional(),
  NODE_ENV: z.enum(['development', 'staging', 'production', 'test']).default('development'),
});

export type ServerEnv = z.infer<typeof ServerEnvSchema>;

export function validateServerEnv(env: Record<string, unknown> = process.env): ServerEnv {
  const result = ServerEnvSchema.safeParse(env);
  if (!result.success) {
    const errorDetails = result.error.issues
      .map((issue) => `  • ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');
    throw new Error(
      `[ElseSourav Server Config Error] Invalid server environment configuration:\n${errorDetails}\nPlease check your server secrets configuration.`
    );
  }
  return result.data;
}
