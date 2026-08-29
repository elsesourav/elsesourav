import type { ID, Timestamp } from './common.types';

export type NotificationType =
  | 'SUPPORT_REPLY'
  | 'SUPPORT_STATUS_CHANGE'
  | 'APP_UPDATE'
  | 'LIBRARY_UPDATE'
  | 'ACCOUNT'
  | 'SYSTEM'
  | 'SECURITY'
  | 'system_announcement'
  | 'app_release'
  | 'support_reply'
  | 'security_alert';

export type NotificationSeverity = 'info' | 'success' | 'warning' | 'error';

export interface NotificationItem {
  readonly id: ID;
  readonly userId: ID;
  readonly type: NotificationType;
  readonly title: string;
  readonly message: string;
  readonly linkUrl?: string;
  readonly isRead: boolean;
  readonly readAt?: Timestamp;
  readonly createdAt: Timestamp;
}

export type Notification = NotificationItem;

export interface CreateNotificationInput {
  readonly userId: string;
  readonly type: NotificationType | string;
  readonly title: string;
  readonly message: string;
  readonly linkUrl?: string;
}

export interface MarkNotificationReadInput {
  readonly notificationId: string;
}

export interface NotificationListResult {
  readonly items: readonly NotificationItem[];
  readonly unreadCount: number;
  readonly totalCount: number;
}
