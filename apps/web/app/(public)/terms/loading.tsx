import * as React from 'react';
import { Card, Skeleton, SkeletonBadge } from '@elsesourav/ui';

export default function TermsLoading() {
  return (
    <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        {/* Back Link Skeleton */}
        <Skeleton className="h-4 w-28 rounded-md" />

        {/* Header Skeleton */}
        <div className="space-y-3">
          <SkeletonBadge className="w-40 h-6" />
          <Skeleton className="h-9 sm:h-11 w-64 rounded-2xl" />
          <Skeleton className="h-4 w-72 max-w-full rounded-lg" />
        </div>

        {/* Terms Content Card Skeleton */}
        <Card className="p-6 sm:p-8 rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] space-y-8">
          <div className="space-y-3">
            <Skeleton className="h-6 w-44 rounded-lg" />
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-4 w-4/5 rounded" />
          </div>

          <div className="space-y-3">
            <Skeleton className="h-6 w-52 rounded-lg" />
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-4 w-11/12 rounded" />
            <Skeleton className="h-4 w-5/6 rounded" />
          </div>

          <div className="space-y-3">
            <Skeleton className="h-6 w-48 rounded-lg" />
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-4 w-3/4 rounded" />
          </div>
        </Card>
      </div>
    </div>
  );
}
