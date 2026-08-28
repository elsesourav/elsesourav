import { z } from 'zod';

export const ClientEnvSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.string().url('NEXT_PUBLIC_SITE_URL must be a valid URL').default('https://elsesourav.com'),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('NEXT_PUBLIC_SUPABASE_URL must be a valid URL').optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'NEXT_PUBLIC_SUPABASE_ANON_KEY cannot be empty').optional(),
  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: z.string().min(1).default('elsesourav'),
  NEXT_PUBLIC_ENABLE_ANALYTICS: z
    .union([z.boolean(), z.string().transform((v) => v === 'true')])
    .default(true),
});

export const ServerEnvSchema = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL connection string is required').optional(),
  DIRECT_URL: z.string().min(1, 'DIRECT_URL connection string is required').optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  CLOUDINARY_API_KEY: z.string().min(1).optional(),
  CLOUDINARY_API_SECRET: z.string().min(1).optional(),
  NODE_ENV: z.enum(['development', 'staging', 'production', 'test']).default('development'),
});

export type ClientEnv = z.infer<typeof ClientEnvSchema>;
export type ServerEnv = z.infer<typeof ServerEnvSchema>;

export function validateClientEnv(env: Record<string, unknown> = process.env): ClientEnv {
  const result = ClientEnvSchema.safeParse(env);
  if (!result.success) {
    const errorDetails = result.error.issues
      .map((issue) => `  • ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');
    throw new Error(
      `[ElseSourav V2 Config Error] Client environment variables validation failed:\n${errorDetails}\nPlease check your .env.local file.`
    );
  }
  return result.data;
}

export function validateServerEnv(env: Record<string, unknown> = process.env): ServerEnv {
  const result = ServerEnvSchema.safeParse(env);
  if (!result.success) {
    const errorDetails = result.error.issues
      .map((issue) => `  • ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');
    throw new Error(
      `[ElseSourav V2 Config Error] Server environment variables validation failed:\n${errorDetails}\nPlease check your server configuration.`
    );
  }
  return result.data;
}
