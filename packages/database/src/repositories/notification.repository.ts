import { PrismaClient } from '@prisma/client';
import { prisma as defaultPrisma } from '../client';
import { mapPrismaNotificationToDomain } from '../mappers/notification.mapper';
import type { NotificationItem, CreateNotificationInput } from '@elsesourav/types';

export class NotificationRepository {
  constructor(private readonly prisma: PrismaClient = defaultPrisma) {}

  /**
   * Retrieves notifications for a specific user
   */
  async findUserNotifications(userId: string, limit: number = 30): Promise<NotificationItem[]> {
    const boundedLimit = Math.min(Math.max(limit, 1), 100);
    const records = await this.prisma.notification.findMany({
      where: { userId },
      take: boundedLimit,
      orderBy: { createdAt: 'desc' },
    });

    return records.map(mapPrismaNotificationToDomain);
  }

  /**
   * Gets unread notification count for a specific user
   */
  async getUnreadCount(userId: string): Promise<number> {
    return this.prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });
  }

  /**
   * Finds notification by ID scoped to owner user
   */
  async findByIdAndOwner(notificationId: string, userId: string): Promise<NotificationItem | null> {
    const record = await this.prisma.notification.findFirst({
      where: {
        id: notificationId,
        userId,
      },
    });

    return record ? mapPrismaNotificationToDomain(record) : null;
  }

  /**
   * Marks a single notification as read with ownership verification
   */
  async markAsRead(notificationId: string, userId: string): Promise<boolean> {
    const result = await this.prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return result.count > 0;
  }

  /**
   * Marks all unread notifications as read for a user
   */
  async markAllAsRead(userId: string): Promise<number> {
    const result = await this.prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return result.count;
  }

  /**
   * Deletes a notification scoped to user ownership
   */
  async deleteNotification(notificationId: string, userId: string): Promise<boolean> {
    const result = await this.prisma.notification.deleteMany({
      where: {
        id: notificationId,
        userId,
      },
    });

    return result.count > 0;
  }

  /**
   * Creates a notification for a user
   */
  async createNotification(data: CreateNotificationInput): Promise<NotificationItem> {
    const record = await this.prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        title: data.title.trim(),
        message: data.message.trim(),
        linkUrl: data.linkUrl ? data.linkUrl.trim() : null,
        isRead: false,
      },
    });

    return mapPrismaNotificationToDomain(record);
  }
}
