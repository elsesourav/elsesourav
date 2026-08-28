import { z } from 'zod';

/**
 * Shared primitives for entity validation
 */
export const EntityIdSchema = z.string().min(1, 'ID cannot be empty');

export const SlugSchema = z
  .string()
  .min(1)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Must be a valid kebab-case slug');

export const TimestampSchema = z.number().int().nonnegative();

export const SchemaVersionSchema = z.number().int().min(1).default(1);

export const FlexibleTimestampSchema = z
  .union([
    z.number().int().nonnegative(),
    z.string(),
    z.object({
      seconds: z.number(),
      nanoseconds: z.number().optional(),
    }),
  ])
  .transform((val) => {
    if (typeof val === 'number') return val;
    if (typeof val === 'string') {
      const parsed = Date.parse(val);
      return !isNaN(parsed) ? parsed : Date.now();
    }
    if (typeof val === 'object' && val !== null && 'seconds' in val) {
      return val.seconds * 1000 + Math.floor(((val as { nanoseconds?: number }).nanoseconds || 0) / 1000000);
    }
    return Date.now();
  });

export const EmailSchema = z.string().email('Invalid email address');

export const PaginationParamsSchema = z.object({
  limit: z.number().int().min(1).max(100).default(20),
  cursor: z.string().optional(),
  direction: z.enum(['asc', 'desc']).default('desc'),
});

export type PaginationParams = z.infer<typeof PaginationParamsSchema>;
