import { z } from 'zod';

export const globalSearchFiltersSchema = z.object({
  query: z
    .string()
    .max(100, 'Search query must be under 100 characters')
    .transform((q) => q.trim()),
  type: z.enum(['all', 'app', 'blog_post', 'help_article']).default('all'),
  category: z.string().optional(),
  limit: z.number().int().min(1).max(50).default(20),
});

export type GlobalSearchFiltersInput = z.infer<typeof globalSearchFiltersSchema>;
