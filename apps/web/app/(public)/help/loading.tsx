import * as React from 'react';
import {
  HelpCategorySkeleton,
  HelpArticleCardSkeleton,
} from '@/features/help/components/HelpSkeleton';
import { Skeleton, SkeletonBadge } from '@elsesourav/ui';

export default function HelpLoading() {
  return (
    <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 space-y-16">
        {/* Hero Skeleton */}
        <div className="text-center space-y-4 max-w-3xl mx-auto pt-4">
          <SkeletonBadge className="w-44 h-6 mx-auto" />
          <Skeleton className="h-10 sm:h-12 w-80 sm:w-96 rounded-2xl mx-auto" />
          <Skeleton className="h-5 w-72 rounded-lg mx-auto" />
          <Skeleton className="h-12 w-full max-w-2xl rounded-2xl mx-auto" />
        </div>

        {/* Categories Grid Skeleton */}
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[hsl(var(--border-subtle))]">
            <Skeleton className="h-7 w-48 rounded-lg" />
            <Skeleton className="h-4 w-24 rounded" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, idx) => (
              <HelpCategorySkeleton key={idx} />
            ))}
          </div>
        </div>

        {/* Popular Articles Grid Skeleton */}
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[hsl(var(--border-subtle))]">
            <Skeleton className="h-7 w-56 rounded-lg" />
            <Skeleton className="h-4 w-20 rounded" />
          </div>
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
