import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './useAuth';
import { notificationService } from '@/services/notification.service';
import type { Notification } from '@/types/notification.types';
import type { AppError } from '@/lib/errors';
import { isErr, isOk } from '@/lib/result';

export interface UseNotificationsReturn {
  readonly notifications: Notification[];
  readonly unreadCount: number;
  readonly isLoading: boolean;
  readonly error: AppError | null;
  readonly markAsRead: (notificationId: string) => Promise<void>;
  readonly markAllAsRead: () => Promise<void>;
  readonly refetch: () => Promise<void>;
}

export function useNotifications(): UseNotificationsReturn {
  const { user, authUser, isAuthenticated } = useAuth();
  const userId = user?.id || authUser?.uid;

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(Boolean(isAuthenticated && userId));
  const [error, setError] = useState<AppError | null>(null);

  const isMounted = useRef<boolean>(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const fetchNotifications = useCallback(async () => {
    if (!userId || !isAuthenticated) {
      setNotifications([]);
      setUnreadCount(0);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const [notifsRes, countRes] = await Promise.all([
      notificationService.getUserNotifications(userId, { limit: 30 }),
      notificationService.getUnreadCount(userId),
    ]);

    if (!isMounted.current) return;

    if (isOk(notifsRes)) {
      setNotifications([...notifsRes.data.items]);
    } else {
      setError(notifsRes.error);
    }

    if (isOk(countRes)) {
      setUnreadCount(countRes.data);
    }

    setIsLoading(false);
  }, [userId, isAuthenticated]);

  // Realtime subscription with automatic cleanup
  useEffect(() => {
    if (!userId || !isAuthenticated) {
      setNotifications([]);
      setUnreadCount(0);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const unsubscribe = notificationService.subscribeToUserNotifications(
      userId,
      (updatedItems) => {
        if (!isMounted.current) return;
        setNotifications(updatedItems);
        const unread = updatedItems.filter((n) => !n.read && !n.isRead).length;
        setUnreadCount(unread);
        setIsLoading(false);
        setError(null);
      },
      (subError) => {
        if (!isMounted.current) return;
        setError(subError);
        setIsLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [userId, isAuthenticated]);

  const markAsRead = useCallback(
    async (notificationId: string) => {
      if (!userId || !notificationId) return;

      // Optimistic update
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));

      const res = await notificationService.markAsRead(userId, notificationId);
      if (isErr(res)) {
        // Revert on failure
        await fetchNotifications();
      }
    },
    [userId, fetchNotifications]
  );

  const markAllAsRead = useCallback(async () => {
    if (!userId) return;

    // Optimistic update
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true, isRead: true })));
    setUnreadCount(0);

    const res = await notificationService.markAllAsRead(userId);
    if (isErr(res)) {
      await fetchNotifications();
    }
  }, [userId, fetchNotifications]);

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    refetch: fetchNotifications,
  };
}
