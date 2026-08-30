import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getServerSession } from '@elsesourav/auth';
import { UserNav } from '@/features/user/components/UserNav';
import { UserAvatarMenu } from '@/features/user/components/UserAvatarMenu';
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
    <div className="min-h-screen flex flex-col bg-zinc-950 text-white">
      <header className="border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="flex items-center gap-2.5 font-bold text-base text-white tracking-tight hover:opacity-90 transition-opacity group"
            >
              <div className="w-8 h-8 rounded-xl overflow-hidden flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
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
      <main id="main-content" className="flex-1">
        {children}
      </main>
    </div>
  );
}
