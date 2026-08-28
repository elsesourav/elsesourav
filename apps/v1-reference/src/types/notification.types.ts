import type { ID, Timestamp } from './common.types';

/**
 * Supported in-app notification types
 */
export type NotificationType =
  | 'APP_UPDATE'
  | 'SUPPORT_REPLY'
  | 'SUPPORT_STATUS_CHANGE'
  | 'SYSTEM'
  | 'LIBRARY_UPDATE'
  | 'ACCOUNT';

export type NotificationSeverity = 'info' | 'success' | 'warning' | 'error';

/**
 * User Notification Domain Entity
 */
export interface Notification {
  readonly id: ID;
  readonly userId: ID;
  readonly type: NotificationType;
  readonly severity?: NotificationSeverity;
  readonly title: string;
  readonly message: string;
  readonly link?: string;
  readonly linkUrl?: string;
  readonly relatedAppId?: ID;
  readonly relatedTicketId?: ID;
  readonly read: boolean;
  readonly isRead?: boolean;
  readonly readAt?: Timestamp;
  readonly createdAt: Timestamp;
  readonly updatedAt: Timestamp;
  readonly expiresAt?: Timestamp;
}
