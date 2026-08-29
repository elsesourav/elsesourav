'use server';

import { NotificationRepository, NotificationService } from '@elsesourav/database';
import { getServerSession } from '@elsesourav/auth';
import { cookies } from 'next/headers';
import { MarkNotificationReadSchema, DeleteNotificationSchema } from '@elsesourav/validation';
import { revalidatePath } from 'next/cache';

const notificationRepo = new NotificationRepository();
const notificationService = new NotificationService(notificationRepo);

async function getSessionUser() {
  const cookieStore = await cookies();
  const session = await getServerSession({
    getAll: () => cookieStore.getAll(),
  });
  return session?.user ?? null;
}

export async function markNotificationAsReadAction(notificationId: string) {
  const user = await getSessionUser();
  if (!user?.id) {
    return { success: false, error: 'Unauthorized' };
  }

  const parsed = MarkNotificationReadSchema.safeParse({ notificationId });
  if (!parsed.success) {
    return { success: false, error: 'Invalid notification identifier' };
  }

  try {
    await notificationService.markAsRead(user.id, parsed.data.notificationId);
    revalidatePath('/notifications');
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to mark notification as read',
    };
  }
}

export async function markAllNotificationsAsReadAction() {
  const user = await getSessionUser();
  if (!user?.id) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const count = await notificationService.markAllAsRead(user.id);
    revalidatePath('/notifications');
    return { success: true, count };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to mark all notifications as read',
    };
  }
}

export async function deleteNotificationAction(notificationId: string) {
  const user = await getSessionUser();
  if (!user?.id) {
    return { success: false, error: 'Unauthorized' };
  }

  const parsed = DeleteNotificationSchema.safeParse({ notificationId });
  if (!parsed.success) {
    return { success: false, error: 'Invalid notification identifier' };
  }

  try {
    await notificationService.deleteNotification(user.id, parsed.data.notificationId);
    revalidatePath('/notifications');
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete notification',
    };
  }
}
