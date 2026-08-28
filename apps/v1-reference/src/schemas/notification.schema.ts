import { z } from 'zod';

export const notificationTypeSchema = z.enum([
  'APP_UPDATE',
  'SUPPORT_REPLY',
  'SUPPORT_STATUS_CHANGE',
  'SYSTEM',
  'LIBRARY_UPDATE',
  'ACCOUNT',
]);

export const notificationSeveritySchema = z.enum(['info', 'success', 'warning', 'error']);

export const notificationSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  type: notificationTypeSchema,
  severity: notificationSeveritySchema.optional(),
  title: z.string().min(1).max(200),
  message: z.string().min(1).max(1000),
  link: z.string().optional(),
  linkUrl: z.string().optional(),
  relatedAppId: z.string().optional(),
  relatedTicketId: z.string().optional(),
  read: z.boolean().default(false),
  isRead: z.boolean().optional(),
  readAt: z.number().int().positive().optional(),
  createdAt: z.number().int().positive(),
  updatedAt: z.number().int().positive().optional(),
  expiresAt: z.number().int().positive().optional(),
});

export const createNotificationSchema = z.object({
  userId: z.string().min(1),
  type: notificationTypeSchema,
  severity: notificationSeveritySchema.optional(),
  title: z.string().min(1).max(200),
  message: z.string().min(1).max(1000),
  link: z.string().optional(),
  linkUrl: z.string().optional(),
  relatedAppId: z.string().optional(),
  relatedTicketId: z.string().optional(),
  read: z.boolean().default(false),
  expiresAt: z.number().int().positive().optional(),
});

export const updateNotificationSchema = z.object({
  read: z.boolean().optional(),
  isRead: z.boolean().optional(),
  readAt: z.number().int().positive().optional(),
});

export type NotificationInput = z.infer<typeof notificationSchema>;
export type CreateNotificationInput = z.infer<typeof createNotificationSchema>;
export type UpdateNotificationInput = z.infer<typeof updateNotificationSchema>;
