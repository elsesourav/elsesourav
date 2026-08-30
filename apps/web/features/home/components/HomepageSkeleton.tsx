import * as React from 'react';
import { Card, Skeleton, SkeletonBadge, SkeletonButton, Container } from '@elsesourav/ui';
import { AppCardSkeleton } from '@/features/apps/components/AppCardSkeleton';
import { BlogCardSkeleton } from '@/features/blog/components/BlogCardSkeleton';

export function HomepageSkeleton() {
  return (
    <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))] overflow-hidden">
      <Container className="py-8 sm:py-12 lg:py-16 space-y-16 sm:space-y-24">
        {/* ==================================================================
            1. HERO SECTION SKELETON (Two-Column Asymmetric Grid)
            ================================================================== */}
        <section aria-label="Loading hero" className="relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Column: Identity, Statement, CTA */}
            <div className="lg:col-span-6 space-y-6 sm:space-y-8">
              {/* Studio badge & greeting */}
              <div className="space-y-3">
                <SkeletonBadge className="w-48 h-7 rounded-full" />
                <Skeleton className="h-7 w-36 rounded-lg" />
              </div>

              {/* Massive 3-line Headline Statement */}
              <div className="space-y-3">
                <Skeleton className="h-10 sm:h-12 w-full rounded-xl" />
                <Skeleton className="h-10 sm:h-12 w-11/12 rounded-xl" />
                <Skeleton className="h-10 sm:h-12 w-4/5 rounded-xl" />
              </div>

              {/* Supporting context */}
              <div className="space-y-2 max-w-xl">
                <Skeleton className="h-4.5 w-full rounded-md" />
                <Skeleton className="h-4.5 w-5/6 rounded-md" />
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <SkeletonButton className="w-36 h-12 rounded-xl" />
                <SkeletonButton className="w-32 h-12 rounded-xl" />
              </div>

              {/* Status indicator */}
              <div className="pt-2 flex items-center gap-2">
                <Skeleton className="w-2.5 h-2.5 rounded-full" />
                <Skeleton className="h-3.5 w-56 rounded" />
              </div>
            </div>

            {/* Right Column: Flagship Window & Live Project Cards */}
            <div className="lg:col-span-6 space-y-4">
              {/* Flagship App Mockup Window */}
              <Card className="rounded-3xl border border-[hsl(var(--border-strong))] bg-[hsl(var(--card))] p-4 sm:p-6 shadow-2xl space-y-4 overflow-hidden">
                {/* Window Titlebar */}
                <div className="flex items-center justify-between pb-3 border-b border-[hsl(var(--border-subtle))]">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-500/30" />
                    <span className="w-3 h-3 rounded-full bg-amber-500/30" />
                    <span className="w-3 h-3 rounded-full bg-emerald-500/30" />
                  </div>
                  <Skeleton className="h-3.5 w-28 rounded" />
                  <SkeletonBadge className="w-20 h-5" />
                </div>

                {/* Window Main Visual Preview */}
                <div className="aspect-[16/10] w-full rounded-2xl overflow-hidden bg-[hsl(var(--surface-subtle))] border border-[hsl(var(--border-subtle))]">
                  <Skeleton className="w-full h-full rounded-2xl" />
                </div>

                {/* Window Details Footer */}
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-10 h-10 rounded-xl" />
                    <div className="space-y-1">
                      <Skeleton className="h-4.5 w-32 rounded" />
                      <Skeleton className="h-3 w-48 rounded" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-20 rounded" />
                </div>
              </Card>

              {/* Two secondary project preview tiles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card className="p-4 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <Skeleton className="w-8 h-8 rounded-lg" />
                    <Skeleton className="h-3.5 w-12 rounded" />
                  </div>
                  <Skeleton className="h-4 w-3/4 rounded" />
                  <Skeleton className="h-3 w-full rounded" />
                </Card>
                <Card className="p-4 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <Skeleton className="w-8 h-8 rounded-lg" />
                    <Skeleton className="h-3.5 w-12 rounded" />
                  </div>
                  <Skeleton className="h-4 w-3/4 rounded" />
                  <Skeleton className="h-3 w-full rounded" />
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* ==================================================================
            2. FEATURED APPS SECTION SKELETON
            ================================================================== */}
        <section aria-label="Loading featured apps" className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-[hsl(var(--border-subtle))]">
            <div className="space-y-2">
              <Skeleton className="h-3.5 w-24 rounded font-mono uppercase" />
              <Skeleton className="h-8 w-64 rounded-xl" />
              <Skeleton className="h-4 w-96 max-w-full rounded" />
            </div>
            <Skeleton className="h-4 w-28 rounded" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <AppCardSkeleton variant="catalog" />
            <AppCardSkeleton variant="catalog" />
            <AppCardSkeleton variant="catalog" />
          </div>
        </section>

        {/* ==================================================================
            3. WRITING & NOTES SECTION SKELETON
            ================================================================== */}
        <section aria-label="Loading recent notes" className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-[hsl(var(--border-subtle))]">
            <div className="space-y-2">
              <Skeleton className="h-3.5 w-24 rounded font-mono uppercase" />
              <Skeleton className="h-8 w-56 rounded-xl" />
              <Skeleton className="h-4 w-80 max-w-full rounded" />
            </div>
            <Skeleton className="h-4 w-28 rounded" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <BlogCardSkeleton />
            <BlogCardSkeleton />
            <BlogCardSkeleton />
          </div>
        </section>
      </Container>
    </div>
  );
}
