import { z } from 'zod';

export const ALLOWED_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/svg+xml',
  'image/gif',
] as const;

export const MAX_MEDIA_SIZE_BYTES: Record<string, number> = {
  avatar: 2 * 1024 * 1024, // 2MB
  app_icon: 1 * 1024 * 1024, // 1MB
  app_screenshot: 5 * 1024 * 1024, // 5MB
  blog_cover: 5 * 1024 * 1024, // 5MB
  help_image: 5 * 1024 * 1024, // 5MB
  generic: 10 * 1024 * 1024, // 10MB
};

export const MediaTypeEnum = z.enum([
  'avatar',
  'app_icon',
  'app_screenshot',
  'blog_cover',
  'help_image',
  'generic',
]);

export const MediaFolderEnum = z.enum([
  'users',
  'apps',
  'blog',
  'help',
  'general',
]);

export const MediaDomainEnum = z.enum([
  'all',
  'apps',
  'blog',
  'help',
  'users',
  'support',
  'general',
]);

export const MediaSignatureRequestSchema = z.object({
  mediaType: MediaTypeEnum,
  folder: MediaFolderEnum,
  customPublicId: z
    .string()
    .min(3)
    .max(100)
    .regex(/^[a-z0-9_-]+$/, 'Public ID can only contain lowercase alphanumeric characters, dashes, and underscores')
    .optional(),
});

export const MediaTransformationSchema = z.object({
  width: z.number().int().positive().max(3840).optional(),
  height: z.number().int().positive().max(2160).optional(),
  crop: z.enum(['fill', 'scale', 'fit', 'thumb', 'limit', 'pad']).optional(),
  gravity: z.enum(['face', 'center', 'auto']).optional(),
  quality: z.union([z.enum(['auto', 'auto:good', 'auto:eco', 'auto:low']), z.number().int().min(1).max(100)]).optional(),
  format: z.enum(['auto', 'webp', 'avif', 'png', 'jpg']).optional(),
  dpr: z.union([z.literal('auto'), z.literal(1), z.literal(2), z.literal(3)]).optional(),
});

export const AdminDeleteMediaSchema = z.object({
  publicId: z.string().min(1, 'Public ID is required'),
  force: z.boolean().optional().default(false),
});

export const AdminMediaFilterSchema = z.object({
  domain: MediaDomainEnum.optional().default('all'),
  status: z.enum(['all', 'referenced', 'orphan']).optional().default('all'),
  search: z.string().max(100).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(24),
});

export type MediaSignatureRequestInput = z.infer<typeof MediaSignatureRequestSchema>;
export type MediaTransformationInput = z.infer<typeof MediaTransformationSchema>;
export type AdminDeleteMediaInput = z.infer<typeof AdminDeleteMediaSchema>;
export type AdminMediaFilterInput = z.infer<typeof AdminMediaFilterSchema>;
