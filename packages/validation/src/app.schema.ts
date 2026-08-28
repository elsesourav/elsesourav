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

export const CreateAppSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
  shortDescription: z.string().min(10).max(250),
  description: z.string().min(20),
  iconUrl: z.string().url(),
  featuredImageUrl: z.string().url().optional(),
  categoryId: z.string().min(1),
  tagIds: z.array(z.string()).optional(),
  demoUrl: z.string().url().optional(),
  videoUrl: z.string().url().optional(),
  isFeatured: z.boolean().default(false),
  isPinned: z.boolean().default(false),
  sortOrder: z.number().int().default(0),
  seoTitle: z.string().max(100).optional(),
  seoDescription: z.string().max(300).optional(),
});

export const UpdateAppSchema = CreateAppSchema.partial();

export const AppQuerySchema = z.object({
  status: z.enum(['draft', 'published', 'archived']).optional(),
  categoryId: z.string().optional(),
  tagSlug: z.string().optional(),
  search: z.string().max(50).optional(),
  isFeatured: z.boolean().optional(),
  limit: z.number().int().min(1).max(50).default(20),
  cursor: z.string().optional(),
  sortField: z.enum(['createdAt', 'sortOrder', 'name', 'publishedAt']).default('sortOrder'),
  sortDirection: z.enum(['asc', 'desc']).default('asc'),
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
export type CreateAppSchemaInput = z.infer<typeof CreateAppSchema>;
export type UpdateAppSchemaInput = z.infer<typeof UpdateAppSchema>;
export type AppQuerySchemaInput = z.infer<typeof AppQuerySchema>;
export type AppLinkInput = z.infer<typeof AppLinkSchema>;
