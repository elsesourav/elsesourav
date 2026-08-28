import * as React from 'react';
import Link from 'next/link';
import { SITE_CONFIG, ROUTES } from '@elsesourav/config';
import { Sparkles, Bookmark, Settings, LogOut } from 'lucide-react';

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-white">
      <header className="border-b border-zinc-800/80 bg-zinc-950/60 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href={ROUTES.HOME} className="flex items-center gap-2 font-bold text-lg text-white">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <span>{SITE_CONFIG.name}</span>
          </Link>
          <nav className="flex items-center gap-6 text-sm text-zinc-300">
            <Link href={ROUTES.LIBRARY} className="flex items-center gap-1.5 hover:text-white transition-colors">
              <Bookmark className="w-4 h-4 text-indigo-400" /> Library
            </Link>
            <Link href={ROUTES.SETTINGS} className="flex items-center gap-1.5 hover:text-white transition-colors">
              <Settings className="w-4 h-4 text-zinc-400" /> Settings
            </Link>
            <Link href={ROUTES.HOME} className="flex items-center gap-1.5 hover:text-red-400 transition-colors text-zinc-400">
              <LogOut className="w-4 h-4" /> Sign Out
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
