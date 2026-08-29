import { NotificationRepository, NotificationService } from '@elsesourav/database';
import { getServerSession } from '@elsesourav/auth';
import { cookies } from 'next/headers';
import type { NotificationListResult } from '@elsesourav/types';

const notificationRepo = new NotificationRepository();
const notificationService = new NotificationService(notificationRepo);

export async function getUserNotificationsData(limit = 40): Promise<NotificationListResult> {
  const cookieStore = await cookies();
  const session = await getServerSession({
    getAll: () => cookieStore.getAll(),
  });

  if (!session?.user?.id) {
    return {
      items: [],
      unreadCount: 0,
      totalCount: 0,
    };
  }

  try {
    return await notificationService.getUserNotifications(session.user.id, limit);
  } catch {
    return {
      items: [],
      unreadCount: 0,
      totalCount: 0,
    };
  }
}

export async function getUserUnreadNotificationsCount(): Promise<number> {
  const cookieStore = await cookies();
  const session = await getServerSession({
    getAll: () => cookieStore.getAll(),
  });

  if (!session?.user?.id) return 0;

  try {
    return await notificationService.getUnreadCount(session.user.id);
  } catch {
    return 0;
  }
}
