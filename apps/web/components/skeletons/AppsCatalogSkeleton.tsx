import * as React from 'react';
import { Card, PageShell, Skeleton, SkeletonBadge } from '@elsesourav/ui';
import { AppCardSkeleton } from '@/features/apps/components/discovery/AppCardSkeleton';

/**
 * In-page content skeleton for the Apps catalog.
 * Displayed when filtering, searching, or loading apps within the page.
 */
export function AppsCatalogSkeleton() {
  return (
    <PageShell className="py-6 sm:py-8 space-y-6">
      {/* Header Skeleton */}
      <div className="space-y-2">
        <SkeletonBadge className="w-24 h-6" />
        <Skeleton className="h-9 w-64 sm:w-80 rounded-xl" />
        <Skeleton className="h-4 w-full max-w-xl rounded-md" />
      </div>

      {/* Discovery & Filter Bar Skeleton */}
      <Card className="p-3 sm:p-4 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <Skeleton className="h-10 flex-1 rounded-xl" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-32 rounded-xl" />
            <Skeleton className="h-10 w-28 rounded-xl" />
          </div>
        </div>

        {/* Category topic chips skeleton */}
        <div className="flex items-center gap-2 overflow-hidden pt-1">
          <Skeleton className="h-8 w-20 rounded-lg shrink-0" />
          <Skeleton className="h-8 w-24 rounded-lg shrink-0" />
          <Skeleton className="h-8 w-20 rounded-lg shrink-0" />
          <Skeleton className="h-8 w-28 rounded-lg shrink-0" />
          <Skeleton className="h-8 w-24 rounded-lg shrink-0" />
        </div>
      </Card>

      {/* Featured / Hero App Card Skeleton */}
      <AppCardSkeleton variant="featured" />

      {/* Catalog Cards Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 pt-2">
        <AppCardSkeleton variant="catalog" />
        <AppCardSkeleton variant="catalog" />
        <AppCardSkeleton variant="catalog" />
        <AppCardSkeleton variant="catalog" />
        <AppCardSkeleton variant="catalog" />
        <AppCardSkeleton variant="catalog" />
      </div>
    </PageShell>
  );
}
