import { Metadata } from 'next';
import { getPublishedApps } from '@/features/apps/queries/get-apps';
import { AppCard } from '@/features/apps/components/AppCard';
import { AppFilters } from '@/features/apps/components/AppFilters';
import { AppsEmptyState } from '@/features/apps/components/AppsEmptyState';
import { Badge } from '@elsesourav/ui';
import type { SortDirection } from '@elsesourav/types';

export const metadata: Metadata = {
  title: 'Explore Applications | ElseSourav',
  description: 'Explore the complete ecosystem of web apps, browser extensions, developer utilities, and software created by ElseSourav.',
  openGraph: {
    title: 'Explore Applications | ElseSourav',
    description: 'Browse web applications, developer tools, and utilities.',
  },
};

interface AppsPageProps {
  searchParams: Promise<{
    category?: string;
    tag?: string;
    search?: string;
    sort?: string;
  }>;
}

export default async function AppsPage({ searchParams }: AppsPageProps) {
  const params = await searchParams;
  const categorySlug = params.category || undefined;
  const tagSlug = params.tag || undefined;
  const search = params.search || undefined;

  let sortField: 'createdAt' | 'sortOrder' | 'name' | 'publishedAt' = 'sortOrder';
  let sortDirection: SortDirection = 'asc';

  if (params.sort === 'newest') {
    sortField = 'publishedAt';
    sortDirection = 'desc';
  } else if (params.sort === 'name') {
    sortField = 'name';
    sortDirection = 'asc';
  }

  const apps = await getPublishedApps({
    categorySlug,
    tagSlug,
    search,
    sortField,
    sortDirection,
    limit: 40,
  });

  const hasFilters = Boolean(categorySlug || tagSlug || search || params.sort);

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        {/* Header Title Section */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-100">
              Explore Applications
            </h1>
            <Badge variant="info" className="text-xs px-2 py-0.5 font-medium">
              {apps.length} {apps.length === 1 ? 'App' : 'Apps'}
            </Badge>
          </div>
          <p className="text-sm text-zinc-400 max-w-2xl">
            Browse the complete collection of web tools, developer utilities, games, and software engineered for modern workflows.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <AppFilters />

        {/* Apps Grid or Empty State */}
        {apps.length === 0 ? (
          <AppsEmptyState hasFilters={hasFilters} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {apps.map((app) => (
              <AppCard key={app.id} app={app} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
