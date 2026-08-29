import { Metadata } from 'next';
import {
  discoverPublishedApps,
  getActiveCategories,
  getActiveTags,
} from '@/features/apps/queries/get-apps';
import { AppCard } from '@/features/apps/components/AppCard';
import { AppDiscoveryBar } from '@/features/apps/components/AppDiscoveryBar';
import { AppPagination } from '@/features/apps/components/AppPagination';
import { AppsEmptyState } from '@/features/apps/components/AppsEmptyState';
import { PageShell, PageHeader, Badge } from '@elsesourav/ui';
import { SITE_CONFIG } from '@elsesourav/config';
import type { AppSortOption, AppPlatform } from '@elsesourav/types';

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
    ? `Search: "${query}" in Applications`
    : category
      ? `${category.charAt(0).toUpperCase() + category.slice(1)} Applications`
      : platform
        ? `${platform.toUpperCase()} Software & Tools`
        : 'Explore Applications';

  const description =
    'Explore the complete ecosystem of web apps, browser extensions, developer utilities, and software created by ElseSourav.';
  const canonicalUrl = 'https://elsesourav.com/apps';

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
      title: `${title} | ElseSourav`,
      description,
      url: canonicalUrl,
      siteName: SITE_CONFIG.name,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | ElseSourav`,
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

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Applications & Software Tools',
    description: 'Explore the complete ecosystem of web apps and developer utilities.',
    url: 'https://elsesourav.com/apps',
    publisher: {
      '@type': 'Organization',
      name: SITE_CONFIG.name,
      url: SITE_CONFIG.url,
    },
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: searchResult.items.map((app, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: app.name,
        url: `https://elsesourav.com/apps/${app.slug}`,
      })),
    },
  };

  return (
    <PageShell size="lg" glow>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="space-y-8">
        {/* Page Header */}
        <PageHeader
          eyebrow="Software Studio & Index"
          badge={
            <Badge variant="primary" className="text-xs px-2.5 py-0.5 font-medium">
              {searchResult.totalCount} {searchResult.totalCount === 1 ? 'Application' : 'Applications'}
            </Badge>
          }
          title="Applications & Developer Utilities"
          description="Browse the complete catalog of web applications, developer workstations, extensions, and open-source utilities built for speed, utility, and reliable execution."
        />

        {/* Discovery, Search, Category & Platform Controls */}
        <AppDiscoveryBar categories={categories} tags={tags} />

        {/* Applications Catalog Grid or Empty State */}
        {searchResult.items.length === 0 ? (
          <AppsEmptyState hasFilters={hasFilters} />
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {searchResult.items.map((app, idx) => (
                <AppCard
                  key={app.id}
                  app={app}
                  index={(searchResult.page - 1) * 12 + idx}
                />
              ))}
            </div>

            {/* Pagination Controls */}
            {searchResult.totalPages > 1 && (
              <AppPagination
                currentPage={searchResult.page}
                totalPages={searchResult.totalPages}
                totalMatches={searchResult.totalCount}
              />
            )}
          </div>
        )}
      </div>
    </PageShell>
  );
}
