import * as React from 'react';
import { Card, Skeleton, SkeletonBadge, SkeletonAvatar, cn } from '@elsesourav/ui';

interface BlogCardSkeletonProps {
  isFeatured?: boolean;
}

export function BlogCardSkeleton({ isFeatured = false }: BlogCardSkeletonProps) {
  return (
    <Card
      className={cn(
        'flex flex-col justify-between overflow-hidden rounded-xl sm:rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-0 shadow-sm',
        isFeatured ? 'sm:col-span-2 lg:col-span-3 md:flex-row' : ''
      )}
    >
      {/* Cover skeleton — 16:9 fitted (theme-adaptive bg & shimmer) */}
      <div
        className={cn(
          'aspect-[16/9] w-full overflow-hidden bg-zinc-100 dark:bg-zinc-900/90 shrink-0',
          isFeatured ? 'md:w-1/2 border-b md:border-b-0 md:border-r border-[hsl(var(--border-subtle))]' : 'border-b border-[hsl(var(--border-subtle))]'
        )}
      >
        <div className="w-full h-full skeleton-shimmer bg-zinc-200/90 dark:bg-zinc-800/90" />
      </div>

      {/* Body — compact even padding */}
      <div
        className={cn(
          'flex flex-col justify-between flex-1 min-w-0',
          isFeatured ? 'p-4 sm:p-5 lg:p-6 space-y-3 sm:space-y-4' : 'p-3.5 sm:p-4 space-y-2.5 sm:space-y-3'
        )}
      >
        <div className="space-y-2 sm:space-y-2.5">
          {/* Metadata row */}
          <div className="flex items-center justify-between gap-2">
            <SkeletonBadge className="w-16 h-5" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-3 w-16 rounded" />
              <Skeleton className="h-3 w-12 rounded" />
            </div>
          </div>

          {/* Title */}
          <Skeleton className="h-5 sm:h-6 w-4/5 rounded-lg" />

          {/* Excerpt */}
          <div className="space-y-1.5 pt-1">
            <Skeleton className="h-3.5 w-full rounded-md" />
            <Skeleton className="h-3.5 w-4/5 rounded-md" />
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2.5 sm:pt-3 border-t border-[hsl(var(--border-subtle))] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SkeletonAvatar className="w-5 h-5 sm:w-6 sm:h-6" />
            <Skeleton className="h-3.5 w-24 rounded" />
          </div>
          <Skeleton className="h-3.5 w-16 rounded" />
        </div>
      </div>
    </Card>
  );
}
