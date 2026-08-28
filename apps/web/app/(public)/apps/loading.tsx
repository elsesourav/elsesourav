import * as React from 'react';
import { AppCardSkeleton } from '@/features/apps/components/AppCardSkeleton';
import { Skeleton } from '@elsesourav/ui';

export default function AppsLoading() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        {/* Header Skeleton */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-64 bg-zinc-800/60 rounded-xl" />
            <Skeleton className="h-6 w-16 bg-zinc-800/60 rounded-full" />
          </div>
          <Skeleton className="h-4 w-96 bg-zinc-800/60" />
        </div>

        {/* Filter bar Skeleton */}
        <div className="space-y-4">
          <Skeleton className="h-10 w-full max-w-md bg-zinc-800/60 rounded-xl" />
          <div className="flex gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-7 w-20 bg-zinc-800/60 rounded-full" />
            ))}
          </div>
        </div>

        {/* Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, idx) => (
            <AppCardSkeleton key={idx} />
          ))}
        </div>
      </div>
    </div>
  );
}
