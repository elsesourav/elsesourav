import * as React from 'react';
import { cookies } from 'next/headers';
import { getServerSession } from '@elsesourav/auth';
import { PageAtmosphere } from '@/components/ambient/PageAtmosphere';
import { PublicHeader } from '@/components/navigation/PublicHeader';
import { PublicFooter } from '@/components/navigation/PublicFooter';
import { MobileBottomNav } from '@/components/navigation/MobileBottomNav';
import { SiteService } from '@elsesourav/database';

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const siteService = new SiteService();
  const [session, identity] = await Promise.all([
    getServerSession({
      getAll: () => cookieStore.getAll(),
    }),
    siteService.getSiteAndCreatorIdentity().catch(() => null),
  ]);

  return (
    <div className="flex flex-col min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))] relative">
      <PageAtmosphere />

      {/* Responsive Header Navigation with Server-Fed Auth State & Brand Identity */}
      <PublicHeader
        user={session?.user || null}
        siteName={identity?.site.name}
        logoUrl={identity?.site.logoUrl}
        brandLogoUrl={identity?.site.brandLogoUrl}
      />

      {/* Main Content */}
      <main id="main-content" className="flex-1">
        {children}
      </main>

      {/* Dynamic Responsive Footer */}
      <PublicFooter />

      {/* Reciprocal Mobile Bottom Navigation (Apps, Updates, About, Account) */}
      <MobileBottomNav user={session?.user || null} />
    </div>
  );
}
