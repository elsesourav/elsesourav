import * as React from 'react';
import { Skeleton } from '@elsesourav/ui';

export default function BlogPostLoading() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <Skeleton className="h-4 w-36 bg-zinc-800/60 rounded" />
        <Skeleton className="h-6 w-24 bg-zinc-800/60 rounded-full" />
        <Skeleton className="h-12 w-full bg-zinc-800/60 rounded-xl" />
        <Skeleton className="h-5 w-4/5 bg-zinc-800/60 rounded-lg" />

        {/* Author Bar Skeleton */}
        <div className="flex items-center justify-between py-4 border-y border-zinc-800/80">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full bg-zinc-800/60" />
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-28 bg-zinc-800/60" />
              <Skeleton className="h-3 w-40 bg-zinc-800/60" />
            </div>
          </div>
          <Skeleton className="h-8 w-32 bg-zinc-800/60 rounded-lg" />
        </div>

        {/* Cover Skeleton */}
        <Skeleton className="aspect-[16/9] w-full rounded-3xl bg-zinc-900/80" />

        {/* Content Paragraph Skeletons */}
        <div className="space-y-4 pt-6">
          <Skeleton className="h-4 w-full bg-zinc-800/60" />
          <Skeleton className="h-4 w-full bg-zinc-800/60" />
          <Skeleton className="h-4 w-3/4 bg-zinc-800/60" />
          <Skeleton className="h-32 w-full bg-zinc-900/80 rounded-2xl" />
          <Skeleton className="h-4 w-full bg-zinc-800/60" />
          <Skeleton className="h-4 w-5/6 bg-zinc-800/60" />
        </div>
      </div>
    </div>
  );
}
