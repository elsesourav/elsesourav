import type { ID, Timestamp } from './common.types';

/**
 * Administrative Audit Log Action Types
 */
export type AuditLogAction =
  | 'APP_CREATED'
  | 'APP_UPDATED'
  | 'APP_PUBLISHED'
  | 'APP_UNPUBLISHED'
  | 'APP_ARCHIVED'
  | 'CATEGORY_CREATED'
  | 'CATEGORY_UPDATED'
  | 'TAG_CREATED'
  | 'TAG_UPDATED'
  | 'VERSION_CREATED'
  | 'VERSION_PUBLISHED'
  | 'BLOG_CREATED'
  | 'BLOG_UPDATED'
  | 'BLOG_PUBLISHED'
  | 'BLOG_UNPUBLISHED'
  | 'BLOG_ARCHIVED'
  | 'HELP_CREATED'
  | 'HELP_UPDATED'
  | 'HELP_PUBLISHED'
  | 'SUPPORT_STATUS_CHANGED'
  | 'SUPPORT_PRIORITY_CHANGED'
  | 'ACCOUNT_SECURITY_ACTION';

export type AuditAction =
  | AuditLogAction
  | 'create'
  | 'update'
  | 'delete'
  | 'publish'
  | 'archive'
  | 'login'
  | 'status_change';

/**
 * Target Resource / Entity Types
 */
export type AuditEntityType =
  | 'app'
  | 'category'
  | 'tag'
  | 'version'
  | 'blog'
  | 'help'
  | 'support'
  | 'user'
  | 'theme'
  | 'system';

export type AuditResourceType =
  AuditEntityType | 'blog_post' | 'help_article' | 'ticket' | 'config' | 'feedback';

/**
 * Administrative Audit Log Entity (/auditLogs/{id})
 */
export interface AuditLog {
  readonly id: ID;
  readonly actorUserId: ID;
  readonly actorEmail?: string;
  readonly action: AuditLogAction | string;
  readonly entityType: AuditEntityType | string;
  readonly entityId: ID;
  readonly metadata?: Record<string, unknown>;
  readonly ipAddress?: string;
  readonly createdAt: Timestamp;

  // Compatibility aliases
  readonly userId?: ID;
  readonly userEmail?: string;
  readonly resourceType?: string;
  readonly resourceId?: ID;
  readonly details?: Record<string, unknown>;
}

export interface CreateAuditLogDto {
  readonly actorUserId: ID;
  readonly actorEmail?: string;
  readonly action: AuditLogAction | string;
  readonly entityType: AuditEntityType | string;
  readonly entityId: ID;
  readonly metadata?: Record<string, unknown>;
  readonly ipAddress?: string;
}
