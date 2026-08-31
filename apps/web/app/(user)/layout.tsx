import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getServerSession } from '@elsesourav/auth';
import { UserNav } from '@/features/user/components/UserNav';
import { UserAvatarMenu } from '@/features/user/components/UserAvatarMenu';
import { UserSidebar } from '@/features/user/components/UserSidebar';
import { SearchButton } from '@/components/search/SearchButton';
import { ThemePopup } from '@/components/theme/ThemePopup';
import { HeaderNotificationBell } from '@/features/notifications/components/HeaderNotificationBell';
import { getUserUnreadNotificationsCount } from '@/features/notifications/queries/get-notifications';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default async function UserLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const session = await getServerSession({
    getAll: () => cookieStore.getAll(),
  });

  if (!session?.user) {
    redirect('/login?next=/profile');
  }

  const unreadCount = await getUserUnreadNotificationsCount();

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors overflow-x-hidden">
      <header className="border-b border-border/80 bg-background/85 backdrop-blur-2xl sticky top-0 z-50 transition-colors w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
          {/* Brand Logo & Desktop Primary Navigation */}
          <div className="flex items-center gap-4 sm:gap-6 shrink-0">
            <Link
              href="/"
              className="flex items-center gap-2 sm:gap-2.5 font-bold text-sm sm:text-base text-foreground tracking-tight hover:opacity-90 transition-opacity group shrink-0"
            >
              <div className="w-8 h-8 rounded-xl overflow-hidden flex items-center justify-center group-hover:scale-105 transition-transform duration-200 ring-1 ring-border shrink-0">
                <Image
                  src="/logo-sm.png"
                  alt="ElseSourav Logo"
                  width={32}
                  height={32}
                  className="w-full h-full object-contain"
                  priority
                />
              </div>
              <span className="tracking-tight font-bold">ElseSourav</span>
            </Link>

            {/* Desktop Navigation Links */}
            <UserNav user={session.user} desktopOnly />
          </div>

          {/* Action Cluster: Search, Notifications, Theme & User Menu */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <SearchButton />
            <HeaderNotificationBell initialUnreadCount={unreadCount} />

            <div className="hidden sm:block">
              <ThemePopup />
            </div>

            <div className="w-px h-5 bg-border mx-0.5 hidden sm:block" />

            <UserAvatarMenu user={session.user} />
          </div>
        </div>
      </header>

      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 lg:py-8 flex gap-6 lg:gap-8">
        <UserSidebar />
        <main id="main-content" className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
