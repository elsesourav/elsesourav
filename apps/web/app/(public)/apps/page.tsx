import { Metadata } from 'next';
import { discoverPublishedApps, getActiveCategories, getActiveTags } from '@/features/apps/queries/get-apps';
import { AppCard } from '@/features/apps/components/AppCard';
import { AppDiscoveryBar } from '@/features/apps/components/AppDiscoveryBar';
import { AppPagination } from '@/features/apps/components/AppPagination';
import { AppsEmptyState } from '@/features/apps/components/AppsEmptyState';
import { Badge } from '@elsesourav/ui';
import type { AppSortOption } from '@elsesourav/types';

export const metadata: Metadata = {
  title: 'Explore Applications | ElseSourav',
  description: 'Explore the complete ecosystem of web apps, browser extensions, developer utilities, and software created by ElseSourav.',
  alternates: {
    canonical: 'https://elsesourav.com/apps',
  },
  openGraph: {
    title: 'Explore Applications | ElseSourav',
    description: 'Browse web applications, developer tools, and utilities.',
    url: 'https://elsesourav.com/apps',
  },
};

interface AppsPageProps {
  searchParams: Promise<{
    q?: string;
    search?: string;
    category?: string;
    tag?: string;
    sort?: string;
    page?: string;
  }>;
}

export default async function AppsPage({ searchParams }: AppsPageProps) {
  const params = await searchParams;
  const query = (params.q || params.search || '').trim();
  const categorySlug = params.category || undefined;
  const tagSlug = params.tag || undefined;
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
      },
      sort,
      page,
      limit: 12,
    }),
  ]);

  const hasFilters = Boolean(categorySlug || tagSlug || query || (params.sort && params.sort !== 'sortOrder'));

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        {/* Header Title Section */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-100">
              Explore Applications
            </h1>
            <Badge variant="info" className="text-xs px-2.5 py-0.5 font-medium">
              {searchResult.totalCount} {searchResult.totalCount === 1 ? 'App' : 'Apps'}
            </Badge>
          </div>
          <p className="text-sm text-zinc-400 max-w-2xl">
            Browse the complete catalog of web applications, browser extensions, developer utilities, and software created by ElseSourav.
          </p>
        </div>

        {/* Discovery & Search Bar */}
        <AppDiscoveryBar categories={categories} tags={tags} />

        {/* Apps Grid or Empty State */}
        {searchResult.items.length === 0 ? (
          <AppsEmptyState hasFilters={hasFilters} />
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {searchResult.items.map((app) => (
                <AppCard key={app.id} app={app} />
              ))}
            </div>

            {/* Pagination Controls */}
            <AppPagination
              currentPage={searchResult.page}
              totalPages={searchResult.totalPages}
              totalMatches={searchResult.totalCount}
            />
          </div>
        )}
      </div>
    </div>
  );
}
