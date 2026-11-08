import { z } from 'zod';

const isProduction = process.env.NODE_ENV === 'production';

export const ServerEnvSchema = z.object({
  DATABASE_URL: isProduction
    ? z.string().min(1, 'DATABASE_URL is required in production')
    : z.string().min(1).optional(),
  DIRECT_URL: z.string().min(1, 'DIRECT_URL is required for Prisma migrations').optional(),
  SUPABASE_SERVICE_ROLE_KEY: isProduction
    ? z.string().min(1, 'SUPABASE_SERVICE_ROLE_KEY is required in production')
    : z.string().min(1).optional(),
  OTP_SECRET: z.string().min(16).optional(),
  RESEND_API_KEY: z.string().min(1, 'RESEND_API_KEY is required for email delivery').optional(),
  CLOUDINARY_API_KEY: z.string().min(1).optional(),
  CLOUDINARY_API_SECRET: z.string().min(1).optional(),
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
