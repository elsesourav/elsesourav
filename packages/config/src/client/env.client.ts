import { z } from 'zod';

export const ClientEnvSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z
    .string()
    .url('NEXT_PUBLIC_SITE_URL must be a valid absolute URL')
    .default('https://elsesourav.com'),
  NEXT_PUBLIC_SUPABASE_URL: z
    .string()
    .url('NEXT_PUBLIC_SUPABASE_URL must be a valid Supabase project URL')
    .optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z
    .string()
    .min(1, 'NEXT_PUBLIC_SUPABASE_ANON_KEY cannot be empty')
    .optional(),
  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: z
    .string()
    .min(1, 'NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME cannot be empty')
    .default('elsesourav'),
  NEXT_PUBLIC_ENABLE_ANALYTICS: z
    .union([z.boolean(), z.string().transform((v) => v === 'true')])
    .default(true),
  NEXT_PUBLIC_ENABLE_ADMIN_PORTAL: z
    .union([z.boolean(), z.string().transform((v) => v === 'true')])
    .default(true),
});

export type ClientEnv = z.infer<typeof ClientEnvSchema>;

export function validateClientEnv(env: Record<string, unknown> = process.env): ClientEnv {
  const result = ClientEnvSchema.safeParse(env);
  if (!result.success) {
    const errorDetails = result.error.issues
      .map((issue) => `  • ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');
    throw new Error(
      `[ElseSourav V2 Client Config Error] Invalid client environment configuration:\n${errorDetails}\nPlease check your client environment variables (.env.local).`
    );
  }
  return result.data;
}
