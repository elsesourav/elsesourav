import * as React from 'react';
import { AppCardSkeleton } from '@/features/apps/components/AppCardSkeleton';
import { Skeleton } from '@elsesourav/ui';

export default function LibraryLoading() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <Skeleton className="h-4 w-40 bg-zinc-800/60 rounded-md" />

        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-64 bg-zinc-800/60 rounded-xl" />
            <Skeleton className="h-6 w-16 bg-zinc-800/60 rounded-full" />
          </div>
          <Skeleton className="h-4 w-96 bg-zinc-800/60" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, idx) => (
            <AppCardSkeleton key={idx} />
          ))}
        </div>
      </div>
    </div>
  );
}
