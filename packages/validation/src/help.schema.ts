import { z } from 'zod';

export const HelpArticleSchema = z.object({
  categoryId: z.string().min(1),
  title: z.string().min(5).max(150),
  slug: z.string().min(3).regex(/^[a-z0-9-]+$/),
  excerpt: z.string().max(250).optional(),
  content: z.string().min(20),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  orderIndex: z.number().int().default(0),
});

export const ArticleHelpfulnessSchema = z.object({
  articleId: z.string().min(1),
  helpful: z.boolean(),
  sessionId: z.string().min(1),
});

export type HelpArticleInput = z.infer<typeof HelpArticleSchema>;
export type ArticleHelpfulnessInput = z.infer<typeof ArticleHelpfulnessSchema>;
