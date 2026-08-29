import type { NotificationItem, NotificationType } from '@elsesourav/types';

let notifCounter = 1;

export function resetNotificationFactoryCounter(): void {
  notifCounter = 1;
}

export function createNotificationItem(overrides?: Partial<NotificationItem>): NotificationItem {
  const index = notifCounter++;
  return {
    id: overrides?.id || `notif-test-${index}`,
    userId: overrides?.userId || 'usr-test-1',
    type: (overrides?.type as NotificationType) || 'system',
    title: overrides?.title || `System Announcement #${index}`,
    message:
      overrides?.message ||
      `A new version of Terminal Pro (v2.1.0) is now available with WebGPU hardware acceleration.`,
    linkUrl: overrides?.linkUrl || '/apps/terminal-pro',
    isRead: overrides?.isRead ?? false,
    createdAt: overrides?.createdAt ?? 1704067200000 + index * 3600000,
  };
}
