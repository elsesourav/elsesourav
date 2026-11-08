import * as React from 'react';
import { Card, PageShell, Skeleton, SkeletonBadge, SkeletonButton } from '@elsesourav/ui';

/**
 * In-page content skeleton for single App detail view.
 */
export function AppDetailPageSkeleton() {
  return (
    <PageShell className="py-6 sm:py-10 space-y-8">
      {/* App Header Hero */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[hsl(var(--border))]">
        <div className="flex items-center gap-4">
          <Skeleton className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl shrink-0" />
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-7 w-48 rounded-lg" />
              <SkeletonBadge className="w-16 h-5" />
            </div>
            <Skeleton className="h-4 w-72 rounded-md" />
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <SkeletonButton className="flex-1 sm:flex-none w-32" />
          <SkeletonButton className="flex-1 sm:flex-none w-28" />
        </div>
      </div>

      {/* Media Screenshot Showcase Skeleton */}
      <div className="aspect-[16/9] w-full rounded-2xl overflow-hidden bg-[hsl(var(--surface-subtle))] border border-[hsl(var(--border))]">
        <Skeleton className="w-full h-full rounded-none" />
      </div>

      {/* Two-Column Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-4">
          <Card className="p-6 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] space-y-3">
            <Skeleton className="h-6 w-36 rounded-lg" />
            <Skeleton className="h-4 w-full rounded-md" />
            <Skeleton className="h-4 w-5/6 rounded-md" />
            <Skeleton className="h-4 w-4/6 rounded-md" />
          </Card>
        </div>

        <div className="lg:col-span-4 space-y-4">
          <Card className="p-5 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] space-y-3">
            <Skeleton className="h-5 w-28 rounded-md" />
            <div className="space-y-2 pt-1">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-20 rounded" />
                <Skeleton className="h-4 w-24 rounded" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-4 w-16 rounded" />
                <Skeleton className="h-4 w-20 rounded" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-4 w-20 rounded" />
                <Skeleton className="h-4 w-16 rounded" />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </PageShell>
  );
}
