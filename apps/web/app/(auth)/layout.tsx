import { SITE_CONFIG } from '@elsesourav/config';
import { BrandLogo } from '@/components/brand/BrandLogo';
import { ThemePopup } from '@/components/theme/ThemePopup';
import { AmbientBackground } from '@elsesourav/ui';
import { SiteService } from '@elsesourav/database';
import { ArrowLeft } from 'lucide-react';
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
    <div className="min-h-screen flex flex-col justify-between bg-[hsl(var(--background))] text-[hsl(var(--foreground))] relative overflow-x-hidden selection:bg-indigo-500/30">
      <AmbientBackground variant="minimal" />

      {/* Top Header with Brand Name Logo & Utility Controls (Higher stacking context than main card) */}
      <header className="px-3.5 xs:px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex items-center justify-between relative z-50">
        <a
          href="https://elsesourav.com"
          className="flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-lg p-0.5 sm:p-1"
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
        </a>

        {/* Right-Side Utility Actions: Back to Home & Theme Toggle */}
        <div className="flex items-center gap-2 sm:gap-3">
          <a
            href="https://elsesourav.com"
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-zinc-300 hover:text-slate-950 dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            aria-label="Back to main website"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Public Site</span>
          </a>

          <ThemePopup />
        </div>
      </header>

      {/* Main Card Content with Ambient Glow Backdrop */}
      <main id="main-content" className="flex-1 flex items-center justify-center px-3 sm:px-4 py-4 sm:py-6 relative z-10">
        <div className="relative w-full max-w-[420px] sm:max-w-md mx-auto">
          {/* Ambient luminous glow aura */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -inset-3 sm:-inset-6 bg-gradient-to-tr from-indigo-500/20 via-purple-500/15 to-cyan-500/15 dark:from-indigo-600/25 dark:via-purple-600/20 dark:to-cyan-500/20 blur-2xl sm:blur-3xl rounded-3xl -z-10 opacity-70 animate-pulse-slow"
          />
          {children}
        </div>
      </main>

      {/* Footer Disclaimer */}
      <footer className="py-3 px-4 sm:py-4 text-center text-[11px] sm:text-xs text-slate-500 dark:text-zinc-500 relative z-10 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))]">
        Protected by Supabase Authentication & ElseSourav Identity Protocol.
      </footer>
    </div>
  );
}
