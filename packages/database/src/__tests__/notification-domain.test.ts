import { describe, it, expect, vi } from 'vitest';
import { NotificationService, NotificationRepository } from '../index';
import { AppError } from '@elsesourav/types';
import type { NotificationItem } from '@elsesourav/types';

describe('Notification Domain Service, Ownership & Isolation Lifecycle', () => {
  const mockNotificationAlice: NotificationItem = {
    id: 'notif-101',
    userId: 'usr-alice',
    type: 'SUPPORT_REPLY',
    title: 'Support reply received',
    message: 'An engineer has replied to your ticket TICK-9A82KZ.',
    linkUrl: '/support/tickets/ticket-101',
    isRead: false,
    createdAt: 1704067000000,
  };

  const mockNotificationBob: NotificationItem = {
    id: 'notif-202',
    userId: 'usr-bob',
    type: 'APP_UPDATE',
    title: 'New app released',
    message: 'Check out the new developer terminal application.',
    linkUrl: '/apps/web-terminal',
    isRead: true,
    readAt: 1704067100000,
    createdAt: 1704067000000,
  };

  // ==========================================
  // Ownership & Retrieval Tests
  // ==========================================

  it('retrieves user notifications and calculates unread count', async () => {
    const mockRepo = {
      findUserNotifications: vi.fn().mockResolvedValue([mockNotificationAlice]),
      getUnreadCount: vi.fn().mockResolvedValue(1),
    } as unknown as NotificationRepository;

    const service = new NotificationService(mockRepo);
    const result = await service.getUserNotifications('usr-alice', 30);

    expect(result.items).toHaveLength(1);
    expect(result.items[0]?.id).toBe('notif-101');
    expect(result.unreadCount).toBe(1);
    expect(result.totalCount).toBe(1);
    expect(mockRepo.findUserNotifications).toHaveBeenCalledWith('usr-alice', 30);
    expect(mockRepo.getUnreadCount).toHaveBeenCalledWith('usr-alice');
  });

  it('retrieves distinct notifications for user B', async () => {
    const mockRepo = {
      findUserNotifications: vi.fn().mockResolvedValue([mockNotificationBob]),
      getUnreadCount: vi.fn().mockResolvedValue(0),
    } as unknown as NotificationRepository;

    const service = new NotificationService(mockRepo);
    const result = await service.getUserNotifications('usr-bob', 10);

    expect(result.items).toHaveLength(1);
    expect(result.items[0]?.id).toBe('notif-202');
    expect(result.unreadCount).toBe(0);
    expect(mockRepo.findUserNotifications).toHaveBeenCalledWith('usr-bob', 10);
  });

  it('rejects unauthenticated caller from retrieving notifications', async () => {
    const mockRepo = {} as NotificationRepository;
    const service = new NotificationService(mockRepo);

    await expect(service.getUserNotifications('')).rejects.toThrowError(AppError);
  });

  // ==========================================
  // Mark-As-Read & Isolation Tests
  // ==========================================

  it('allows owner (User A) to mark their notification as read', async () => {
    const mockRepo = {
      markAsRead: vi.fn().mockResolvedValue(true),
    } as unknown as NotificationRepository;

    const service = new NotificationService(mockRepo);
    await service.markAsRead('usr-alice', 'notif-101');

    expect(mockRepo.markAsRead).toHaveBeenCalledWith('notif-101', 'usr-alice');
  });

  it('blocks User B from marking User A notification as read (Throws 404/Unauthorized)', async () => {
    const mockRepo = {
      markAsRead: vi.fn().mockResolvedValue(false), // 0 rows modified due to userId mismatch
    } as unknown as NotificationRepository;

    const service = new NotificationService(mockRepo);

    await expect(
      service.markAsRead('usr-bob', 'notif-101')
    ).rejects.toThrowError(AppError);

    expect(mockRepo.markAsRead).toHaveBeenCalledWith('notif-101', 'usr-bob');
  });

  it('marks all notifications as read for current user only', async () => {
    const mockRepo = {
      markAllAsRead: vi.fn().mockResolvedValue(3),
    } as unknown as NotificationRepository;

    const service = new NotificationService(mockRepo);
    const count = await service.markAllAsRead('usr-alice');

    expect(count).toBe(3);
    expect(mockRepo.markAllAsRead).toHaveBeenCalledWith('usr-alice');
  });

  // ==========================================
  // Deletion & Security Tests
  // ==========================================

  it('allows owner to delete their notification', async () => {
    const mockRepo = {
      deleteNotification: vi.fn().mockResolvedValue(true),
    } as unknown as NotificationRepository;

    const service = new NotificationService(mockRepo);
    await service.deleteNotification('usr-alice', 'notif-101');

    expect(mockRepo.deleteNotification).toHaveBeenCalledWith('notif-101', 'usr-alice');
  });

  it('blocks User B from deleting User A notification', async () => {
    const mockRepo = {
      deleteNotification: vi.fn().mockResolvedValue(false), // 0 rows affected
    } as unknown as NotificationRepository;

    const service = new NotificationService(mockRepo);

    await expect(
      service.deleteNotification('usr-bob', 'notif-101')
    ).rejects.toThrowError(AppError);

    expect(mockRepo.deleteNotification).toHaveBeenCalledWith('notif-101', 'usr-bob');
  });

  // ==========================================
  // Notification Creation / Event Boundary
  // ==========================================

  it('creates and sends notification via domain event handler', async () => {
    const mockRepo = {
      createNotification: vi.fn().mockResolvedValue(mockNotificationAlice),
    } as unknown as NotificationRepository;

    const service = new NotificationService(mockRepo);
    const created = await service.sendNotification({
      userId: 'usr-alice',
      type: 'SUPPORT_REPLY',
      title: 'Support reply received',
      message: 'An engineer has replied to your ticket TICK-9A82KZ.',
      linkUrl: '/support/tickets/ticket-101',
    });

    expect(created.id).toBe('notif-101');
    expect(created.userId).toBe('usr-alice');
    expect(mockRepo.createNotification).toHaveBeenCalled();
  });
});
