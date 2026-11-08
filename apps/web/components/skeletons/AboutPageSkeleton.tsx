import * as React from 'react';
import { Card, PageShell, Skeleton, SkeletonBadge } from '@elsesourav/ui';

/**
 * In-page content skeleton for the About page.
 */
export function AboutPageSkeleton() {
  return (
    <PageShell className="py-8 sm:py-12 space-y-12">
      {/* Hero row: Left bio + Right portrait card skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-7 space-y-4">
          <SkeletonBadge className="w-24 h-6" />
          <Skeleton className="h-10 w-4/5 rounded-xl" />
          <Skeleton className="h-5 w-3/5 rounded-lg" />
          <div className="space-y-2 pt-2">
            <Skeleton className="h-4 w-full rounded-md" />
            <Skeleton className="h-4 w-5/6 rounded-md" />
            <Skeleton className="h-4 w-4/5 rounded-md" />
          </div>
        </div>

        <div className="lg:col-span-5 flex justify-center">
          <Card className="w-full max-w-sm aspect-[4/5] rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] overflow-hidden p-0">
            <Skeleton className="w-full h-full rounded-none" />
          </Card>
        </div>
      </div>

      {/* Philosophy / Values grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-[hsl(var(--border-subtle))]">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="p-6 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] space-y-3">
            <Skeleton className="w-10 h-10 rounded-xl" />
            <Skeleton className="h-5 w-32 rounded-lg" />
            <Skeleton className="h-4 w-full rounded-md" />
            <Skeleton className="h-4 w-4/5 rounded-md" />
          </Card>
        ))}
      </div>
    </PageShell>
  );
}

/**
 * In-page content skeleton for the Archive page.
 */
export function ArchiveCatalogSkeleton() {
  return (
    <PageShell className="py-6 sm:py-8 space-y-6">
      <div className="space-y-2">
        <SkeletonBadge className="w-24 h-6" />
        <Skeleton className="h-9 w-64 sm:w-80 rounded-xl" />
        <Skeleton className="h-4 w-full max-w-xl rounded-md" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 pt-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="p-5 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="w-10 h-10 rounded-xl" />
              <SkeletonBadge className="w-16 h-5" />
            </div>
            <Skeleton className="h-5 w-40 rounded-lg" />
            <Skeleton className="h-4 w-full rounded-md" />
            <Skeleton className="h-4 w-3/4 rounded-md" />
          </Card>
        ))}
      </div>
    </PageShell>
  );
}
