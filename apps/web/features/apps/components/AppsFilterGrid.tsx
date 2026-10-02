'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FilterGrid, type FilterDefinition } from '@elsesourav/ui/interior';
import { AppCard } from '@/features/apps/components/AppCard';
import type { AppListItem, CategorySummary } from '@elsesourav/types';

export interface AppsFilterGridProps {
  apps: readonly AppListItem[];
  categories: readonly CategorySummary[];
  initialCategory?: string;
  startIndex?: number;
}

export function AppsFilterGrid({
  apps,
  categories = [],
  initialCategory,
  startIndex = 0,
}: AppsFilterGridProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentCategory = searchParams.get('category') || initialCategory || 'all';

  const filters = React.useMemo<FilterDefinition<AppListItem>[]>(() => {
    return [
      {
        id: 'all',
        label: 'All Projects',
        match: () => true,
      },
      ...categories.map((cat) => ({
        id: cat.slug,
        label: cat.name,
        match: (app: AppListItem) =>
          app.categorySlug === cat.slug ||
          app.categorySlug?.toLowerCase() === cat.slug?.toLowerCase() ||
          (Boolean(app.primaryCategory) &&
            app.primaryCategory.toLowerCase() === cat.name.toLowerCase()),
      })),
    ];
  }, [categories]);

  const handleValueChange = React.useCallback(
    (id: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (id === 'all') {
        params.delete('category');
      } else {
        params.set('category', id);
      }
      params.delete('page');
      const qs = params.toString();
      router.push(qs ? `/apps?${qs}` : '/apps', { scroll: false });
    },
    [router, searchParams]
  );

  return (
    <FilterGrid
      items={apps}
      filters={filters}
      value={currentCategory}
      onValueChange={handleValueChange}
      getKey={(app) => app.id}
      label="Application category filters"
      fluid={true}
      unstyledItem={true}
      gridClassName="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 list-none p-0 m-0 outline-none"
      filterBarClassName="mb-6 overflow-x-auto pb-1 no-scrollbar"
      emptyLabel="No software projects found in this category."
      renderItem={(app, idx) => (
        <AppCard
          app={app}
          index={startIndex + idx}
        />
      )}
    />
  );
}
