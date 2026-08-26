import type { ID, Timestamp } from './common.types';

/**
 * Notification Types & Severities
 */
export type NotificationType = 'system' | 'app_update' | 'ticket_reply' | 'announcement';

export type NotificationSeverity = 'info' | 'success' | 'warning' | 'error';

/**
 * User Notification Entity
 */
export interface Notification {
  readonly id: ID;
  readonly userId: ID;
  readonly type: NotificationType;
  readonly severity: NotificationSeverity;
  readonly title: string;
  readonly message: string;
  readonly linkUrl?: string;
  readonly isRead: boolean;
  readonly readAt?: Timestamp;
  readonly createdAt: Timestamp;
}
