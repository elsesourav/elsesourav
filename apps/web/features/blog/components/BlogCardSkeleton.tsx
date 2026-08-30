import * as React from 'react';
import { Card, Skeleton, SkeletonBadge, SkeletonAvatar } from '@elsesourav/ui';

interface BlogCardSkeletonProps {
  isFeatured?: boolean;
}

export function BlogCardSkeleton({ isFeatured = false }: BlogCardSkeletonProps) {
  return (
    <Card
      className={`flex flex-col justify-between overflow-hidden rounded-2xl border-[hsl(var(--border))] bg-[hsl(var(--card))] p-0 shadow-sm ${
        isFeatured ? 'sm:col-span-2 lg:col-span-3 lg:flex-row' : ''
      }`}
    >
      {/* Cover skeleton */}
      <div
        className={`aspect-[16/9] w-full overflow-hidden bg-[hsl(var(--surface-subtle))] border-b border-[hsl(var(--border-subtle))] ${
          isFeatured ? 'lg:w-1/2 lg:aspect-auto' : ''
        }`}
      >
        <Skeleton className="w-full h-full rounded-none" />
      </div>

      {/* Body */}
      <div className="p-5 sm:p-6 flex flex-col justify-between flex-1 space-y-4">
        <div className="space-y-3">
          {/* Metadata row */}
          <div className="flex items-center justify-between gap-2">
            <SkeletonBadge className="w-16 h-5" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-3 w-16 rounded" />
              <Skeleton className="h-3 w-12 rounded" />
            </div>
          </div>

          {/* Title */}
          <Skeleton className="h-6 w-4/5 rounded-lg" />

          {/* Excerpt */}
          <div className="space-y-1.5 pt-1">
            <Skeleton className="h-3.5 w-full rounded-md" />
            <Skeleton className="h-3.5 w-4/5 rounded-md" />
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-[hsl(var(--border-subtle))] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SkeletonAvatar className="w-6 h-6" />
            <Skeleton className="h-3.5 w-24 rounded" />
          </div>
          <Skeleton className="h-3.5 w-16 rounded" />
        </div>
      </div>
    </Card>
  );
}
