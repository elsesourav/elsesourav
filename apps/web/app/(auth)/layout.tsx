import * as React from 'react';
import Link from 'next/link';
import { SITE_CONFIG, ROUTES } from '@elsesourav/config';
import { Sparkles } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-zinc-950 text-white">
      <header className="p-6 flex items-center justify-between">
        <Link href={ROUTES.HOME} className="flex items-center gap-2 font-bold text-lg text-white">
          <Sparkles className="w-5 h-5 text-indigo-400" />
          <span>{SITE_CONFIG.name}</span>
        </Link>
      </header>
      <main className="flex-1 flex items-center justify-center p-4">{children}</main>
      <footer className="p-6 text-center text-xs text-zinc-500">
        Protected by Supabase Authentication & ElseSourav Identity Protocol.
      </footer>
    </div>
  );
}
