import * as React from 'react';
import { Card, Skeleton, SkeletonBadge } from '@elsesourav/ui';

export default function ArchiveLoading() {
  return (
    <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 space-y-12">
        {/* Page Header Skeleton */}
        <div className="space-y-3 max-w-2xl">
          <Skeleton className="h-4 w-36 rounded-md font-mono" />
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 sm:h-11 w-56 rounded-2xl" />
            <SkeletonBadge className="w-24 h-6" />
          </div>
          <Skeleton className="h-4 sm:h-5 w-full rounded-lg" />
          <Skeleton className="h-4 w-3/4 rounded-lg" />
        </div>

        {/* Filter Strip Skeleton */}
        <Card className="p-5 rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              <Skeleton className="h-7 w-20 rounded-xl" />
              <Skeleton className="h-7 w-16 rounded-xl" />
              <Skeleton className="h-7 w-16 rounded-xl" />
              <Skeleton className="h-7 w-16 rounded-xl" />
            </div>
            <Skeleton className="h-8 w-44 rounded-xl" />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
            <Skeleton className="h-6 w-14 rounded-lg" />
            <Skeleton className="h-6 w-24 rounded-lg" />
            <Skeleton className="h-6 w-28 rounded-lg" />
            <Skeleton className="h-6 w-20 rounded-lg" />
            <Skeleton className="h-6 w-24 rounded-lg" />
          </div>
        </Card>

        {/* Chronological Timeline Groups */}
        <div className="space-y-12">
          {/* Year Group 1 */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 pb-2 border-b border-[hsl(var(--border-subtle))]">
              <Skeleton className="w-8 h-8 rounded-xl" />
              <Skeleton className="h-6 w-20 rounded-lg" />
              <SkeletonBadge className="w-16 h-5 ml-auto" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card
                  key={i}
                  className="p-5 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-28 rounded" />
                    <Skeleton className="h-4 w-12 rounded" />
                  </div>
                  <Skeleton className="h-5 w-48 rounded-lg" />
                  <Skeleton className="h-3.5 w-full rounded" />
                  <Skeleton className="h-3.5 w-4/5 rounded" />
                  <div className="pt-2 flex items-center justify-between">
                    <Skeleton className="h-4 w-20 rounded" />
                    <Skeleton className="w-4 h-4 rounded" />
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Year Group 2 */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 pb-2 border-b border-[hsl(var(--border-subtle))]">
              <Skeleton className="w-8 h-8 rounded-xl" />
              <Skeleton className="h-6 w-20 rounded-lg" />
              <SkeletonBadge className="w-16 h-5 ml-auto" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card
                  key={i}
                  className="p-5 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-28 rounded" />
                    <Skeleton className="h-4 w-12 rounded" />
                  </div>
                  <Skeleton className="h-5 w-48 rounded-lg" />
                  <Skeleton className="h-3.5 w-full rounded" />
                  <Skeleton className="h-3.5 w-4/5 rounded" />
                  <div className="pt-2 flex items-center justify-between">
                    <Skeleton className="h-4 w-20 rounded" />
                    <Skeleton className="w-4 h-4 rounded" />
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
