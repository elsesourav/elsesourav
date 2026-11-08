import Link from 'next/link';
import { SITE_CONFIG, ROUTES } from '@elsesourav/config';
import { BrandLogo } from '@/components/brand/BrandLogo';
import { AmbientBackground } from '@elsesourav/ui';
import { SiteService } from '@elsesourav/database';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const siteService = new SiteService();
  const identity = await siteService.getSiteAndCreatorIdentity().catch(() => null);
  const siteName = identity?.site.name || SITE_CONFIG.name;

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[hsl(var(--background))] text-[hsl(var(--foreground))] relative overflow-x-hidden">
      <AmbientBackground variant="minimal" />

      {/* Top Header with Brand Name Logo */}
      <header className="p-6 flex items-center justify-between relative z-10">
        <Link
          href={ROUTES.HOME}
          className="flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] rounded-lg p-1"
          aria-label={`${siteName} Home`}
        >
          <BrandLogo
            variant="color"
            size="md"
            priority
            name={identity?.site.name}
            logoUrl={identity?.site.logoUrl}
            brandLogoUrl={identity?.site.brandLogoUrl}
          />
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
