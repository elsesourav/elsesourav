import type { ID, Timestamp } from './common.types';

export type NotificationType =
  | 'system_announcement'
  | 'app_release'
  | 'support_reply'
  | 'security_alert';

export interface Notification {
  readonly id: ID;
  readonly userId: ID;
  readonly type: NotificationType;
  readonly title: string;
  readonly message: string;
  readonly linkUrl?: string;
  readonly isRead: boolean;
  readonly createdAt: Timestamp;
}
