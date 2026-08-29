import { z } from 'zod';

export const AuditActionEnum = z.enum([
  'USER_ROLE_CHANGED',
  'USER_DELETED',
  'USER_REGISTERED',
  'APP_CREATED',
  'APP_UPDATED',
  'APP_PUBLISHED',
  'APP_ARCHIVED',
  'APP_DELETED',
  'BLOG_CREATED',
  'BLOG_UPDATED',
  'BLOG_PUBLISHED',
  'BLOG_ARCHIVED',
  'BLOG_DELETED',
  'HELP_CREATED',
  'HELP_UPDATED',
  'HELP_PUBLISHED',
  'HELP_ARCHIVED',
  'HELP_DELETED',
  'SUPPORT_STATUS_CHANGED',
  'SUPPORT_NOTE_ADDED',
  'SUPPORT_REPLY_SENT',
  'MEDIA_UPLOADED',
  'MEDIA_DELETED',
  'MEDIA_REPLACED',
  'SECURITY_UNAUTHORIZED_ACCESS_ATTEMPT',
  'SECURITY_FORBIDDEN_OPERATION',
]);

export const AuditResourceTypeEnum = z.enum([
  'USER',
  'APP',
  'BLOG_POST',
  'HELP_ARTICLE',
  'SUPPORT_TICKET',
  'MEDIA',
  'SECURITY',
  'SYSTEM',
]);

export const RecordAuditSchema = z.object({
  actorUserId: z.string().min(1, 'Actor user ID is required'),
  action: AuditActionEnum,
  resourceType: AuditResourceTypeEnum,
  resourceId: z.string().optional(),
  details: z.record(z.unknown()).optional(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
});

export const AuditFilterSchema = z.object({
  action: z.string().optional(),
  resourceType: z.string().optional(),
  actorUserId: z.string().optional(),
  search: z.string().max(100).optional(),
  dateFrom: z.coerce.number().optional(),
  dateTo: z.coerce.number().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export type RecordAuditInput = z.infer<typeof RecordAuditSchema>;
export type AuditFilterInput = z.infer<typeof AuditFilterSchema>;
