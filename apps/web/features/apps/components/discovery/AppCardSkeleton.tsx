import * as React from 'react';
import { Card, Skeleton } from '@elsesourav/ui';

interface AppCardSkeletonProps {
  variant?: 'featured' | 'catalog' | 'default';
}

export function AppCardSkeleton({ variant = 'catalog' }: AppCardSkeletonProps) {
  if (variant === 'featured') {
    return (
      <Card className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-0 backdrop-blur-md overflow-hidden shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-0 items-stretch">
          {/* Visual Showcase Skeleton (Left) */}
          <div className="md:col-span-6 relative aspect-[16/8] md:aspect-auto md:h-full w-full overflow-hidden bg-[hsl(var(--surface-subtle))]">
            <Skeleton className="w-full h-full rounded-none" />
            {/* Pinned Top-Left Badge Skeleton */}
            <div className="absolute top-0 left-0 z-10">
              <Skeleton className="h-5 w-24 rounded-tl-none rounded-br-md" />
            </div>
          </div>

          {/* Editorial Metadata Skeleton (Right) */}
          <div className="md:col-span-6 flex flex-col justify-between p-4 sm:p-5 space-y-3">
            {/* Header row */}
            <div className="flex items-center justify-between pb-2 border-b border-[hsl(var(--border-subtle))]">
              <Skeleton className="h-3.5 w-20 rounded" />
              <Skeleton className="h-3.5 w-14 rounded" />
            </div>

            {/* Title & Icon */}
            <div className="flex items-start gap-3 pt-0.5">
              <Skeleton className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl shrink-0" />
              <div className="min-w-0 flex-1 space-y-1.5">
                <Skeleton className="h-6 w-3/4 rounded-lg" />
                <Skeleton className="h-3 w-20 rounded" />
              </div>
            </div>

            {/* Description lines */}
            <div className="space-y-1.5 py-0.5">
              <Skeleton className="h-3.5 w-full rounded-md" />
              <Skeleton className="h-3.5 w-4/5 rounded-md" />
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-2.5 border-t border-[hsl(var(--border-subtle))]">
              <div className="flex items-center gap-1.5">
                <Skeleton className="h-5 w-14 rounded-md" />
                <Skeleton className="h-5 w-14 rounded-md" />
              </div>
              <Skeleton className="h-3.5 w-16 rounded" />
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="h-full border-[hsl(var(--border))] bg-[hsl(var(--card))] rounded-2xl flex flex-col overflow-hidden shadow-xs">
      {/* Compact Banner Area with Atmospheric Skeleton */}
      <div className="relative aspect-[16/8] sm:aspect-[2.1/1] w-full shrink-0 overflow-hidden bg-[hsl(var(--surface-subtle))]">
        <Skeleton className="w-full h-full rounded-none" />
        {/* Pinned Top-Left Corner Badge (Matching App Slider) */}
        <div className="absolute top-0 left-0 z-10">
          <Skeleton className="h-4.5 w-20 rounded-tl-none rounded-br-md" />
        </div>
      </div>

      {/* Body Area with Floating Squircle Icon */}
      <div className="relative flex flex-1 flex-col px-4 pt-0.5 pb-3">
        {/* Overlapping Floating Squircle Icon */}
        <div className="-mt-6 mb-1.5 flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-[hsl(var(--card))] ring-3 ring-[hsl(var(--card))] overflow-hidden shadow-md">
          <Skeleton className="w-full h-full rounded-lg" />
        </div>

        {/* Title & Category Row */}
        <div className="flex items-baseline justify-between gap-2">
          <Skeleton className="h-4.5 w-3/5 rounded-md" />
          <Skeleton className="h-3 w-16 rounded font-mono" />
        </div>

        {/* Rating Stars Skeleton */}
        <div className="flex items-center gap-1 mt-0.5">
          <Skeleton className="h-2.5 w-16 rounded" />
          <Skeleton className="h-2.5 w-8 rounded" />
        </div>

        {/* Description Skeleton */}
        <div className="space-y-1.5 mt-1 flex-1">
          <Skeleton className="h-3 w-full rounded" />
          <Skeleton className="h-3 w-4/5 rounded" />
        </div>

        {/* Footer: Platforms & Explore CTA */}
        <div className="flex items-center justify-between gap-2 mt-auto pt-2.5 border-t border-[hsl(var(--border-subtle))]">
          <div className="flex items-center gap-1">
            <Skeleton className="h-5 w-12 rounded-lg" />
            <Skeleton className="h-5 w-10 rounded-lg" />
          </div>
          <Skeleton className="h-3.5 w-14 rounded ml-auto" />
        </div>
      </div>
    </Card>
  );
}
