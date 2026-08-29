import * as React from 'react';
import { cookies } from 'next/headers';
import { getServerSession } from '@elsesourav/auth';
import { PublicHeader } from '@/components/navigation/PublicHeader';
import { PublicFooter } from '@/components/navigation/PublicFooter';

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const session = await getServerSession({
    getAll: () => cookieStore.getAll(),
  });

  return (
    <div className="flex flex-col min-h-screen">
      {/* Responsive Header Navigation with Server-Fed Auth State */}
      <PublicHeader user={session?.user || null} />

      {/* Main Content */}
      <main id="main-content" className="flex-1">
        {children}
      </main>

      {/* Dynamic Responsive Footer */}
      <PublicFooter />
    </div>
  );
}
