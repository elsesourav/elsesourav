import * as React from 'react';
import Link from 'next/link';
import { Button, Badge } from '@elsesourav/ui';
import { SITE_CONFIG, ROUTES } from '@elsesourav/config';
import { Sparkles } from 'lucide-react';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header Navigation */}
      <header className="border-b border-zinc-800/80 bg-zinc-950/60 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href={ROUTES.HOME} className="flex items-center gap-2 font-bold text-lg text-white">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <span>{SITE_CONFIG.name}</span>
            <Badge variant="outline" className="text-[10px] ml-1">v2.0</Badge>
          </Link>
          <nav className="flex items-center gap-6 text-sm text-zinc-300">
            <Link href={ROUTES.APPS} className="hover:text-white transition-colors">Apps</Link>
            <Link href={ROUTES.BLOG} className="hover:text-white transition-colors">Blog</Link>
            <Link href={ROUTES.HELP} className="hover:text-white transition-colors">Help</Link>
            <Link href={ROUTES.SUPPORT} className="hover:text-white transition-colors">Support</Link>
            <Link href={ROUTES.ABOUT} className="hover:text-white transition-colors">About</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href={ROUTES.LOGIN}>
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link href={ROUTES.SIGNUP}>
              <Button variant="primary" size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t border-zinc-800/80 bg-zinc-950 py-8 text-center text-sm text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} {SITE_CONFIG.name}. All rights reserved.</p>
          <div className="flex items-center gap-6 text-xs">
            <Link href={ROUTES.PRIVACY} className="hover:text-zinc-300">Privacy</Link>
            <Link href={ROUTES.TERMS} className="hover:text-zinc-300">Terms</Link>
            <Link href={ROUTES.ACCESSIBILITY} className="hover:text-zinc-300">Accessibility</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
