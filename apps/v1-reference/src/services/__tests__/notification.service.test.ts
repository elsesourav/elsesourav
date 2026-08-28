import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotificationService } from '../notification.service';
import type { INotificationRepository } from '@/repositories';
import type { Notification } from '@/types/notification.types';
import { ok, err } from '@/lib/result';
import { AppError } from '@/lib/errors';

describe('NotificationService Unit Tests', () => {
  let mockRepo: INotificationRepository;
  let service: NotificationService;

  const mockNotification: Notification = {
    id: 'notif-1',
    userId: 'user-123',
    type: 'APP_UPDATE',
    severity: 'info',
    title: 'CodeFlow IDE v1.3 Released',
    message: 'Check out the new real-time debugger and terminal integrations.',
    link: '/apps/codeflow-ide',
    relatedAppId: 'app-flow',
    read: false,
    isRead: false,
    createdAt: 1700000000000,
    updatedAt: 1700000000000,
  };

  beforeEach(() => {
    mockRepo = {
      listUserNotifications: vi.fn(),
      getUnreadCount: vi.fn(),
      markAsRead: vi.fn(),
      markAllAsRead: vi.fn(),
      createForUser: vi.fn(),
      subscribeToUserNotifications: vi.fn(),
      findById: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };

    service = new NotificationService(mockRepo);
  });

  it('1. Retrieves user notifications with pagination options', async () => {
    vi.mocked(mockRepo.listUserNotifications).mockResolvedValue(
      ok({
        items: [mockNotification],
        hasMore: false,
        nextCursor: '1700000000000',
      })
    );

    const res = await service.getUserNotifications('user-123', { limit: 10 });
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data.items).toHaveLength(1);
      expect(res.data.items[0]?.title).toBe('CodeFlow IDE v1.3 Released');
    }
    expect(mockRepo.listUserNotifications).toHaveBeenCalledWith('user-123', { limit: 10 });
  });

  it('2. Computes unread notification count efficiently', async () => {
    vi.mocked(mockRepo.getUnreadCount).mockResolvedValue(ok(3));

    const res = await service.getUnreadCount('user-123');
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data).toBe(3);
    }
    expect(mockRepo.getUnreadCount).toHaveBeenCalledWith('user-123');
  });

  it('3. Marks a single notification as read', async () => {
    vi.mocked(mockRepo.markAsRead).mockResolvedValue(
      ok({
        ...mockNotification,
        read: true,
        isRead: true,
        readAt: 1700000500000,
      })
    );

    const res = await service.markAsRead('user-123', 'notif-1');
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data.read).toBe(true);
    }
    expect(mockRepo.markAsRead).toHaveBeenCalledWith('user-123', 'notif-1');
  });

  it('4. Marks all unread notifications as read', async () => {
    vi.mocked(mockRepo.markAllAsRead).mockResolvedValue(ok(4));

    const res = await service.markAllAsRead('user-123');
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data).toBe(4);
    }
    expect(mockRepo.markAllAsRead).toHaveBeenCalledWith('user-123');
  });

  it('5. Creates notification for user via trusted boundary', async () => {
    vi.mocked(mockRepo.createForUser).mockResolvedValue(ok(mockNotification));

    const res = await service.createNotification({
      userId: 'user-123',
      type: 'SUPPORT_REPLY',
      title: 'New reply to ticket #ES-100',
      message: 'Support team responded to your query.',
      link: '/support/tickets/ticket-100',
      read: false,
    });

    expect(res.success).toBe(true);
    expect(mockRepo.createForUser).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-123',
        type: 'SUPPORT_REPLY',
      })
    );
  });

  it('6. Subscribes to realtime notifications with clean unsubscribe handle', () => {
    const mockUnsubscribe = vi.fn();
    vi.mocked(mockRepo.subscribeToUserNotifications).mockReturnValue(mockUnsubscribe);

    const onUpdate = vi.fn();
    const onError = vi.fn();

    const unsub = service.subscribeToUserNotifications('user-123', onUpdate, onError);
    expect(mockRepo.subscribeToUserNotifications).toHaveBeenCalledWith(
      'user-123',
      onUpdate,
      onError
    );

    unsub();
    expect(mockUnsubscribe).toHaveBeenCalled();
  });

  it('7. Propagates errors cleanly when repository returns failure', async () => {
    vi.mocked(mockRepo.getUnreadCount).mockResolvedValue(
      err(AppError.internal('Database connection error'))
    );

    const res = await service.getUnreadCount('user-123');
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.message).toBe('Database connection error');
    }
  });
});
