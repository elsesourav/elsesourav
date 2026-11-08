import { SearchButton } from '@/components/search/SearchButton';
import { ThemePopup } from '@/components/theme/ThemePopup';
import { SiteService } from '@elsesourav/database';
import { UserSidebar } from '@/features/user/components/UserSidebar';
import { getServerSession } from '@elsesourav/auth';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { BrandLogo } from '@/components/brand/BrandLogo';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import * as React from 'react';

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default async function UserLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const siteService = new SiteService();
  const [session, identity] = await Promise.all([
    getServerSession({
      getAll: () => cookieStore.getAll(),
    }),
    siteService.getSiteAndCreatorIdentity().catch(() => null),
  ]);

  if (!session?.user) {
    redirect('/login?next=/account');
  }

  return (
    <div className="min-h-screen lg:h-screen flex flex-col bg-background text-foreground transition-colors overflow-x-clip lg:overflow-hidden relative">
      {/* Dynamic Ambient Background Elements */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-gradient-to-b from-primary/10 via-primary/5 to-transparent blur-3xl opacity-70 dark:opacity-40" />
      </div>

      {/* Streamlined Authenticated Global Header: Matches PublicHeader dimensions exactly */}
      <header className="border-b border-border/80 bg-background/80 backdrop-blur-xl sticky top-0 z-50 transition-colors w-full shrink-0">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 h-16 flex items-center justify-between gap-1.5 sm:gap-2.5 lg:gap-4">
          {/* Brand Name Logo */}
          <div className="flex items-center gap-2 sm:gap-6 shrink-0">
            <Link
              href="/"
              className="flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg p-0.5 sm:p-1 shrink-0"
              aria-label={`${identity?.site.name || 'ElseSourav'} Home`}
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
          </div>

          {/* Search Input Box: prominent and matching PublicHeader design */}
          <div className="flex-1 max-w-[240px] xs:max-w-[280px] sm:max-w-sm md:max-w-xs lg:max-w-sm mx-1 sm:mx-2 min-w-0">
            <SearchButton />
          </div>

          {/* Utility Cluster: Theme Switcher on far right */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <ThemePopup />
          </div>
        </div>
      </header>

      {/* Main Authenticated Layout: Fixed Shell on Desktop with Independent Scroll View for Content */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-2 sm:px-4 md:px-6 lg:px-8 py-2 sm:py-3.5 md:py-5 lg:py-6 flex flex-col lg:flex-row items-start gap-2 sm:gap-3.5 md:gap-5 lg:gap-6 lg:h-[calc(100dvh-4rem)] lg:overflow-hidden">
        <UserSidebar />
        <main
          id="main-content"
          className="flex-1 min-w-0 w-full lg:h-full lg:overflow-y-auto lg:pr-1"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
