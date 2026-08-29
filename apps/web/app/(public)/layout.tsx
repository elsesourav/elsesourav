import * as React from 'react';
import Link from 'next/link';
import { SITE_CONFIG, ROUTES } from '@elsesourav/config';
import { PublicHeader } from '@/components/navigation/PublicHeader';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Responsive Header Navigation */}
      <PublicHeader />

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Responsive Footer */}
      <footer className="border-t border-zinc-800/80 bg-zinc-950 py-8 text-center text-sm text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} {SITE_CONFIG.name}. All rights reserved.</p>
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-zinc-400">
            <Link href={ROUTES.PRIVACY} className="hover:text-zinc-200 transition-colors">Privacy</Link>
            <Link href={ROUTES.TERMS} className="hover:text-zinc-200 transition-colors">Terms</Link>
            <Link href={ROUTES.ACCESSIBILITY} className="hover:text-zinc-200 transition-colors">Accessibility</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
