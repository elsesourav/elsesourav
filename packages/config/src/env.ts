import { z } from 'zod';

export const ClientEnvSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.string().url().default('https://elsesourav.com'),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: z.string().optional(),
  NEXT_PUBLIC_ENABLE_ANALYTICS: z
    .string()
    .transform((v) => v === 'true')
    .default('true'),
});

export const ServerEnvSchema = z.object({
  DATABASE_URL: z.string().url().optional(),
  DIRECT_URL: z.string().url().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  NODE_ENV: z.enum(['development', 'staging', 'production', 'test']).default('development'),
});

export type ClientEnv = z.infer<typeof ClientEnvSchema>;
export type ServerEnv = z.infer<typeof ServerEnvSchema>;
