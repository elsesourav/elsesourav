import * as React from 'react';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SITE_CONFIG, ROUTES } from '@elsesourav/config';
import { Badge, Button } from '@elsesourav/ui';
import { getServerSession } from '@elsesourav/auth';
import { Shield, Package, FileText, LifeBuoy, Activity, ArrowLeft, Lock } from 'lucide-react';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const session = await getServerSession({
    getAll: () => cookieStore.getAll(),
  });

  if (!session) {
    redirect('/login?next=/admin');
  }

  // Strict Server-Side Role Gate
  if (session.user.role !== 'ADMIN' && session.user.role !== 'STAFF') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white px-4">
        <div className="max-w-md w-full text-center space-y-4 p-8 rounded-2xl border border-red-900/40 bg-zinc-900/60 backdrop-blur-xl">
          <div className="w-12 h-12 rounded-full bg-red-950/60 border border-red-500/30 flex items-center justify-center mx-auto text-red-400">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-zinc-100">403 — Access Denied</h1>
          <p className="text-sm text-zinc-400">
            You do not have administrative permissions to view or manage the ElseSourav Control Portal.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <Link href={ROUTES.HOME}>
              <Button variant="outline" className="border-zinc-800 text-zinc-300">
                Return Home
              </Button>
            </Link>
            <Link href={ROUTES.SETTINGS}>
              <Button className="bg-indigo-600 hover:bg-indigo-500 text-white">
                Account Settings
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-zinc-950 text-white">
      {/* Admin Sidebar */}
      <aside className="w-64 border-r border-zinc-800/80 bg-zinc-950 p-6 flex flex-col justify-between hidden md:flex">
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-400" />
            <span className="font-bold text-base">{SITE_CONFIG.name}</span>
            <Badge variant="warning" className="text-[10px]">
              {session.user.role}
            </Badge>
          </div>

          <nav className="space-y-1 text-sm">
            <Link
              href={ROUTES.ADMIN.ROOT}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-zinc-900 text-white font-medium"
            >
              <Activity className="w-4 h-4 text-indigo-400" /> Dashboard
            </Link>
            <Link
              href={ROUTES.ADMIN.APPS}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900/60 transition-colors"
            >
              <Package className="w-4 h-4" /> Applications
            </Link>
            <Link
              href={ROUTES.ADMIN.BLOG}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900/60 transition-colors"
            >
              <FileText className="w-4 h-4" /> Devlogs
            </Link>
            <Link
              href={ROUTES.ADMIN.SUPPORT}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900/60 transition-colors"
            >
              <LifeBuoy className="w-4 h-4" /> Support Queue
            </Link>
          </nav>
        </div>

        <div className="pt-6 border-t border-zinc-800">
          <Link
            href={ROUTES.HOME}
            className="flex items-center gap-2 text-xs text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Public Site
          </Link>
        </div>
      </aside>

      {/* Main Admin Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
