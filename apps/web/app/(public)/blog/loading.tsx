import * as React from 'react';
import { BlogCardSkeleton } from '@/features/blog/components/BlogCardSkeleton';
import { Skeleton } from '@elsesourav/ui';

export default function BlogLoading() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-64 bg-zinc-800/60 rounded-xl" />
            <Skeleton className="h-6 w-20 bg-zinc-800/60 rounded-full" />
          </div>
          <Skeleton className="h-4 w-96 bg-zinc-800/60" />
        </div>

        {/* Discovery Bar Skeleton */}
        <div className="space-y-4">
          <Skeleton className="h-10 w-full max-w-md bg-zinc-900/60 rounded-xl" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-24 bg-zinc-900/60 rounded-full" />
            <Skeleton className="h-8 w-28 bg-zinc-900/60 rounded-full" />
            <Skeleton className="h-8 w-24 bg-zinc-900/60 rounded-full" />
          </div>
        </div>

        {/* Blog Cards Skeleton Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, idx) => (
            <BlogCardSkeleton key={idx} />
          ))}
        </div>
      </div>
    </div>
  );
}
