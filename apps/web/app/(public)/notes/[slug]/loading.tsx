import * as React from 'react';
import { Skeleton, SkeletonBadge, SkeletonAvatar } from '@elsesourav/ui';

export default function BlogPostLoading() {
  return (
    <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 space-y-8">
        {/* Back Link & Category Badge */}
        <div className="space-y-4">
          <Skeleton className="h-4 w-28 rounded" />
          <SkeletonBadge className="w-24 h-6" />
        </div>

        {/* Title Statement */}
        <div className="space-y-3">
          <Skeleton className="h-10 sm:h-12 w-full rounded-xl" />
          <Skeleton className="h-10 sm:h-12 w-4/5 rounded-xl" />
        </div>

        {/* Excerpt Lead */}
        <div className="space-y-2 pt-1">
          <Skeleton className="h-5 w-full rounded-md" />
          <Skeleton className="h-5 w-3/4 rounded-md" />
        </div>

        {/* Author Bar Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 border-y border-[hsl(var(--border-subtle))]">
          <div className="flex items-center gap-3">
            <SkeletonAvatar className="w-10 h-10" />
            <div className="space-y-1.5">
              <Skeleton className="h-3.5 w-28 rounded" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-3 w-20 rounded" />
                <Skeleton className="h-3 w-16 rounded" />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-8 w-8 rounded-lg" />
          </div>
        </div>

        {/* Hero Cover Image Skeleton */}
        <div className="aspect-[16/9] w-full rounded-3xl overflow-hidden bg-[hsl(var(--surface-subtle))] border border-[hsl(var(--border-subtle))]">
          <Skeleton className="w-full h-full rounded-3xl" />
        </div>

        {/* Editorial Prose Content Lines */}
        <div className="space-y-6 pt-4 max-w-3xl">
          <div className="space-y-2.5">
            <Skeleton className="h-4 w-full rounded-md" />
            <Skeleton className="h-4 w-full rounded-md" />
            <Skeleton className="h-4 w-11/12 rounded-md" />
            <Skeleton className="h-4 w-4/5 rounded-md" />
          </div>

          <Skeleton className="h-8 w-56 rounded-xl pt-2" />

          <div className="space-y-2.5">
            <Skeleton className="h-4 w-full rounded-md" />
            <Skeleton className="h-4 w-full rounded-md" />
            <Skeleton className="h-4 w-3/4 rounded-md" />
          </div>

          {/* Callout quote box skeleton */}
          <div className="p-6 rounded-2xl bg-[hsl(var(--surface-subtle))] border border-[hsl(var(--border-subtle))] space-y-2">
            <Skeleton className="h-4 w-full rounded-md" />
            <Skeleton className="h-4 w-5/6 rounded-md" />
          </div>

          <div className="space-y-2.5">
            <Skeleton className="h-4 w-full rounded-md" />
            <Skeleton className="h-4 w-4/5 rounded-md" />
          </div>

          {/* Tags */}
          <div className="flex items-center gap-2 pt-6 border-t border-[hsl(var(--border-subtle))]">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
