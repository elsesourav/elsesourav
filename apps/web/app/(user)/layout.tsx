import { SearchButton } from '@/components/search/SearchButton';
import { ThemePopup } from '@/components/theme/ThemePopup';
import { UserAvatarMenu } from '@/features/user/components/UserAvatarMenu';
import { UserSidebar } from '@/features/user/components/UserSidebar';
import { getServerSession } from '@elsesourav/auth';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import * as React from 'react';

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

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors overflow-x-hidden">
      {/* Streamlined Authenticated Global Header */}
      <header className="border-b border-border/80 bg-background/85 backdrop-blur-2xl sticky top-0 z-50 transition-colors w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-4 sm:gap-6 shrink-0">
            <Link
              href="/"
              className="flex items-center gap-2.5 font-bold text-base text-foreground tracking-tight hover:opacity-90 transition-opacity group shrink-0"
            >
              <div className="w-8 h-8 flex items-center justify-center group-hover:scale-105 transition-transform duration-200 shrink-0">
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
          </div>

          {/* Action Cluster: Search, Theme Toggle & User Avatar Menu */}
          <div className="flex items-center gap-2 shrink-0">
            <SearchButton />

            <ThemePopup />

            <div className="w-px h-5 bg-border mx-0.5" />

            <UserAvatarMenu user={session.user} />
          </div>
        </div>
      </header>

      {/* Main Authenticated Layout with Sticky Sidebar on Desktop & Menu on Mobile */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-5 lg:py-6 flex flex-col lg:flex-row items-start gap-5 lg:gap-6">
        <UserSidebar />
        <main id="main-content" className="flex-1 min-w-0 w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
