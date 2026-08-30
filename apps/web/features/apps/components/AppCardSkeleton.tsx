import * as React from 'react';
import { Card, Skeleton, SkeletonBadge } from '@elsesourav/ui';

interface AppCardSkeletonProps {
  variant?: 'featured' | 'catalog' | 'default';
}

export function AppCardSkeleton({ variant = 'catalog' }: AppCardSkeletonProps) {
  if (variant === 'featured') {
    return (
      <Card className="rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 sm:p-7 md:p-8 backdrop-blur-md overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-center">
          {/* Visual Showcase Skeleton (Left) */}
          <div className="md:col-span-6 relative aspect-[16/10] w-full rounded-2xl overflow-hidden bg-[hsl(var(--surface-subtle))] border border-[hsl(var(--border-subtle))]">
            <Skeleton className="w-full h-full rounded-2xl" />
          </div>

          {/* Editorial Metadata Skeleton (Right) */}
          <div className="md:col-span-6 flex flex-col justify-between space-y-4">
            {/* Header row */}
            <div className="flex items-center justify-between pb-3 border-b border-[hsl(var(--border-subtle))]">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-12 rounded" />
                <Skeleton className="h-4 w-28 rounded" />
              </div>
              <Skeleton className="h-4 w-12 rounded" />
            </div>

            {/* Title & Icon */}
            <div className="flex items-start gap-3.5 pt-1">
              <Skeleton className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl shrink-0" />
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-7 w-3/4 rounded-lg" />
                <Skeleton className="h-3.5 w-1/3 rounded" />
              </div>
            </div>

            {/* Description lines */}
            <div className="space-y-2 py-1">
              <Skeleton className="h-4 w-full rounded-md" />
              <Skeleton className="h-4 w-full rounded-md" />
              <Skeleton className="h-4 w-4/5 rounded-md" />
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-[hsl(var(--border-subtle))]">
              <div className="flex items-center gap-2">
                <Skeleton className="w-6 h-6 rounded-lg" />
                <Skeleton className="w-6 h-6 rounded-lg" />
                <Skeleton className="w-6 h-6 rounded-lg" />
              </div>
              <Skeleton className="h-4 w-28 rounded-md" />
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="h-full border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 sm:p-5 rounded-2xl flex flex-col justify-between overflow-hidden">
      <div className="space-y-3">
        {/* Cover Preview */}
        <div className="aspect-[16/9] w-full rounded-xl overflow-hidden bg-[hsl(var(--surface-subtle))] border border-[hsl(var(--border-subtle))]">
          <Skeleton className="w-full h-full rounded-xl" />
        </div>

        {/* Index & Category Header */}
        <div className="flex items-center justify-between pb-2 border-b border-[hsl(var(--border-subtle))]">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-8 rounded" />
            <Skeleton className="h-3.5 w-24 rounded" />
          </div>
          <Skeleton className="h-3 w-10 rounded" />
        </div>

        {/* Icon & Title */}
        <div className="flex items-start gap-3 pt-0.5">
          <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
          <div className="min-w-0 flex-1 space-y-1.5 pt-0.5">
            <Skeleton className="h-5 w-4/5 rounded-md" />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1.5 pt-0.5">
          <Skeleton className="h-3.5 w-full rounded-md" />
          <Skeleton className="h-3.5 w-3/4 rounded-md" />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 mt-3 border-t border-[hsl(var(--border-subtle))]">
        <div className="flex items-center gap-1.5">
          <Skeleton className="w-5 h-5 rounded-full" />
          <Skeleton className="w-5 h-5 rounded-full" />
        </div>
        <Skeleton className="h-3.5 w-20 rounded" />
      </div>
    </Card>
  );
}
