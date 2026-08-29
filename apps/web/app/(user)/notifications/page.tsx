import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getServerSession } from '@elsesourav/auth';
import { getUserNotificationsData } from '@/features/notifications/queries/get-notifications';
import { NotificationList } from '@/features/notifications/components/NotificationList';
import { Button, Badge } from '@elsesourav/ui';
import { Settings } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Notifications | ElseSourav',
  description: 'View your account activity, support replies, and application update notifications.',
};

export default async function NotificationsPage() {
  const cookieStore = await cookies();
  const session = await getServerSession({
    getAll: () => cookieStore.getAll(),
  });

  if (!session?.user) {
    redirect('/login?next=/notifications');
  }

  const notificationData = await getUserNotificationsData();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-100 tracking-tight">
              Notifications
            </h1>
            {notificationData.unreadCount > 0 && (
              <Badge
                variant="info"
                className="text-xs px-2 py-0.5 bg-indigo-950/60 text-indigo-300 border border-indigo-500/30"
              >
                {notificationData.unreadCount} unread
              </Badge>
            )}
          </div>
          <p className="text-xs sm:text-sm text-zinc-400">
            Support replies, app releases, security alerts, and system updates.
          </p>
        </div>

        <Link href="/settings">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-zinc-400 hover:text-zinc-200 gap-1.5 self-start sm:self-auto"
          >
            <Settings className="w-3.5 h-3.5" /> Preferences
          </Button>
        </Link>
      </div>

      {/* Notification Center Stream */}
      <NotificationList
        initialNotifications={notificationData.items}
        initialUnreadCount={notificationData.unreadCount}
      />
    </div>
  );
}
