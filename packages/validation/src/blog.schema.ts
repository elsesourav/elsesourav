import { z } from 'zod';

export const BlogPostSchema = z.object({
  title: z.string().min(5).max(150),
  slug: z.string().min(3).regex(/^[a-z0-9-]+$/),
  excerpt: z.string().min(10).max(300),
  content: z.string().min(50),
  coverImageUrl: z.string().url().optional(),
  category: z.string().min(1),
  tags: z.array(z.string()).default([]),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  isFeatured: z.boolean().default(false),
});

export type BlogPostInput = z.infer<typeof BlogPostSchema>;
