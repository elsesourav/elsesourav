import { z } from 'zod';

export const blogSlugSchema = z
  .string()
  .min(2, 'Slug must be at least 2 characters')
  .max(100, 'Slug cannot exceed 100 characters')
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    'Slug must be lowercase alphanumeric characters separated by single hyphens'
  );

export const createBlogPostSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title cannot exceed 200 characters'),
  slug: blogSlugSchema,
  excerpt: z
    .string()
    .min(10, 'Excerpt must be at least 10 characters')
    .max(500, 'Excerpt cannot exceed 500 characters'),
  content: z
    .string()
    .min(10, 'Content must be at least 10 characters')
    .max(100000, 'Content cannot exceed 100,000 characters'),
  coverImageUrl: z.string().url('Cover image must be a valid URL').optional().or(z.literal('')),
  category: z
    .string()
    .min(2, 'Category must be at least 2 characters')
    .max(50, 'Category cannot exceed 50 characters'),
  tags: z.array(z.string().min(1).max(30)).max(10).default([]),
  authorId: z.string().min(1, 'Author ID is required').optional(),
  authorName: z.string().max(100).optional(),
  authorAvatarUrl: z.string().url().optional().or(z.literal('')),
  readingTime: z.number().int().nonnegative().optional(),
  seoTitle: z.string().max(100).optional(),
  seoDescription: z.string().max(300).optional(),
  canonicalUrl: z.string().url().optional().or(z.literal('')),
  socialImageUrl: z.string().url().optional().or(z.literal('')),
});

export const updateBlogPostSchema = createBlogPostSchema.partial();

export const publishBlogPostSchema = z.object({
  title: z.string().min(3).max(200),
  slug: blogSlugSchema,
  excerpt: z.string().min(10).max(500),
  content: z.string().min(10),
  category: z.string().min(2),
});

export type CreateBlogPostInput = z.infer<typeof createBlogPostSchema>;
export type UpdateBlogPostInput = z.infer<typeof updateBlogPostSchema>;
