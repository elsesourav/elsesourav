import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getServerSession } from '@elsesourav/auth';
import { UserNav } from '@/features/user/components/UserNav';
import { UserAvatarMenu } from '@/features/user/components/UserAvatarMenu';
import { UserSidebar } from '@/features/user/components/UserSidebar';
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

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors">
      <header className="border-b border-border/80 bg-background/85 backdrop-blur-2xl sticky top-0 z-50 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="flex items-center gap-2.5 font-bold text-base text-foreground tracking-tight hover:opacity-90 transition-opacity group"
            >
              <div className="w-8 h-8 rounded-xl overflow-hidden flex items-center justify-center group-hover:scale-105 transition-transform duration-200 ring-1 ring-border">
                <Image
                  src="/logo-sm.png"
                  alt="ElseSourav Logo"
                  width={32}
                  height={32}
                  className="w-full h-full object-contain"
                  priority
                />
              </div>
              <span className="tracking-tight">ElseSourav</span>
            </Link>

            <UserNav user={session.user} />
          </div>

          <div className="flex items-center gap-3">
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
