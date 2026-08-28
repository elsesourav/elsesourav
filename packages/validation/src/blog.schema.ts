import { z } from 'zod';

export const BlogSlugSchema = z
  .string()
  .min(3, 'Slug must be at least 3 characters')
  .max(100, 'Slug cannot exceed 100 characters')
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must consist of lowercase alphanumeric words separated by single hyphens');

export const CreateBlogPostSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(150, 'Title cannot exceed 150 characters'),
  slug: BlogSlugSchema.optional(),
  excerpt: z.string().min(10, 'Excerpt must be at least 10 characters').max(300, 'Excerpt cannot exceed 300 characters'),
  content: z.string().min(50, 'Content must contain at least 50 characters'),
  coverImageUrl: z.string().url('Cover image must be a valid URL').optional().or(z.literal('')),
  categoryId: z.string().min(1, 'Category ID is required').optional(),
  tagIds: z.array(z.string()).optional().default([]),
  seoTitle: z.string().max(70, 'SEO title should not exceed 70 characters').optional(),
  seoDescription: z.string().max(160, 'SEO description should not exceed 160 characters').optional(),
  readingTime: z.number().int().min(1).optional(),
});

export const UpdateBlogPostSchema = CreateBlogPostSchema.partial().extend({
  status: z.enum(['draft', 'published', 'archived']).optional(),
});

export const PublishBlogPostSchema = z.object({
  postId: z.string().min(1, 'Post ID is required'),
});

export const BlogCategorySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50),
  slug: BlogSlugSchema,
  description: z.string().max(200).optional(),
  orderIndex: z.number().int().default(0),
});

export const BlogTagSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50),
  slug: BlogSlugSchema,
});

export const BlogQuerySchema = z.object({
  categorySlug: z.string().optional(),
  tagSlug: z.string().optional(),
  query: z.string().max(50).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export const BlogPostSchema = CreateBlogPostSchema;
export type BlogPostInput = z.infer<typeof CreateBlogPostSchema>;
export type CreateBlogPostInputSchema = z.infer<typeof CreateBlogPostSchema>;
export type UpdateBlogPostInputSchema = z.infer<typeof UpdateBlogPostSchema>;
export type BlogCategoryInputSchema = z.infer<typeof BlogCategorySchema>;
export type BlogTagInputSchema = z.infer<typeof BlogTagSchema>;
export type BlogQueryInputSchema = z.infer<typeof BlogQuerySchema>;

export function generateBlogSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 100);
}
