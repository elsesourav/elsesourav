import type { ID, Timestamp } from './common.types';

export type AuditAction =
  | 'USER_ROLE_CHANGED'
  | 'USER_DELETED'
  | 'USER_REGISTERED'
  | 'APP_CREATED'
  | 'APP_UPDATED'
  | 'APP_PUBLISHED'
  | 'APP_ARCHIVED'
  | 'APP_DELETED'
  | 'BLOG_CREATED'
  | 'BLOG_UPDATED'
  | 'BLOG_PUBLISHED'
  | 'BLOG_ARCHIVED'
  | 'BLOG_DELETED'
  | 'HELP_CREATED'
  | 'HELP_UPDATED'
  | 'HELP_PUBLISHED'
  | 'HELP_ARCHIVED'
  | 'HELP_DELETED'
  | 'SUPPORT_STATUS_CHANGED'
  | 'SUPPORT_NOTE_ADDED'
  | 'SUPPORT_REPLY_SENT'
  | 'MEDIA_UPLOADED'
  | 'MEDIA_DELETED'
  | 'MEDIA_REPLACED'
  | 'SECURITY_UNAUTHORIZED_ACCESS_ATTEMPT'
  | 'SECURITY_FORBIDDEN_OPERATION';

export type AuditResourceType =
  | 'USER'
  | 'APP'
  | 'BLOG_POST'
  | 'HELP_ARTICLE'
  | 'SUPPORT_TICKET'
  | 'MEDIA'
  | 'SECURITY'
  | 'SYSTEM';

export interface AuditActor {
  readonly id: ID;
  readonly email: string;
  readonly displayName: string;
  readonly photoUrl?: string;
  readonly role: string;
}

export interface AuditLog {
  readonly id: ID;
  readonly userId: ID;
  readonly userEmail?: string;
  readonly actor?: AuditActor;
  readonly action: AuditAction | string;
  readonly entityType: AuditResourceType | string;
  readonly entityId?: string;
  readonly details?: Record<string, unknown>;
  readonly ipAddress?: string;
  readonly userAgent?: string;
  readonly timestamp: Timestamp;
}

export interface RecordAuditParams {
  readonly actorUserId: ID;
  readonly action: AuditAction;
  readonly resourceType: AuditResourceType;
  readonly resourceId?: string;
  readonly details?: Record<string, unknown>;
  readonly ipAddress?: string;
  readonly userAgent?: string;
}

export interface AuditFilterParams {
  readonly action?: string;
  readonly resourceType?: string;
  readonly actorUserId?: string;
  readonly search?: string;
  readonly dateFrom?: Timestamp;
  readonly dateTo?: Timestamp;
  readonly page?: number;
  readonly limit?: number;
}

export interface AuditListResult {
  readonly logs: readonly AuditLog[];
  readonly total: number;
  readonly page: number;
  readonly limit: number;
  readonly totalPages: number;
}

export interface AuditSummaryMetrics {
  readonly totalLogs: number;
  readonly logsLast24Hours: number;
  readonly securityAlertsCount: number;
  readonly uniqueActorsCount: number;
}
