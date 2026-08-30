import * as React from 'react';
import { HelpArticleCardSkeleton } from '@/features/help/components/HelpSkeleton';
import { Skeleton, SkeletonBadge } from '@elsesourav/ui';

export default function HelpCategoryLoading() {
  return (
    <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 space-y-10">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-12 rounded" />
          <span className="text-[hsl(var(--subtle-foreground))]">/</span>
          <Skeleton className="h-4 w-28 rounded" />
        </div>

        {/* Category Header */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 sm:h-10 w-64 rounded-xl" />
            <SkeletonBadge className="w-16 h-6" />
          </div>
          <Skeleton className="h-4 w-96 max-w-full rounded-md" />
        </div>

        {/* Articles List Skeleton */}
        <div className="space-y-4 pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {Array.from({ length: 6 }).map((_, idx) => (
              <HelpArticleCardSkeleton key={idx} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
