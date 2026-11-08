import * as React from 'react';
import { Card, PageShell, Skeleton, SkeletonBadge, SkeletonButton } from '@elsesourav/ui';
import { AppCardSkeleton } from '@/features/apps/components/discovery/AppCardSkeleton';

/**
 * Clean Homepage Content Skeleton
 * Renders an in-page layout skeleton for the homepage sections,
 * allowing PageTransitionLoader to smoothly handle the top-level canvas logo transition.
 */
export function HomepageSkeleton() {
  return (
    <PageShell className="py-8 sm:py-16 space-y-12 select-none">
      {/* Hero Section Skeleton */}
      <div className="max-w-3xl space-y-4">
        <SkeletonBadge className="w-28 h-6" />
        <Skeleton className="h-12 sm:h-16 w-4/5 rounded-2xl" />
        <Skeleton className="h-5 w-full max-w-xl rounded-md" />
        <Skeleton className="h-5 w-3/4 max-w-lg rounded-md" />
        <div className="flex items-center gap-3 pt-3">
          <SkeletonButton className="w-36" />
          <SkeletonButton className="w-28" />
        </div>
      </div>

      {/* Selected Apps Showcase Skeleton */}
      <div className="space-y-4 pt-8">
        <div className="flex items-center justify-between pb-2 border-b border-[hsl(var(--border-subtle))]">
          <Skeleton className="h-6 w-40 rounded-lg" />
          <Skeleton className="h-4 w-20 rounded" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
          <AppCardSkeleton variant="catalog" />
          <AppCardSkeleton variant="catalog" />
          <AppCardSkeleton variant="catalog" />
        </div>
      </div>
    </PageShell>
  );
}
