import * as React from 'react';
import { Skeleton } from '@elsesourav/ui';

export default function HelpArticleLoading() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Breadcrumb Skeleton */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-3 w-16 bg-zinc-800/60 rounded" />
          <Skeleton className="h-3 w-3 bg-zinc-800/60 rounded-full" />
          <Skeleton className="h-3 w-24 bg-zinc-800/60 rounded" />
          <Skeleton className="h-3 w-3 bg-zinc-800/60 rounded-full" />
          <Skeleton className="h-3 w-32 bg-zinc-800/60 rounded" />
        </div>

        <Skeleton className="h-6 w-24 bg-zinc-800/60 rounded-full" />
        <Skeleton className="h-12 w-full bg-zinc-800/60 rounded-xl" />
        <Skeleton className="h-5 w-4/5 bg-zinc-800/60 rounded-lg" />

        {/* Metadata Skeleton */}
        <div className="flex items-center gap-3 py-3 border-y border-zinc-800/80">
          <Skeleton className="h-3 w-32 bg-zinc-800/60 rounded" />
          <Skeleton className="h-3 w-3 bg-zinc-800/60 rounded-full" />
          <Skeleton className="h-3 w-28 bg-zinc-800/60 rounded" />
        </div>

        {/* Content Paragraph Skeletons */}
        <div className="space-y-4 pt-4">
          <Skeleton className="h-4 w-full bg-zinc-800/60" />
          <Skeleton className="h-4 w-full bg-zinc-800/60" />
          <Skeleton className="h-4 w-3/4 bg-zinc-800/60" />
          <Skeleton className="h-28 w-full bg-zinc-900/80 rounded-2xl" />
          <Skeleton className="h-4 w-full bg-zinc-800/60" />
          <Skeleton className="h-4 w-5/6 bg-zinc-800/60" />
        </div>
      </div>
    </div>
  );
}
