import * as React from 'react';
import Link from 'next/link';
import { SITE_CONFIG, ROUTES } from '@elsesourav/config';
import { Badge } from '@elsesourav/ui';
import { Shield, Package, FileText, LifeBuoy, Activity, ArrowLeft } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex bg-zinc-950 text-white">
      {/* Admin Sidebar */}
      <aside className="w-64 border-r border-zinc-800/80 bg-zinc-950 p-6 flex flex-col justify-between hidden md:flex">
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-400" />
            <span className="font-bold text-base">{SITE_CONFIG.name}</span>
            <Badge variant="warning" className="text-[10px]">Admin</Badge>
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
