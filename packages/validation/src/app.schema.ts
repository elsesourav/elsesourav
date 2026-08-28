import { z } from 'zod';

export const AppPlatformSchema = z.enum([
  'web',
  'chrome',
  'android',
  'ios',
  'windows',
  'macos',
  'linux',
  'github',
  'download',
  'other',
]);

export const AppActionTypeSchema = z.enum([
  'open_app',
  'add_to_chrome',
  'get_on_play_store',
  'view_on_github',
  'download',
  'visit_website',
]);

export const AppLinkSchema = z.object({
  id: z.string().optional(),
  platform: AppPlatformSchema,
  label: z.string().min(1, 'Label is required'),
  url: z.string().url('Please enter a valid URL'),
  action: AppActionTypeSchema.optional(),
  isPrimary: z.boolean().default(false),
  icon: z.string().optional(),
  displayOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

export const AppSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
  shortDescription: z.string().min(10).max(250),
  description: z.string().min(20),
  iconUrl: z.string().url(),
  featuredImageUrl: z.string().url().optional(),
  screenshots: z.array(z.string().url()).default([]),
  demoUrl: z.string().url().optional(),
  videoUrl: z.string().url().optional(),
  primaryCategory: z.string().min(1),
  tags: z.array(z.string()).default([]),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  platforms: z.array(AppPlatformSchema).min(1, 'Select at least one platform'),
  links: z.array(AppLinkSchema).default([]),
  currentVersion: z.string().optional(),
  isFeatured: z.boolean().default(false),
  isPinned: z.boolean().default(false),
  sortOrder: z.number().int().default(0),
});

export type AppInput = z.infer<typeof AppSchema>;
export type AppLinkInput = z.infer<typeof AppLinkSchema>;
