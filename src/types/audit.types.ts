import type { ID, Timestamp } from './common.types';

/**
 * Audit Log Actions & Resource Types
 */
export type AuditAction =
  'create' | 'update' | 'delete' | 'publish' | 'archive' | 'login' | 'status_change';

export type AuditResourceType =
  'app' | 'blog_post' | 'help_article' | 'ticket' | 'user' | 'config' | 'feedback';

/**
 * Administrative Audit Log Entity
 */
export interface AuditLog {
  readonly id: ID;
  readonly userId: ID;
  readonly userEmail: string;
  readonly action: AuditAction;
  readonly resourceType: AuditResourceType;
  readonly resourceId: ID;
  readonly details?: Record<string, unknown>;
  readonly ipAddress?: string;
  readonly createdAt: Timestamp;
}
