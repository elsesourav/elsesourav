import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { getServerSession } from '@elsesourav/auth';
import type { SiteLinkItem } from '@elsesourav/types';
import { AmbientBackground } from '@elsesourav/ui';
import { SITE_CONFIG } from '@elsesourav/config';
import { SiteService } from '@elsesourav/database';
import { discoverPublishedApps } from '@/features/apps/queries/get-apps';
import { getPublicBlogListing } from '@/features/blog/queries/get-blog';
import { PublicHeader } from '@/components/navigation/PublicHeader';
import { PublicFooter } from '@/components/navigation/PublicFooter';
import { Megaphone } from 'lucide-react';
import { buildPageMetadata } from '@/lib/seo-metadata';

// Modular Home Page Sections matching original design & layout
import { HomeHero } from '@/features/home/components/HomeHero';
import { SelectedAppsSection } from '@/features/home/components/SelectedAppsSection';
import { FieldNotesSection } from '@/features/home/components/FieldNotesSection';
import { PhilosophySection } from '@/features/home/components/PhilosophySection';
import { StudioDoorwaySection } from '@/features/home/components/StudioDoorwaySection';

export const metadata: Metadata = buildPageMetadata({
  title: `${SITE_CONFIG.name} — Personal Software Studio & Digital Archive`,
  description:
    'Building software, tools, games, and experiments that solve real problems and spark new ideas.',
  path: '/',
});

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const cookieStore = await cookies();
  const siteService = new SiteService();

  // Curated data queries: published apps, recent updates, site/creator identity, session
  const [appsResult, blogResult, identity, session] = await Promise.all([
    discoverPublishedApps({ limit: 6, sort: 'sortOrder' }).catch(() => ({
      items: [],
      totalCount: 0,
    })),
    getPublicBlogListing({ limit: 3 }).catch(() => ({
      items: [],
      totalCount: 0,
      page: 1,
      totalPages: 1,
    })),
    siteService.getSiteAndCreatorIdentity(),
    getServerSession({
      getAll: () => cookieStore.getAll(),
    }),
  ]);

  const featuredApps = appsResult.items || [];
  const recentPosts = blogResult.items || [];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${identity.site.url}/#organization`,
        name: identity.site.name,
        url: identity.site.url,
        description: identity.site.description,
        logo: identity.site.logoUrl,
        sameAs: identity.creator.links.map((l: SiteLinkItem) => l.url),
      },
      {
        '@type': 'Person',
        '@id': `${identity.site.url}/#creator`,
        name: identity.creator.name,
        jobTitle: identity.creator.title,
        image: identity.creator.avatarUrl,
        url: `${identity.site.url}/about`,
        sameAs: identity.creator.links.map((l: SiteLinkItem) => l.url),
      },
      {
        '@type': 'WebSite',
        '@id': `${identity.site.url}/#website`,
        url: identity.site.url,
        name: identity.site.name,
        description: identity.site.description,
        publisher: {
          '@id': `${identity.site.url}/#organization`,
        },
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${identity.site.url}/apps?q={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      },
    ],
  };

  return (
    <div className="flex flex-col min-h-screen text-[hsl(var(--foreground))] selection:bg-indigo-500/30 relative font-sans w-full max-w-[100vw]">
      <AmbientBackground variant="home" />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Optional Dynamic Announcement Banner */}
      {identity.homepage.announcementBanner && (
        <div className="bg-indigo-500/10 border-b border-indigo-500/20 px-4 py-2 text-center text-xs text-indigo-700 dark:text-indigo-200 flex items-center justify-center gap-2 font-medium">
          <Megaphone className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
          <span>{identity.homepage.announcementBanner}</span>
        </div>
      )}

      {/* Responsive Header Navigation: Apps, Updates, About, Search, Auth */}
      <PublicHeader user={session?.user || null} />

      {/* Main Content Landmark */}
      <main id="main-content" className="flex-1 relative z-10 -mt-16">
        {/* 1. Hero Section: Floating Rock Scene + Original Identity Headline & Metrics */}
        <HomeHero
          creatorName={identity.creator.name}
          heroHeadline={identity.homepage.heroHeadline}
          heroSubtitle={identity.homepage.heroSubtitle}
          heroBadge={identity.homepage.heroBadge}
          primaryCtaLabel={identity.homepage.primaryCtaLabel}
          secondaryCtaLabel={identity.homepage.secondaryCtaLabel}
          totalAppsCount={appsResult.totalCount}
        />

        {/* 2. Selected Apps: Lead Featured Project + 2x2 Grid using original AppCard */}
        <SelectedAppsSection
          apps={featuredApps}
          totalCount={appsResult.totalCount}
          title={identity.homepage.appsTitle}
          subtitle={identity.homepage.appsSubtitle}
        />

        {/* 3. Latest Updates: Lead Editorial Essay + Supporting Index Stream */}
        <FieldNotesSection
          posts={recentPosts}
          totalCount={blogResult.totalCount}
          title={identity.homepage.blogTitle}
          subtitle={identity.homepage.blogSubtitle}
        />

        {/* 4. Creator Context & Guiding Philosophy */}
        <PhilosophySection creator={identity.creator} />

        {/* 5. Closing Invitation & Studio Pathways */}
        <StudioDoorwaySection
          closingTitle={identity.homepage.closingCtaTitle}
          closingSubtitle={identity.homepage.closingCtaSubtitle}
        />
      </main>

      {/* Dynamic Responsive Footer */}
      <PublicFooter />
    </div>
  );
}
