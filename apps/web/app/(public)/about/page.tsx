import { SiteService } from '@elsesourav/database';
import { PageShell } from '@elsesourav/ui';
import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo-metadata';
import { discoverPublishedApps } from '@/features/apps/queries/get-apps';
import { getPublicBlogListing } from '@/features/blog/queries/get-blog';
import { AboutHeroSection } from '@/features/about/components/AboutHeroSection';
import { AboutMotivationSection } from '@/features/about/components/AboutMotivationSection';
import { AboutJourneySection } from '@/features/about/components/AboutJourneySection';
import { CapabilityMap } from '@/features/about/components/CapabilityMap';
import { AboutPrinciplesSection } from '@/features/about/components/AboutPrinciplesSection';
import { AboutFocusNowSection } from '@/features/about/components/AboutFocusNowSection';
import { AboutContactChannelsSection } from '@/features/about/components/AboutContactChannelsSection';

export const metadata: Metadata = buildPageMetadata({
  title: 'About Sourav Barui — Independent Software Creator',
  description:
    'About Sourav Barui, an independent software creator building software, tools, games, and experiments across web architecture, AI, graphics, and systems.',
  path: '/about',
  type: 'profile',
});

export const dynamic = 'force-dynamic';

export default async function AboutPage() {
  const siteService = new SiteService();

  const [identity, appsResult, blogResult] = await Promise.all([
    siteService.getSiteAndCreatorIdentity(),
    discoverPublishedApps({ limit: 2, sort: 'popularity' }).catch(() => ({ items: [] })),
    getPublicBlogListing({ limit: 1 }).catch(() => ({ items: [] })),
  ]);

  const activeApp = appsResult.items?.[0] || null;
  const secondaryApp = appsResult.items?.[1] || null;
  const activePost = blogResult.items?.[0] || null;

  const activeLinks = identity.creator.links.filter((l) => l.isActive);
  const activeContacts = identity.creator.contacts.filter((c) => c.isActive);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: `About ${identity.creator.fullName || identity.creator.name} — ${identity.site.name}`,
    description: identity.site.description,
    url: `${identity.site.url}/about`,
    mainEntity: {
      '@type': 'Person',
      name: identity.creator.fullName || identity.creator.name,
      jobTitle: identity.creator.title,
      image: identity.creator.avatarUrl || undefined,
      url: `${identity.site.url}/about`,
      sameAs: activeLinks.map((l) => l.url),
    },
  };

  return (
    <PageShell size="lg" glow containerClassName="px-3 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="space-y-4 sm:space-y-6 md:space-y-8 lg:space-y-10 max-w-6xl mx-auto">
        {/* 1. Creator Profile & Hero Showcase */}
        <AboutHeroSection creator={identity.creator} site={identity.site} />

        {/* 2. Core Motivation: Understanding Ideas by Building Them */}
        <AboutMotivationSection />

        {/* 3. Project Journey & Technical Evolution */}
        <AboutJourneySection />

        {/* 4. Professional Capability Map & Working Evidence */}
        <CapabilityMap />

        {/* 5. Guiding Building Principles */}
        <AboutPrinciplesSection principles={identity.creator.principles} />

        {/* 6. Studio Focus // Now */}
        <AboutFocusNowSection
          activeApp={activeApp}
          secondaryApp={secondaryApp}
          activePost={activePost}
          focusTopics={identity.creator.focus}
        />

        {/* 7. Platform Channels & Direct Contact */}
        <AboutContactChannelsSection links={activeLinks} contacts={activeContacts} />
      </div>
    </PageShell>
  );
}
