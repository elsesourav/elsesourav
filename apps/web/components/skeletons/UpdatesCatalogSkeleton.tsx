import * as React from 'react';
import { Card, PageShell, Skeleton, SkeletonBadge } from '@elsesourav/ui';
import { BlogCardSkeleton } from '@/features/blog/components/BlogCardSkeleton';

/**
 * In-page content skeleton for the Updates / Devlogs listing.
 */
export function UpdatesCatalogSkeleton() {
  return (
    <PageShell className="py-6 sm:py-8 space-y-6">
      {/* Header Skeleton */}
      <div className="space-y-2">
        <SkeletonBadge className="w-24 h-6" />
        <Skeleton className="h-9 w-64 sm:w-80 rounded-xl" />
        <Skeleton className="h-4 w-full max-w-xl rounded-md" />
      </div>

      {/* Topics row skeleton */}
      <Card className="p-3 sm:p-4 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] flex items-center gap-2 overflow-hidden">
        <Skeleton className="h-8 w-20 rounded-lg shrink-0" />
        <Skeleton className="h-8 w-24 rounded-lg shrink-0" />
        <Skeleton className="h-8 w-28 rounded-lg shrink-0" />
        <Skeleton className="h-8 w-20 rounded-lg shrink-0" />
        <Skeleton className="h-8 w-24 rounded-lg shrink-0" />
      </Card>

      {/* Featured Blog Card Skeleton */}
      <BlogCardSkeleton isFeatured />

      {/* Blog Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 pt-2">
        <BlogCardSkeleton />
        <BlogCardSkeleton />
        <BlogCardSkeleton />
        <BlogCardSkeleton />
        <BlogCardSkeleton />
        <BlogCardSkeleton />
      </div>
    </PageShell>
  );
}

/**
 * In-page content skeleton for single devlog / article view.
 */
export function ArticleDetailSkeleton() {
  return (
    <PageShell className="py-8 sm:py-12 max-w-3xl mx-auto space-y-6">
      <div className="space-y-3">
        <SkeletonBadge className="w-24 h-6" />
        <Skeleton className="h-10 w-4/5 rounded-xl" />
        <div className="flex items-center gap-3 pt-2">
          <Skeleton className="w-9 h-9 rounded-full" />
          <div className="space-y-1">
            <Skeleton className="h-3.5 w-28 rounded" />
            <Skeleton className="h-3 w-36 rounded" />
          </div>
        </div>
      </div>

      <div className="aspect-[16/9] w-full rounded-2xl overflow-hidden bg-[hsl(var(--surface-subtle))] border border-[hsl(var(--border))]">
        <Skeleton className="w-full h-full rounded-none" />
      </div>

      <div className="space-y-3 pt-4">
        <Skeleton className="h-4 w-full rounded-md" />
        <Skeleton className="h-4 w-full rounded-md" />
        <Skeleton className="h-4 w-5/6 rounded-md" />
        <Skeleton className="h-4 w-4/6 rounded-md" />
        <div className="py-2" />
        <Skeleton className="h-4 w-full rounded-md" />
        <Skeleton className="h-4 w-11/12 rounded-md" />
      </div>
    </PageShell>
  );
}
