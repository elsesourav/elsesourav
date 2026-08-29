import type { Notification as PrismaNotification } from '@prisma/client';
import type { NotificationItem, NotificationType } from '@elsesourav/types';

export function mapPrismaNotificationToDomain(record: PrismaNotification): NotificationItem {
  return {
    id: record.id,
    userId: record.userId,
    type: record.type as NotificationType,
    title: record.title,
    message: record.message,
    linkUrl: record.linkUrl ?? undefined,
    isRead: record.isRead,
    readAt: record.readAt ? record.readAt.getTime() : undefined,
    createdAt: record.createdAt.getTime(),
  };
}
