import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getServerSession } from '@elsesourav/auth';
import { getUserNotificationsData } from '@/features/notifications/queries/get-notifications';
import { NotificationList } from '@/features/notifications/components/NotificationList';
import { PageShell, PageHeader, Button, Badge } from '@elsesourav/ui';
import { Settings } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Notifications | ElseSourav',
  description: 'View your account activity, support replies, and application update notifications.',
  robots: {
    index: false,
    follow: false,
  },
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
    <PageShell size="lg" glow padded={false}>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <PageHeader
            eyebrow="Activity Center"
            badge={
              notificationData.unreadCount > 0 ? (
                <Badge variant="primary" className="text-xs px-2.5 py-0.5 font-medium">
                  {notificationData.unreadCount} unread
                </Badge>
              ) : undefined
            }
            title="Notifications"
            description="Support replies, app releases, security alerts, and system updates."
          />

          <Link href="/settings?tab=preferences" className="self-start sm:self-auto sm:pt-4">
            <Button
              variant="outline"
              size="sm"
              className="text-xs text-foreground border-border hover:bg-accent gap-1.5 rounded-xl cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5 text-primary" />
              <span>Notification Preferences</span>
            </Button>
          </Link>
        </div>

        {/* Notification Center Stream */}
        <NotificationList
          initialNotifications={notificationData.items}
          initialUnreadCount={notificationData.unreadCount}
        />
      </div>
    </PageShell>
  );
}
