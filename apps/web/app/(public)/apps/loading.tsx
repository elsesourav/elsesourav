import * as React from 'react';
import { AppCardSkeleton } from '@/features/apps/components/AppCardSkeleton';
import { Skeleton, Card } from '@elsesourav/ui';

export default function AppsLoading() {
  return (
    <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 space-y-10 sm:space-y-12">
        {/* 1. Very Top: Apps Title & Subtitle Skeleton (No project count badge) */}
        <div className="space-y-2">
          <Skeleton className="h-9 sm:h-11 md:h-12 w-44 sm:w-56 rounded-2xl" />
          <Skeleton className="h-4 sm:h-5 w-80 sm:w-96 max-w-full rounded-lg" />
        </div>

        {/* 2. Top Hero Section: Desktop 2-column split (40% Left / 60% Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 lg:gap-8 items-start">
          {/* Desktop Left (40%) / Mobile & Tablet Bottom: Search & Filters Panel Skeleton */}
          <div className="order-2 lg:order-1 lg:col-span-4">
            <Card className="rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 sm:p-5 lg:p-6 space-y-4">
              {/* Search bar & Dropdowns */}
              <div className="space-y-2.5">
                <Skeleton className="h-10 w-full rounded-xl" />
                {/* Category Dropdown Skeleton */}
                <Skeleton className="h-9 w-full rounded-xl" />
                {/* Platform & Sort 2-column Dropdowns Skeleton */}
                <div className="grid grid-cols-2 gap-2">
                  <Skeleton className="h-9 rounded-xl" />
                  <Skeleton className="h-9 rounded-xl" />
                </div>
              </div>

              {/* Topics Pills Skeleton */}
              <div className="space-y-2 pt-1">
                <Skeleton className="h-3 w-16 rounded" />
                <div className="flex flex-wrap gap-1">
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-5 w-12 rounded-full" />
                  <Skeleton className="h-5 w-20 rounded-full" />
                  <Skeleton className="h-5 w-22 rounded-full" />
                  <Skeleton className="h-5 w-14 rounded-full" />
                  <Skeleton className="h-5 w-18 rounded-full" />
                </div>
              </div>
            </Card>
          </div>

          {/* Desktop Right (60%) / Mobile & Tablet Top: Featured MorphSlider Skeleton */}
          <div className="order-1 lg:order-2 lg:col-span-6">
            <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] lg:aspect-[16/10] min-h-[250px] sm:min-h-[290px] lg:min-h-[360px] max-h-[460px] rounded-3xl overflow-hidden border border-white/10 bg-[#0a0a0c] p-6 sm:p-8 flex flex-col justify-end shadow-2xl">
              <div className="space-y-3 z-10 max-w-lg">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-32 rounded-full bg-white/15" />
                  <Skeleton className="h-4 w-12 rounded bg-white/10" />
                </div>
                <Skeleton className="h-8 sm:h-10 w-64 rounded-xl bg-white/20" />
                <Skeleton className="h-4 w-full rounded bg-white/10" />
                <Skeleton className="h-4 w-4/5 rounded bg-white/10" />
                <div className="pt-2 flex items-center gap-3">
                  <Skeleton className="h-8 w-24 rounded-xl bg-white/15" />
                  <Skeleton className="h-8 w-32 rounded-xl bg-white/15" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Catalog Grid Section Skeleton */}
        <div className="space-y-6 pt-4">
          <div className="flex items-center justify-between pb-3 border-b border-[hsl(var(--border-subtle))]">
            <Skeleton className="h-4 w-44 rounded" />
            <Skeleton className="h-4 w-20 rounded" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, idx) => (
              <AppCardSkeleton key={idx} variant="catalog" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
