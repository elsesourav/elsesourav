import { z } from 'zod';

export const appPlatformSchema = z.enum([
  'web',
  'chrome',
  'android',
  'github',
  'windows',
  'macos',
  'linux',
  'pwa',
  'external',
]);

export const appActionTypeSchema = z.enum([
  'open_app',
  'add_to_chrome',
  'get_on_play_store',
  'view_on_github',
  'download',
  'visit_website',
]);

export const appStatusSchema = z.enum(['published', 'draft', 'archived', 'beta', 'unlisted']);

export const appCategorySchema = z.enum([
  'web-apps',
  'games',
  'extensions',
  'mobile',
  'developer-tools',
  'desktop',
  'ai-tools',
  'utilities',
]);

export const appLinkSchema = z.object({
  id: z.string(),
  platform: appPlatformSchema,
  action: appActionTypeSchema,
  url: z.string().url(),
  label: z.string().min(1),
  isPrimary: z.boolean(),
  version: z.string().optional(),
  fileSize: z.string().optional(),
  target: z.enum(['_blank', '_self']).optional(),
});

export const appMediaSchema = z.object({
  id: z.string(),
  kind: z.enum(['icon', 'screenshot', 'banner', 'video_preview', 'thumbnail']),
  url: z.string().url(),
  alt: z.string().min(1),
  width: z.number().positive().optional(),
  height: z.number().positive().optional(),
  isPrimary: z.boolean().optional(),
});

export const appStatisticsSchema = z.object({
  views: z.number().int().nonnegative().default(0),
  launches: z.number().int().nonnegative().default(0),
  libraryAdds: z.number().int().nonnegative().default(0),
  ratingAverage: z.number().min(0).max(5).optional(),
  ratingCount: z.number().int().nonnegative().optional(),
});

export const createAppSchema = z.object({
  slug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9-]+$/, 'Slug must only contain lowercase alphanumeric characters and hyphens'),
  name: z.string().min(1, 'Name is required'),
  tagline: z.string().min(1, 'Tagline is required'),
  description: z.string().min(1, 'Description is required'),
  category: appCategorySchema,
  tags: z.array(z.string()).default([]),
  status: appStatusSchema.default('draft'),
  platforms: z.array(appPlatformSchema).min(1, 'At least one platform is required'),
  links: z.array(appLinkSchema).default([]),
  media: z.array(appMediaSchema).default([]),
  currentVersion: z.string().default('1.0.0'),
  versions: z.array(z.any()).default([]),
  stats: appStatisticsSchema.default({
    views: 0,
    launches: 0,
    libraryAdds: 0,
  }),
  isFeatured: z.boolean().default(false),
  isPinned: z.boolean().default(false),
  sortOrder: z.number().int().default(0),
  publishedAt: z.number().optional(),
});

export const updateAppSchema = createAppSchema.partial();
