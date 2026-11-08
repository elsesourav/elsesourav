import * as React from 'react';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getServerSession } from '@elsesourav/auth';
import { ROUTES } from '@elsesourav/config';
import { Button } from '@elsesourav/ui';
import { AdminSidebar } from '@/features/admin/components/AdminSidebar';
import { AdminMobileNav } from '@/features/admin/components/AdminMobileNav';
import { Lock } from 'lucide-react';
import type { Metadata } from 'next';
import type { AdminContext } from '@elsesourav/types';

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const session = await getServerSession({
    getAll: () => cookieStore.getAll(),
  });

  if (!session?.user) {
    redirect('/login?next=/admin');
  }

  // Strict Server-Side Role Gate
  if (session.user.role !== 'ADMIN' && session.user.role !== 'STAFF') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white px-4">
        <div className="max-w-md w-full text-center space-y-4 p-8 rounded-3xl border border-rose-900/40 bg-zinc-900/60 backdrop-blur-xl shadow-2xl">
          <div className="w-12 h-12 rounded-2xl bg-rose-950/60 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-400">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-zinc-100">403 — Access Denied</h1>
          <p className="text-xs text-zinc-400 leading-relaxed">
            You do not have administrative privileges to access the ElseSourav Control Portal.
          </p>
          <div className="pt-3 flex justify-center gap-3">
            <Link href={ROUTES.HOME}>
              <Button variant="outline" size="sm" className="border-zinc-800 text-zinc-300 text-xs">
                Return Home
              </Button>
            </Link>
            <Link href={ROUTES.SETTINGS}>
              <Button size="sm" className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs">
                Account Settings
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const adminContext: AdminContext = {
    id: session.user.id,
    email: session.user.email,
    role: session.user.role,
    displayName: session.user.displayName || 'Admin Staff',
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-zinc-950 text-zinc-100">
      {/* Mobile Top Navigation */}
      <AdminMobileNav context={adminContext} />

      {/* Desktop Sidebar Navigation */}
      <AdminSidebar context={adminContext} />

      {/* Main Admin Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <main id="main-content" className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
