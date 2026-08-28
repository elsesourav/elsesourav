import { z } from 'zod';

export const appPlatformSchema = z.enum([
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

export const appActionTypeSchema = z.enum([
  'open_app',
  'add_to_chrome',
  'get_on_play_store',
  'view_on_github',
  'download',
  'visit_website',
]);

export const appStatusSchema = z.enum(['draft', 'published', 'archived']);

export const appLinkSchema = z.object({
  id: z.string().min(1, 'Link ID is required'),
  appId: z.string().min(1, 'App ID is required'),
  platform: appPlatformSchema,
  label: z.string().min(1, 'Link label is required').max(50),
  url: z.string().url('Invalid destination URL'),
  action: appActionTypeSchema.optional(),
  isPrimary: z.boolean().optional(),
  icon: z.string().optional(),
  displayOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
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
    .min(2, 'Slug must be at least 2 characters')
    .max(60, 'Slug must not exceed 60 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug must only contain lowercase alphanumeric characters and hyphens'),
  name: z.string().min(1, 'App name is required').max(100),
  shortDescription: z.string().min(1, 'Short description is required').max(200),
  description: z.string().min(1, 'Full description is required'),
  iconUrl: z.string().url('Invalid icon URL'),
  featuredImageUrl: z.string().url('Invalid featured image URL').or(z.literal('')).optional(),
  screenshots: z.array(z.string().url('Invalid screenshot URL')).default([]),
  demoUrl: z.string().url('Invalid demo URL').or(z.literal('')).optional(),
  videoUrl: z.string().url('Invalid video URL').or(z.literal('')).optional(),
  primaryCategory: z.string().min(1, 'Primary category is required'),
  tags: z.array(z.string()).default([]),
  status: appStatusSchema.default('draft'),
  platforms: z.array(appPlatformSchema).min(1, 'At least one target platform is required'),
  links: z.array(appLinkSchema).default([]),
  currentVersion: z.string().optional(),
  releaseDate: z.number().optional(),
  seoTitle: z.string().max(70, 'SEO title should be under 70 characters').optional(),
  seoDescription: z.string().max(160, 'SEO description should be under 160 characters').optional(),
  socialImageUrl: z.string().url('Invalid social image URL').or(z.literal('')).optional(),
  stats: appStatisticsSchema.default({
    views: 0,
    launches: 0,
    libraryAdds: 0,
  }),
  isFeatured: z.boolean().default(false),
  isPinned: z.boolean().default(false),
  sortOrder: z.number().int().default(0),
});

export const updateAppSchema = createAppSchema.partial();

/**
 * Strict publication validation schema enforcing all required public information
 */
export const publishAppValidationSchema = z.object({
  id: z.string().min(1, 'App ID is required'),
  name: z.string().min(1, 'App name is required for publication'),
  slug: z
    .string()
    .min(2, 'Slug must be at least 2 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric and hyphens'),
  shortDescription: z.string().min(1, 'Short description is required for publication'),
  description: z.string().min(1, 'Full description is required for publication'),
  primaryCategory: z.string().min(1, 'Primary category is required for publication'),
  iconUrl: z.string().url('A valid icon URL is required for publication'),
  platforms: z
    .array(appPlatformSchema)
    .min(1, 'At least one target platform is required for publication'),
  links: z
    .array(appLinkSchema)
    .min(1, 'At least one platform link is required for publication')
    .refine(
      (links) => links.some((l) => l.isActive),
      'At least one active platform link is required for publication'
    ),
});
