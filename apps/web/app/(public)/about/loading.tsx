import * as React from 'react';
import { Card, Skeleton, SkeletonBadge } from '@elsesourav/ui';

export default function AboutLoading() {
  return (
    <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 space-y-16">
        {/* ==================================================================
            1. CREATOR INTRO HERO SKELETON
            ================================================================== */}
        <section aria-label="Loading creator profile" className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start gap-6 sm:gap-8">
            <Skeleton className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl shrink-0" />
            <div className="space-y-3 flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <Skeleton className="h-8 sm:h-10 w-56 rounded-xl" />
                <SkeletonBadge className="w-28 h-6" />
              </div>
              <Skeleton className="h-5 w-72 rounded-md" />
              <div className="space-y-2 pt-1">
                <Skeleton className="h-4 w-full rounded-md" />
                <Skeleton className="h-4 w-5/6 rounded-md" />
              </div>
              {/* Social links row */}
              <div className="flex flex-wrap gap-2 pt-2">
                <Skeleton className="h-8 w-24 rounded-full" />
                <Skeleton className="h-8 w-24 rounded-full" />
                <Skeleton className="h-8 w-28 rounded-full" />
                <Skeleton className="h-8 w-20 rounded-full" />
              </div>
            </div>
          </div>
        </section>

        {/* ==================================================================
            2. CURRENT FOCUS / LAB STATUS SKELETON
            ================================================================== */}
        <section aria-label="Loading current focus" className="space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[hsl(var(--border-subtle))]">
            <Skeleton className="h-4 w-36 rounded" />
          </div>
          <Card className="p-6 sm:p-8 rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 rounded-2xl bg-[hsl(var(--surface-subtle))] space-y-3">
                <Skeleton className="h-4 w-28 rounded" />
                <Skeleton className="h-5 w-48 rounded-md" />
                <Skeleton className="h-3.5 w-full rounded" />
              </div>
              <div className="p-4 rounded-2xl bg-[hsl(var(--surface-subtle))] space-y-3">
                <Skeleton className="h-4 w-28 rounded" />
                <Skeleton className="h-5 w-48 rounded-md" />
                <Skeleton className="h-3.5 w-full rounded" />
              </div>
            </div>
          </Card>
        </section>

        {/* ==================================================================
            3. CAPABILITY MAP SKELETON (3-Column Grid)
            ================================================================== */}
        <section aria-label="Loading capability map" className="space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-4 w-32 rounded font-mono uppercase" />
            <Skeleton className="h-8 w-60 rounded-xl" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, idx) => (
              <Card key={idx} className="p-5 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] space-y-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-10 h-10 rounded-xl" />
                  <Skeleton className="h-5 w-32 rounded" />
                </div>
                <div className="space-y-2 pt-2">
                  <Skeleton className="h-3.5 w-full rounded" />
                  <Skeleton className="h-3.5 w-5/6 rounded" />
                  <Skeleton className="h-3.5 w-4/6 rounded" />
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* ==================================================================
            4. PRINCIPLES & PHILOSOPHY SKELETON
            ================================================================== */}
        <section aria-label="Loading philosophy" className="space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-4 w-28 rounded font-mono uppercase" />
            <Skeleton className="h-8 w-72 rounded-xl" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, idx) => (
              <Card key={idx} className="p-6 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] space-y-3">
                <Skeleton className="h-5 w-40 rounded-lg" />
                <Skeleton className="h-3.5 w-full rounded" />
                <Skeleton className="h-3.5 w-4/5 rounded" />
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
