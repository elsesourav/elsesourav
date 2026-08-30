import * as React from 'react';
import { Skeleton, SkeletonBadge, SkeletonButton, Card } from '@elsesourav/ui';

export default function AppDetailLoading() {
  return (
    <div className="min-h-[80vh] bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        {/* Breadcrumb skeleton */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-12 rounded" />
          <span className="text-[hsl(var(--subtle-foreground))]">/</span>
          <Skeleton className="h-4 w-20 rounded" />
          <span className="text-[hsl(var(--subtle-foreground))]">/</span>
          <Skeleton className="h-4 w-32 rounded" />
        </div>

        {/* 1. App Hero Card Skeleton */}
        <Card className="p-6 sm:p-9 rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-2xl space-y-6">
          <div className="flex flex-col md:flex-row items-start gap-6">
            {/* App Icon */}
            <Skeleton className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl shrink-0" />

            {/* Title & Core Copy */}
            <div className="flex-1 space-y-3.5 min-w-0 w-full">
              <div className="flex flex-wrap items-center gap-2.5">
                <Skeleton className="h-8 sm:h-10 w-64 rounded-xl" />
                <SkeletonBadge className="w-20 h-6" />
                <SkeletonBadge className="w-16 h-6" />
              </div>

              {/* Tagline / Subtitle */}
              <Skeleton className="h-5 w-4/5 rounded-md" />

              {/* Description lines */}
              <div className="space-y-2 pt-1">
                <Skeleton className="h-4 w-full rounded-md" />
                <Skeleton className="h-4 w-5/6 rounded-md" />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-[hsl(var(--border-subtle))]">
                <SkeletonButton className="w-36 h-11 rounded-xl" />
                <SkeletonButton className="w-32 h-11 rounded-xl" />
                <div className="ml-auto flex items-center gap-2">
                  <Skeleton className="w-10 h-10 rounded-xl" />
                  <Skeleton className="w-10 h-10 rounded-xl" />
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* 2. Visual Showcase / Screenshot Gallery Skeleton */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[hsl(var(--border-subtle))]">
            <Skeleton className="h-4 w-44 rounded" />
            <Skeleton className="h-4 w-20 rounded" />
          </div>
          <Card className="aspect-video w-full rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-2 sm:p-4 overflow-hidden">
            <Skeleton className="w-full h-full rounded-2xl" />
          </Card>
        </div>

        {/* 3. Project Story & Technical Architecture Skeleton */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[hsl(var(--border-subtle))]">
            <Skeleton className="h-4 w-48 rounded" />
          </div>
          <Card className="p-6 sm:p-10 rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] space-y-4">
            <Skeleton className="h-7 w-2/5 rounded-lg" />
            <div className="space-y-2 pt-2">
              <Skeleton className="h-4 w-full rounded-md" />
              <Skeleton className="h-4 w-full rounded-md" />
              <Skeleton className="h-4 w-4/5 rounded-md" />
            </div>
            <Skeleton className="h-32 w-full rounded-2xl mt-4" />
          </Card>
        </div>
      </div>
    </div>
  );
}
