import Link from 'next/link';
import Image from 'next/image';
import { SITE_CONFIG, ROUTES } from '@elsesourav/config';
import { AmbientBackground } from '@elsesourav/ui';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-[hsl(var(--background))] text-[hsl(var(--foreground))] relative overflow-x-hidden">
      <AmbientBackground variant="minimal" />

      {/* Top Header with Brand Emblem */}
      <header className="p-6 flex items-center justify-between relative z-10">
        <Link
          href={ROUTES.HOME}
          className="flex items-center gap-2.5 font-bold text-base sm:text-lg text-[hsl(var(--foreground))] group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] rounded-lg p-1"
        >
          <div className="w-8 h-8 rounded-xl overflow-hidden flex items-center justify-center group-hover:scale-105 transition-transform duration-200 shadow-md">
            <Image
              src="/logo-sm.png"
              alt={`${SITE_CONFIG.name} Logo`}
              width={32}
              height={32}
              className="w-full h-full object-contain"
              priority
            />
          </div>
          <span className="tracking-tight">{SITE_CONFIG.name}</span>
        </Link>
      </header>

      {/* Main Card Content with Ambient Glow Backdrop */}
      <main id="main-content" className="flex-1 flex items-center justify-center p-4 relative z-10">
        <div className="relative w-full max-w-md">
          {/* Ambient luminous glow aura */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -inset-4 sm:-inset-6 bg-gradient-to-tr from-indigo-600/25 via-purple-600/20 to-cyan-500/20 blur-3xl rounded-3xl -z-10 opacity-70 animate-pulse-slow"
          />
          {children}
        </div>
      </main>

      {/* Footer Disclaimer */}
      <footer className="p-6 text-center text-xs text-zinc-500 relative z-10">
        Protected by Supabase Authentication & ElseSourav Identity Protocol.
      </footer>
    </div>
  );
}
