import {
  AppDiscoveryBar,
  AppPagination,
  AppsEmptyState,
} from '@/features/apps/components/discovery';
import { AppCuratedShelves, AppEditorialGrid } from '@/features/apps/components/editorial';
import { AppsMorphHeroLoader } from '@/features/apps/components/morph-hero';
import {
  discoverPublishedApps,
  getActiveCategories,
  getActiveTags,
  getPublishedApps,
} from '@/features/apps/queries/get-apps';
import { buildPageMetadata } from '@/lib/seo-metadata';
import { SITE_CONFIG, ROUTES } from '@elsesourav/config';
import type { AppPlatform, AppSortOption } from '@elsesourav/types';
import { PageShell, Reveal } from '@elsesourav/ui';
import { Archive, ArrowRight, BookOpen, LayoutGrid } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';

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
    ? `Search: "${query}" in Apps`
    : category
      ? `${category.charAt(0).toUpperCase() + category.slice(1)} — Apps`
      : platform
        ? `${platform.toUpperCase()} Software & Tools`
        : 'Apps — Software, Tools & Systems';

  const description =
    'Software applications, developer tools, games, and interactive systems built, shipped, and maintained by Sourav Barui.';

  return buildPageMetadata({
    title,
    description,
    path: '/apps',
    noIndex: hasFilterOrQuery,
  });
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
  const [categories, tags, searchResult, allPublishedApps] = await Promise.all([
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
    getPublishedApps({ limit: 50 }),
  ]);

  const hasFilters = Boolean(
    categorySlug || tagSlug || platform || query || (params.sort && params.sort !== 'sortOrder')
  );

  const isDefaultView = !hasFilters && page === 1;

  // Curated hero slider items for default view (featured + pinned, up to 5)
  const heroSliderItems = isDefaultView
    ? searchResult.items.filter((item) => item.isFeatured || item.isPinned).slice(0, 5)
    : [];
  const catalogItems = isDefaultView
    ? searchResult.items.filter((item) => !heroSliderItems.some((s) => s.id === item.id))
    : searchResult.items;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${SITE_CONFIG.url}/apps/#collection`,
        name: 'Apps & Software Catalog',
        description:
          'Explore the complete collection of software, web applications, and developer utilities.',
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
            name: 'Apps',
            item: `${SITE_CONFIG.url}/apps`,
          },
        ],
      },
    ],
  };

  return (
    <PageShell size="lg" glow className="!pt-2.5 sm:!pt-5 pb-24 sm:pb-16 px-0">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="w-full max-w-full min-w-0 overflow-visible space-y-4 sm:space-y-6">
        {/* 1. Very Top: Compact Apps Title & Subtitle */}
        <Reveal direction="down" distance={8}>
          <div className="flex flex-col gap-0.5 sm:gap-1 pb-0.5 sm:pb-1">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-[hsl(var(--foreground))] font-display">
              {hasFilters ? 'Filtered Projects' : 'Apps'}
            </h1>
            <p className="text-xs sm:text-sm text-[hsl(var(--muted-foreground))]">
              {hasFilters
                ? 'Showing software matching selected filter criteria.'
                : "Software, tools, games, and practical systems I've built and shipped."}
            </p>
          </div>
        </Reveal>

        {/* 2. Full-Width Featured Carousel / Slider */}
        {isDefaultView && heroSliderItems.length > 0 && (
          <Reveal direction="up" distance={10} className="w-full overflow-visible">
            <AppsMorphHeroLoader apps={heroSliderItems} autoplayIntervalSeconds={5} />
          </Reveal>
        )}

        {/* 3. Filter System at the bottom of the carousel / slider (like updates section) */}
        <Reveal direction="up" distance={8}>
          <div
            id="apps-discovery-bar"
            className="rounded-xl sm:rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-2.5 sm:p-4 md:p-5 shadow-sm backdrop-blur-md"
          >
            <AppDiscoveryBar categories={categories} tags={tags} />
          </div>
        </Reveal>

        {/* 3. Curated Shelves Section (Image 2 - Google Play style shelves) */}
        <Reveal direction="up" distance={10}>
          <AppCuratedShelves
            apps={allPublishedApps}
            activeCategorySlug={categorySlug}
            activeTagSlug={tagSlug}
          />
        </Reveal>

        {/* 4. Big Editorial Cards Showcase (Image 1 - Apple App Store style bento grid) */}
        {searchResult.items.length === 0 ? (
          <Reveal direction="up" distance={12}>
            <AppsEmptyState hasFilters={hasFilters} />
          </Reveal>
        ) : (
          <div className="space-y-6 sm:space-y-8 pt-2 sm:pt-4">
            {/* Editorial Showcase Header */}
            <section aria-labelledby="catalog-apps-heading" className="space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[hsl(var(--border-subtle))] text-[11px] sm:text-xs font-mono text-[hsl(var(--muted-foreground))]">
                <div className="flex items-center gap-1.5 sm:gap-2 uppercase tracking-wider font-semibold min-w-0">
                  <LayoutGrid className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-500 shrink-0" />
                  <h2
                    id="catalog-apps-heading"
                    className="text-[11px] sm:text-xs font-mono text-[hsl(var(--muted-foreground))] uppercase tracking-wider font-semibold truncate"
                  >
                    {hasFilters
                      ? `Filtered Releases (${searchResult.totalCount})`
                      : 'Featured Editorial Catalog'}
                  </h2>
                </div>
                <span className="text-[hsl(var(--subtle-foreground))] shrink-0 ml-2">
                  Page {searchResult.page} of {searchResult.totalPages}
                </span>
              </div>

              <AppEditorialGrid
                apps={catalogItems}
                startIndex={
                  (searchResult.page - 1) * 12 + (isDefaultView ? heroSliderItems.length : 0)
                }
              />
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

        {/* Discovery Bridges: The Archive & Notes */}
        <Reveal direction="up" distance={14}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-6 sm:pt-10 border-t border-[hsl(var(--border-subtle))]">
            {/* The Archive Callout */}
            <Link
              href="/archive"
              className="group p-3.5 sm:p-5 md:p-6 rounded-2xl sm:rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:bg-[hsl(var(--surface-elevated))] hover:border-indigo-500/40 transition-all flex flex-col justify-between focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              <div className="space-y-1.5 sm:space-y-2">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm">
                  <Archive className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-[hsl(var(--foreground))] group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors">
                  The Archive
                </h3>
                <p className="text-[11px] sm:text-xs text-[hsl(var(--muted-foreground))] leading-relaxed">
                  Chronological timeline of earlier projects, legacy utilities, and exploratory
                  implementations.
                </p>
              </div>
              <span className="text-[11px] sm:text-xs font-mono text-indigo-600 dark:text-indigo-400 flex items-center gap-1 pt-3 sm:pt-4 group-hover:translate-x-1 transition-transform">
                <span>Explore historical archive</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Link>

            {/* Updates / Devlogs Callout */}
            <Link
              href={ROUTES.UPDATES}
              className="group p-3.5 sm:p-5 md:p-6 rounded-2xl sm:rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:bg-[hsl(var(--surface-elevated))] hover:border-cyan-500/40 transition-all flex flex-col justify-between focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
            >
              <div className="space-y-1.5 sm:space-y-2">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-600 dark:text-cyan-400 shadow-sm">
                  <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-[hsl(var(--foreground))] group-hover:text-cyan-600 dark:group-hover:text-cyan-300 transition-colors">
                  Engineering Updates
                </h3>
                <p className="text-[11px] sm:text-xs text-[hsl(var(--muted-foreground))] leading-relaxed">
                  Technical write-ups, architecture decisions, release logs, and lessons learned
                  while building.
                </p>
              </div>
              <span className="text-[11px] sm:text-xs font-mono text-cyan-600 dark:text-cyan-400 flex items-center gap-1 pt-3 sm:pt-4 group-hover:translate-x-1 transition-transform">
                <span>Read engineering updates</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Link>
          </div>
        </Reveal>
      </div>
    </PageShell>
  );
}
