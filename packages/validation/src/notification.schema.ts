import { z } from 'zod';

export const NotificationTypeSchema = z.enum([
  'SUPPORT_REPLY',
  'SUPPORT_STATUS_CHANGE',
  'APP_UPDATE',
  'LIBRARY_UPDATE',
  'ACCOUNT',
  'SYSTEM',
  'SECURITY',
  'system_announcement',
  'app_release',
  'support_reply',
  'security_alert',
]);

export const CreateNotificationSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  type: NotificationTypeSchema.or(z.string().min(1)),
  title: z.string().min(3, 'Title must be at least 3 characters').max(120),
  message: z.string().min(3, 'Message must be at least 3 characters').max(1000),
  linkUrl: z.string().max(255).optional(),
});

export const MarkNotificationReadSchema = z.object({
  notificationId: z.string().uuid('Invalid notification identifier'),
});

export const DeleteNotificationSchema = z.object({
  notificationId: z.string().uuid('Invalid notification identifier'),
});

export type CreateNotificationInputSchema = z.infer<typeof CreateNotificationSchema>;
export type MarkNotificationReadInputSchema = z.infer<typeof MarkNotificationReadSchema>;
export type DeleteNotificationInputSchema = z.infer<typeof DeleteNotificationSchema>;
