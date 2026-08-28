import { z } from 'zod';

export const feedbackModerationStatusSchema = z.enum(['pending', 'approved', 'hidden']);

export const submitFeedbackSchema = z.object({
  appId: z.string().min(1, 'App ID is required'),
  rating: z
    .number()
    .int('Rating must be an integer')
    .min(1, 'Rating must be between 1 and 5')
    .max(5, 'Rating must be between 1 and 5'),
  message: z
    .string()
    .min(3, 'Feedback message must be at least 3 characters')
    .max(1000, 'Feedback message cannot exceed 1000 characters'),
  userDisplayName: z.string().max(100).optional(),
  userPhotoUrl: z.string().url().or(z.literal('')).optional(),
});

export const updateFeedbackSchema = z.object({
  rating: z
    .number()
    .int('Rating must be an integer')
    .min(1, 'Rating must be between 1 and 5')
    .max(5, 'Rating must be between 1 and 5')
    .optional(),
  message: z
    .string()
    .min(3, 'Feedback message must be at least 3 characters')
    .max(1000, 'Feedback message cannot exceed 1000 characters')
    .optional(),
});

export const moderateFeedbackSchema = z.object({
  status: feedbackModerationStatusSchema,
});
