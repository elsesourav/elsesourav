import type { Notification } from '@/types/notification.types';
import type { Result } from '@/types/result.types';
import type { AppError } from '@/lib/errors';
import type { PaginatedResult, QueryOptions } from '@/repositories/types';
import {
  notificationRepository,
  type INotificationRepository,
  type CreateNotificationDto,
} from '@/repositories';

export type { CreateNotificationDto };

export interface INotificationService {
  getUserNotifications(
    userId: string,
    options?: QueryOptions
  ): Promise<Result<PaginatedResult<Notification>, AppError>>;
  getUnreadCount(userId: string): Promise<Result<number, AppError>>;
  markAsRead(userId: string, notificationId: string): Promise<Result<Notification, AppError>>;
  markAllAsRead(userId: string): Promise<Result<number, AppError>>;
  createNotification(data: CreateNotificationDto): Promise<Result<Notification, AppError>>;
  subscribeToUserNotifications(
    userId: string,
    onUpdate: (notifications: Notification[]) => void,
    onError?: (error: AppError) => void
  ): () => void;
}

export class NotificationService implements INotificationService {
  constructor(
    private readonly notificationRepo: INotificationRepository = notificationRepository
  ) {}

  public async getUserNotifications(
    userId: string,
    options?: QueryOptions
  ): Promise<Result<PaginatedResult<Notification>, AppError>> {
    return this.notificationRepo.listUserNotifications(userId, options);
  }

  public async getUnreadCount(userId: string): Promise<Result<number, AppError>> {
    return this.notificationRepo.getUnreadCount(userId);
  }

  public async markAsRead(
    userId: string,
    notificationId: string
  ): Promise<Result<Notification, AppError>> {
    return this.notificationRepo.markAsRead(userId, notificationId);
  }

  public async markAllAsRead(userId: string): Promise<Result<number, AppError>> {
    return this.notificationRepo.markAllAsRead(userId);
  }

  public async createNotification(
    data: CreateNotificationDto
  ): Promise<Result<Notification, AppError>> {
    return this.notificationRepo.createForUser(data);
  }

  public subscribeToUserNotifications(
    userId: string,
    onUpdate: (notifications: Notification[]) => void,
    onError?: (error: AppError) => void
  ): () => void {
    return this.notificationRepo.subscribeToUserNotifications(userId, onUpdate, onError);
  }
}

export const notificationService = new NotificationService();
