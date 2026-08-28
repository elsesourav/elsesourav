import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(60),
  slug: z
    .string()
    .min(2, 'Slug must be at least 2 characters')
    .max(60, 'Slug must not exceed 60 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug must only contain lowercase alphanumeric characters and hyphens'),
  description: z.string().max(300, 'Description cannot exceed 300 characters').optional(),
  icon: z.string().optional(),
  orderIndex: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

export const updateCategorySchema = createCategorySchema.partial();

export const createTagSchema = z.object({
  name: z.string().min(1, 'Tag name is required').max(40),
  slug: z
    .string()
    .min(2, 'Slug must be at least 2 characters')
    .max(40, 'Slug must not exceed 40 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug must only contain lowercase alphanumeric characters and hyphens'),
  description: z.string().max(200, 'Description cannot exceed 200 characters').optional(),
  color: z.string().optional(),
  isActive: z.boolean().default(true),
});

export const updateTagSchema = createTagSchema.partial();
