import { z } from 'zod';
import { appPlatformSchema, appActionTypeSchema } from './app.schema';

export const analyticsEventTypeSchema = z.enum([
  'view',
  'primary_action',
  'external_link',
  'library_add',
  'library_remove',
  'feedback_submit',
  'article_helpfulness',
]);

export const createAnalyticsEventSchema = z.object({
  appId: z.string().min(1, 'App ID is required'),
  eventType: analyticsEventTypeSchema,
  platform: appPlatformSchema.optional(),
  action: appActionTypeSchema.optional(),
  linkId: z.string().optional(),
  userId: z.string().optional(),
  sessionId: z.string().optional(),
  source: z.string().max(50).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const appAnalyticsAggregateSchema = z.object({
  id: z.string().min(1),
  appId: z.string().min(1),
  viewCount: z.number().int().nonnegative().default(0),
  uniqueViewCount: z.number().int().nonnegative().default(0),
  actionCount: z.number().int().nonnegative().default(0),
  libraryCount: z.number().int().nonnegative().default(0),
  feedbackCount: z.number().int().nonnegative().default(0),
  averageRating: z.number().min(0).max(5).default(0),
  ratingCount: z.number().int().nonnegative().default(0),
  lastViewedAt: z.number().optional(),
  lastActionAt: z.number().optional(),
});
