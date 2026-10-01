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
    <div className="min-h-screen lg:h-screen flex flex-col bg-background text-foreground transition-colors overflow-x-clip lg:overflow-hidden relative">
      {/* Dynamic Ambient Background Elements */}
      <div
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
        aria-hidden="true"
      >
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-gradient-to-b from-primary/10 via-primary/5 to-transparent blur-3xl opacity-70 dark:opacity-40" />
      </div>

      {/* Streamlined Authenticated Global Header */}
      <header className="border-b border-border/80 bg-background/80 backdrop-blur-xl sticky top-0 z-50 transition-colors w-full shrink-0">
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

          {/* Action Cluster: Theme Switcher, Search & User Avatar Menu */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <ThemePopup />
            <SearchButton />
            <UserAvatarMenu user={session.user} />
          </div>
        </div>
      </header>

      {/* Main Authenticated Layout: Fixed Shell on Desktop with Independent Scroll View for Content */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-3 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6 flex flex-col lg:flex-row items-start gap-4 sm:gap-5 lg:gap-6 lg:h-[calc(100dvh-4rem)] lg:overflow-hidden">
        <UserSidebar />
        <main id="main-content" className="flex-1 min-w-0 w-full lg:h-full lg:overflow-y-auto lg:pr-1">
          {children}
        </main>
      </div>
    </div>
  );
}
