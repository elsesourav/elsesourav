import * as React from 'react';
import { BlogCardSkeleton } from '@/features/blog/components/BlogCardSkeleton';
import { Skeleton, SkeletonBadge } from '@elsesourav/ui';

export default function BlogLoading() {
  return (
    <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 space-y-10">
        {/* Header Skeleton */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 sm:h-10 w-56 rounded-xl" />
            <SkeletonBadge className="w-16 h-6" />
          </div>
          <Skeleton className="h-4 w-96 max-w-full rounded-md" />
        </div>

        {/* Discovery & Search Bar Skeleton */}
        <div className="space-y-4 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <Skeleton className="h-10 w-full sm:w-80 rounded-xl" />
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <Skeleton className="h-8 w-16 rounded-full shrink-0" />
              <Skeleton className="h-8 w-24 rounded-full shrink-0" />
              <Skeleton className="h-8 w-28 rounded-full shrink-0" />
              <Skeleton className="h-8 w-20 rounded-full shrink-0" />
            </div>
          </div>
        </div>

        {/* Blog Cards Skeleton Grid (Featured Top Card + Catalog Grid) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <BlogCardSkeleton isFeatured />
          <BlogCardSkeleton />
          <BlogCardSkeleton />
          <BlogCardSkeleton />
        </div>
      </div>
    </div>
  );
}
