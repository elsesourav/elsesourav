import { Metadata } from 'next';
import Link from 'next/link';
import {
  discoverPublishedApps,
  getActiveCategories,
  getActiveTags,
} from '@/features/apps/queries/get-apps';
import { AppCard } from '@/features/apps/components/AppCard';
import { AppDiscoveryBar } from '@/features/apps/components/AppDiscoveryBar';
import { AppPagination } from '@/features/apps/components/AppPagination';
import { AppsEmptyState } from '@/features/apps/components/AppsEmptyState';
import { PageShell, PageHeader, Badge, Reveal, RevealGroup } from '@elsesourav/ui';
import { SITE_CONFIG } from '@elsesourav/config';
import type { AppSortOption, AppPlatform } from '@elsesourav/types';
import { Sparkles, Beaker, ArrowRight, Layers, LayoutGrid } from 'lucide-react';

interface AppsPageProps {
  searchParams: Promise<{
    q?: string;
    search?: string;
    category?: string;
    tag?: string;
    platform?: string;
    sort?: string;
    page?: string;
  }>;
}

export async function generateMetadata({ searchParams }: AppsPageProps): Promise<Metadata> {
  const params = await searchParams;
  const query = (params.q || params.search || '').trim();
  const category = params.category;
  const platform = params.platform;
  const hasFilterOrQuery = Boolean(query || category || platform || params.tag || params.page);

  const title = query
    ? `Search: "${query}" in Work & Software`
    : category
      ? `${category.charAt(0).toUpperCase() + category.slice(1)} — Work`
      : platform
        ? `${platform.toUpperCase()} Software & Tools`
        : 'Work — Software, Systems & Tools';

  const description =
    "Software, creative tools, web utilities, and interactive systems built, shipped, and explored by Sourav Barui.";
  const canonicalUrl = `${SITE_CONFIG.url}/apps`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    robots: hasFilterOrQuery
      ? {
          index: false,
          follow: true,
        }
      : {
          index: true,
          follow: true,
        },
    openGraph: {
      title: `${title} | ${SITE_CONFIG.name}`,
      description,
      url: canonicalUrl,
      siteName: SITE_CONFIG.name,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | ${SITE_CONFIG.name}`,
      description,
    },
  };
}

export default async function AppsPage({ searchParams }: AppsPageProps) {
  const params = await searchParams;
  const query = (params.q || params.search || '').trim();
  const categorySlug = params.category || undefined;
  const tagSlug = params.tag || undefined;
  const platform = (params.platform as AppPlatform) || undefined;
  const page = parseInt(params.page || '1', 10) || 1;
  const sort = (params.sort as AppSortOption) || 'sortOrder';

  // Parallel server fetching
  const [categories, tags, searchResult] = await Promise.all([
    getActiveCategories(),
    getActiveTags(),
    discoverPublishedApps({
      query: query || undefined,
      filters: {
        categorySlug,
        tagSlug,
        platform,
      },
      sort,
      page,
      limit: 12,
    }),
  ]);

  const hasFilters = Boolean(
    categorySlug || tagSlug || platform || query || (params.sort && params.sort !== 'sortOrder')
  );

  const isDefaultView = !hasFilters && page === 1;

  // Curated spotlight split for default view
  const spotlightItems = isDefaultView
    ? searchResult.items.filter((item) => item.isFeatured).slice(0, 2)
    : [];
  const catalogItems = isDefaultView
    ? searchResult.items.filter((item) => !spotlightItems.some((s) => s.id === item.id))
    : searchResult.items;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${SITE_CONFIG.url}/apps/#collection`,
        name: 'Work & Software Portfolio',
        description: 'Explore the complete collection of software, web applications, and developer utilities.',
        url: `${SITE_CONFIG.url}/apps`,
        publisher: {
          '@type': 'Person',
          name: 'Sourav Barui',
          url: `${SITE_CONFIG.url}/about`,
        },
        mainEntity: {
          '@type': 'ItemList',
          itemListElement: searchResult.items.map((app, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: app.name,
            url: `${SITE_CONFIG.url}/apps/${app.slug}`,
          })),
        },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${SITE_CONFIG.url}/apps/#breadcrumb`,
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: SITE_CONFIG.url,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Work',
            item: `${SITE_CONFIG.url}/apps`,
          },
        ],
      },
    ],
  };

  return (
    <PageShell size="lg" glow>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="space-y-12">
        {/* Page Header */}
        <Reveal direction="down" distance={12}>
          <PageHeader
            eyebrow="Portfolio & Systems"
            badge={
              <Badge variant="primary" className="text-xs px-2.5 py-0.5 font-medium font-mono">
                {searchResult.totalCount} {searchResult.totalCount === 1 ? 'Project' : 'Projects'}
              </Badge>
            }
            title="Work"
            description="Software, creative tools, web utilities, and interactive systems I've built and shipped."
          />
        </Reveal>

        {/* Discovery, Search, Category & Platform Controls */}
        <Reveal direction="up" distance={10}>
          <AppDiscoveryBar categories={categories} tags={tags} />
        </Reveal>

        {/* Applications Catalog Grid or Empty State */}
        {searchResult.items.length === 0 ? (
          <Reveal direction="up" distance={12}>
            <AppsEmptyState hasFilters={hasFilters} />
          </Reveal>
        ) : (
          <div className="space-y-12">
            {/* Spotlight Section on Clean Default View */}
            {isDefaultView && spotlightItems.length > 0 && (
              <section aria-labelledby="spotlight-work-heading" className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 uppercase tracking-wider font-semibold pb-2 border-b border-zinc-800/60">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <h2 id="spotlight-work-heading" className="text-xs font-mono text-zinc-400 uppercase tracking-wider font-semibold">
                    Featured Spotlight
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {spotlightItems.map((app, idx) => (
                    <AppCard key={app.id} app={app} index={idx} featured />
                  ))}
                </div>
              </section>
            )}

            {/* Catalog Grid */}
            <section aria-labelledby="catalog-work-heading" className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800/60 text-xs font-mono text-zinc-400">
                <div className="flex items-center gap-2 uppercase tracking-wider font-semibold">
                  <LayoutGrid className="w-4 h-4 text-indigo-400" />
                  <h2 id="catalog-work-heading" className="text-xs font-mono text-zinc-400 uppercase tracking-wider font-semibold">
                    {hasFilters ? `Filtered Projects (${searchResult.totalCount})` : 'All Software & Projects'}
                  </h2>
                </div>
                <span className="text-zinc-500">
                  Page {searchResult.page} of {searchResult.totalPages}
                </span>
              </div>

              <RevealGroup staggerDelay={0.04} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {catalogItems.map((app, idx) => (
                  <AppCard
                    key={app.id}
                    app={app}
                    index={(searchResult.page - 1) * 12 + idx + (isDefaultView ? spotlightItems.length : 0)}
                  />
                ))}
              </RevealGroup>
            </section>

            {/* Pagination Controls */}
            {searchResult.totalPages > 1 && (
              <Reveal direction="up" distance={10}>
                <AppPagination
                  currentPage={searchResult.page}
                  totalPages={searchResult.totalPages}
                  totalMatches={searchResult.totalCount}
                />
              </Reveal>
            )}
          </div>
        )}

        {/* Discovery Bridges: Lab & Archive */}
        <Reveal direction="up" distance={14}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-10 border-t border-zinc-800/70">
            {/* Lab Callout */}
            <Link
              href="/apps?category=simulations"
              className="group p-6 rounded-3xl border border-zinc-800/80 bg-zinc-900/30 hover:bg-zinc-900/60 hover:border-purple-500/40 transition-all flex flex-col justify-between focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
            >
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-2xl bg-purple-950/60 border border-purple-800/40 flex items-center justify-center text-purple-400">
                  <Beaker className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-zinc-100 group-hover:text-purple-300 transition-colors">
                  The Lab & Experiments
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Small interactive prototypes, algorithms, sandbox physics, and canvas graphics simulations.
                </p>
              </div>
              <span className="text-xs font-mono text-purple-400 flex items-center gap-1 pt-4 group-hover:translate-x-1 transition-transform">
                <span>Explore Lab prototypes</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Link>

            {/* Notes / Architecture Callout */}
            <Link
              href="/blog"
              className="group p-6 rounded-3xl border border-zinc-800/80 bg-zinc-900/30 hover:bg-zinc-900/60 hover:border-indigo-500/40 transition-all flex flex-col justify-between focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-2xl bg-indigo-950/60 border border-indigo-800/40 flex items-center justify-center text-indigo-400">
                  <Layers className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-zinc-100 group-hover:text-indigo-300 transition-colors">
                  Engineering Notes & Field Logs
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Technical write-ups, architecture decisions, postmortems, and lessons learned while building.
                </p>
              </div>
              <span className="text-xs font-mono text-indigo-400 flex items-center gap-1 pt-4 group-hover:translate-x-1 transition-transform">
                <span>Read engineering notes</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Link>
          </div>
        </Reveal>
      </div>
    </PageShell>
  );
}
