import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getServerSession } from '@elsesourav/auth';
import { Card, Button } from '@elsesourav/ui';
import { Bell, Settings } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Notifications | ElseSourav',
  description: 'View your account activity and application update notifications.',
};

export default async function NotificationsPage() {
  const cookieStore = await cookies();
  const session = await getServerSession({
    getAll: () => cookieStore.getAll(),
  });

  if (!session?.user) {
    redirect('/login?next=/notifications');
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-100 tracking-tight">
            Notifications
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400">
            System updates, security alerts, and application releases.
          </p>
        </div>

        <Link href="/settings">
          <Button variant="ghost" size="sm" className="text-xs text-zinc-400 hover:text-zinc-200 gap-1.5">
            <Settings className="w-3.5 h-3.5" /> Preferences
          </Button>
        </Link>
      </div>

      <Card className="py-16 px-4 text-center rounded-3xl border-zinc-800/80 bg-zinc-900/30 backdrop-blur-sm space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-zinc-800/80 border border-zinc-700/60 flex items-center justify-center mx-auto text-zinc-400">
          <Bell className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-zinc-200">No new notifications</h3>
          <p className="text-xs text-zinc-500 max-w-xs mx-auto">
            You're all caught up! When updates or releases occur, they will appear here.
          </p>
        </div>
      </Card>
    </div>
  );
}
