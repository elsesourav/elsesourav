import { AppError } from '@elsesourav/types';
import type { NotificationRepository } from '../repositories/notification.repository';
import type {
  NotificationItem,
  CreateNotificationInput,
  NotificationListResult,
} from '@elsesourav/types';

export class NotificationService {
  constructor(private readonly notificationRepo: NotificationRepository) {}

  /**
   * Retrieves notifications and unread count for the authenticated user
   */
  async getUserNotifications(userId: string, limit: number = 30): Promise<NotificationListResult> {
    if (!userId) {
      throw AppError.unauthorized('User must be authenticated to view notifications.');
    }

    const [items, unreadCount] = await Promise.all([
      this.notificationRepo.findUserNotifications(userId, limit),
      this.notificationRepo.getUnreadCount(userId),
    ]);

    return {
      items,
      unreadCount,
      totalCount: items.length,
    };
  }

  /**
   * Retrieves unread notification count for the authenticated user
   */
  async getUnreadCount(userId: string): Promise<number> {
    if (!userId) {
      throw AppError.unauthorized('User must be authenticated to get unread count.');
    }
    return this.notificationRepo.getUnreadCount(userId);
  }

  /**
   * Marks a notification as read with strict ownership verification
   */
  async markAsRead(userId: string, notificationId: string): Promise<void> {
    if (!userId) {
      throw AppError.unauthorized('User must be authenticated.');
    }
    if (!notificationId) {
      throw AppError.validation('Notification ID is required.');
    }

    const success = await this.notificationRepo.markAsRead(notificationId, userId);
    if (!success) {
      throw AppError.notFound('Notification not found or unauthorized.');
    }
  }

  /**
   * Marks all notifications as read for the authenticated user
   */
  async markAllAsRead(userId: string): Promise<number> {
    if (!userId) {
      throw AppError.unauthorized('User must be authenticated.');
    }
    return this.notificationRepo.markAllAsRead(userId);
  }

  /**
   * Deletes a notification with strict ownership verification
   */
  async deleteNotification(userId: string, notificationId: string): Promise<void> {
    if (!userId) {
      throw AppError.unauthorized('User must be authenticated.');
    }
    if (!notificationId) {
      throw AppError.validation('Notification ID is required.');
    }

    const success = await this.notificationRepo.deleteNotification(notificationId, userId);
    if (!success) {
      throw AppError.notFound('Notification not found or unauthorized.');
    }
  }

  /**
   * Sends a notification to a specific user (used by domain event handlers)
   */
  async sendNotification(data: CreateNotificationInput): Promise<NotificationItem> {
    if (!data.userId) {
      throw AppError.validation('Recipient userId is required.');
    }
    return this.notificationRepo.createNotification(data);
  }
}
