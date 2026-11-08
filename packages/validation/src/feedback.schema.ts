import { z } from 'zod';

/**
 * Validation schema for creating or updating a feedback entry.
 */
export const CreateFeedbackSchema = z.object({
  rating: z
    .number({ required_error: 'Rating is required' })
    .int('Rating must be a whole number')
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating cannot exceed 5'),
  message: z
    .string()
    .max(1000, 'Comment cannot exceed 1000 characters')
    .optional()
    .or(z.literal('')),
});

/**
 * Validation schema for feedback list query parameters.
 */
export const FeedbackQuerySchema = z.object({
  page: z.coerce.number().int().min(1, 'Page must be at least 1').default(1),
  limit: z.coerce
    .number()
    .int()
    .min(1, 'Limit must be at least 1')
    .max(50, 'Limit cannot exceed 50')
    .default(10),
  sort: z.enum(['newest', 'oldest', 'highest', 'lowest']).default('newest'),
});

export type CreateFeedbackInput = z.infer<typeof CreateFeedbackSchema>;
export type FeedbackQueryInput = z.infer<typeof FeedbackQuerySchema>;
