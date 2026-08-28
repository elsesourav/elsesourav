import { z } from 'zod';
import { EntityIdSchema, SlugSchema } from './common.schema';

/**
 * Help Category Schemas
 */
export const createHelpCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Category name is required')
    .max(60, 'Category name cannot exceed 60 characters'),
  slug: SlugSchema,
  description: z.string().trim().max(255, 'Description cannot exceed 255 characters').optional(),
  icon: z.string().trim().max(50).optional(),
  orderIndex: z.number().int().nonnegative().optional().default(0),
  isActive: z.boolean().optional().default(true),
});

export const updateHelpCategorySchema = createHelpCategorySchema.partial();

export type CreateHelpCategoryInput = z.input<typeof createHelpCategorySchema>;
export type UpdateHelpCategoryInput = z.input<typeof updateHelpCategorySchema>;

/**
 * Help Article Status Schema
 */
export const helpArticleStatusSchema = z.enum(['draft', 'published', 'archived']);

/**
 * Help Article Schemas
 */
export const createHelpArticleSchema = z.object({
  categoryId: EntityIdSchema,
  title: z
    .string()
    .trim()
    .min(3, 'Title must be at least 3 characters')
    .max(150, 'Title cannot exceed 150 characters'),
  slug: SlugSchema,
  excerpt: z.string().trim().max(300, 'Excerpt cannot exceed 300 characters').optional(),
  content: z.string().min(1, 'Article content cannot be empty'),
  orderIndex: z.number().int().nonnegative().optional().default(0),
  featured: z.boolean().optional().default(false),
  seoTitle: z.string().trim().max(100).optional(),
  seoDescription: z.string().trim().max(250).optional(),
  socialImageUrl: z.string().url('Social image must be a valid URL').optional().or(z.literal('')),
});

export const updateHelpArticleSchema = createHelpArticleSchema.partial();

/**
 * Schema required to publish an article
 */
export const publishHelpArticleSchema = z.object({
  title: z.string().trim().min(3).max(150),
  slug: SlugSchema,
  categoryId: EntityIdSchema,
  content: z.string().min(10, 'Published help article must have substantial content'),
  excerpt: z.string().trim().min(5, 'Published help article must have a brief excerpt').optional(),
});

export type CreateHelpArticleInput = z.input<typeof createHelpArticleSchema>;
export type UpdateHelpArticleInput = z.input<typeof updateHelpArticleSchema>;
export type PublishHelpArticleInput = z.input<typeof publishHelpArticleSchema>;

/**
 * Schema for submitting article helpfulness feedback
 */
export const submitArticleHelpfulnessSchema = z.object({
  articleId: EntityIdSchema,
  helpful: z.boolean(),
  userId: EntityIdSchema.optional(),
  sessionId: z.string().trim().min(1, 'Session ID is required').max(100),
});

export type SubmitArticleHelpfulnessInput = z.input<typeof submitArticleHelpfulnessSchema>;
