import { z } from 'zod';

export const HelpSlugSchema = z
  .string()
  .min(2, 'Slug must be at least 2 characters')
  .max(100, 'Slug must not exceed 100 characters')
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase alphanumeric with hyphens');

export const CreateHelpCategorySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50),
  slug: HelpSlugSchema.optional(),
  description: z.string().max(250).optional(),
  icon: z.string().max(50).optional(),
  orderIndex: z.number().int().default(0),
});

export const UpdateHelpCategorySchema = CreateHelpCategorySchema.partial();

export const CreateHelpArticleSchema = z.object({
  categoryId: z.string().min(1, 'Category is required'),
  title: z.string().min(5, 'Title must be at least 5 characters').max(150),
  slug: HelpSlugSchema.optional(),
  excerpt: z.string().max(250).optional(),
  content: z.string().min(20, 'Content must be at least 20 characters'),
  orderIndex: z.number().int().default(0),
  seoTitle: z.string().max(100).optional(),
  seoDescription: z.string().max(200).optional(),
});

export const UpdateHelpArticleSchema = CreateHelpArticleSchema.partial();

export const AdminSaveHelpSchema = z.object({
  id: z.string().optional(),
  categoryId: z.string().min(1, 'Category is required'),
  title: z.string().min(5, 'Title must be at least 5 characters').max(150),
  slug: HelpSlugSchema.optional(),
  excerpt: z.string().max(250).optional().or(z.literal('')),
  content: z.string().min(20, 'Content must be at least 20 characters'),
  status: z
    .enum(['draft', 'published', 'archived', 'DRAFT', 'PUBLISHED', 'ARCHIVED'])
    .default('draft'),
  orderIndex: z.coerce.number().int().default(0),
  seoTitle: z.string().max(100).optional().or(z.literal('')),
  seoDescription: z.string().max(200).optional().or(z.literal('')),
});

export const PublishHelpArticleSchema = z.object({
  id: z.string().uuid(),
});

export const HelpSearchSchema = z.object({
  query: z.string().min(1).max(100),
  categorySlug: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export const ArticleHelpfulnessSchema = z.object({
  articleId: z.string().min(1),
  helpful: z.boolean(),
  sessionId: z.string().min(1).optional(),
});

export const HelpVoteSchema = z.object({
  articleId: z.string().uuid(),
  isHelpful: z.boolean(),
});

export const HelpArticleSchema = z.object({
  categoryId: z.string().min(1),
  title: z.string().min(5).max(150),
  slug: HelpSlugSchema,
  excerpt: z.string().max(250).optional(),
  content: z.string().min(20),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  orderIndex: z.number().int().default(0),
});

export type CreateHelpCategoryInputSchema = z.infer<typeof CreateHelpCategorySchema>;
export type UpdateHelpCategoryInputSchema = z.infer<typeof UpdateHelpCategorySchema>;
export type CreateHelpArticleInputSchema = z.infer<typeof CreateHelpArticleSchema>;
export type UpdateHelpArticleInputSchema = z.infer<typeof UpdateHelpArticleSchema>;
export type AdminSaveHelpSchemaInput = z.infer<typeof AdminSaveHelpSchema>;
export type HelpSearchInputSchema = z.infer<typeof HelpSearchSchema>;
export type ArticleHelpfulnessInput = z.infer<typeof ArticleHelpfulnessSchema>;
export type HelpArticleInput = z.infer<typeof HelpArticleSchema>;

export function generateHelpSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100);
}
