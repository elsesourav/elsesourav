import * as React from 'react';
import {
  HelpCategorySkeleton,
  HelpArticleCardSkeleton,
} from '@/features/help/components/HelpSkeleton';
import { Skeleton } from '@elsesourav/ui';

export default function HelpLoading() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        {/* Hero Skeleton */}
        <div className="text-center space-y-4 max-w-3xl mx-auto pt-4">
          <Skeleton className="h-6 w-48 bg-zinc-800/60 rounded-full mx-auto" />
          <Skeleton className="h-12 w-96 bg-zinc-800/60 rounded-2xl mx-auto" />
          <Skeleton className="h-5 w-80 bg-zinc-800/60 rounded-lg mx-auto" />
          <Skeleton className="h-12 w-full max-w-2xl bg-zinc-900/80 rounded-2xl mx-auto" />
        </div>

        {/* Categories Grid Skeleton */}
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-800/80">
            <Skeleton className="h-7 w-48 bg-zinc-800/60 rounded" />
            <Skeleton className="h-4 w-24 bg-zinc-800/60 rounded" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, idx) => (
              <HelpCategorySkeleton key={idx} />
            ))}
          </div>
        </div>

        {/* Popular Articles Grid Skeleton */}
        <div className="space-y-6">
          <Skeleton className="h-7 w-56 bg-zinc-800/60 rounded pb-4 border-b border-zinc-800/80" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 3 }).map((_, idx) => (
              <HelpArticleCardSkeleton key={idx} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
