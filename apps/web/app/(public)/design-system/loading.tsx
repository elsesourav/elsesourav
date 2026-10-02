import * as React from 'react';
import { Card, Skeleton, SkeletonBadge } from '@elsesourav/ui';

export default function DesignSystemLoading() {
  return (
    <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 space-y-12">
        {/* Header Skeleton */}
        <div className="space-y-3 max-w-2xl">
          <SkeletonBadge className="w-40 h-6" />
          <Skeleton className="h-9 sm:h-11 w-80 rounded-2xl" />
          <Skeleton className="h-4 sm:h-5 w-full rounded-lg" />
        </div>

        {/* Design System Primitives Sections Skeleton */}
        <div className="space-y-10">
          {/* Section 1: Buttons & Interactive */}
          <Card className="p-6 sm:p-8 rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] space-y-5">
            <Skeleton className="h-6 w-44 rounded-lg" />
            <div className="flex flex-wrap gap-3">
              <Skeleton className="h-10 w-28 rounded-xl" />
              <Skeleton className="h-10 w-28 rounded-xl" />
              <Skeleton className="h-10 w-28 rounded-xl" />
              <Skeleton className="h-10 w-24 rounded-xl" />
            </div>
          </Card>

          {/* Section 2: Form Controls */}
          <Card className="p-6 sm:p-8 rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] space-y-5">
            <Skeleton className="h-6 w-48 rounded-lg" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <div className="space-y-2">
                <Skeleton className="h-4 w-20 rounded" />
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-24 rounded" />
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-28 rounded" />
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
            </div>
          </Card>

          {/* Section 3: Cards & Glass Surfaces */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, idx) => (
              <Card
                key={idx}
                className="p-6 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] space-y-4"
              >
                <Skeleton className="w-10 h-10 rounded-xl" />
                <Skeleton className="h-5 w-36 rounded-lg" />
                <Skeleton className="h-3.5 w-full rounded" />
                <Skeleton className="h-3.5 w-4/5 rounded" />
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
