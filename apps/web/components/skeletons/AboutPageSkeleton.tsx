import * as React from 'react';
import { Card, PageShell, Skeleton, SkeletonBadge } from '@elsesourav/ui';

/**
 * High-fidelity in-page content skeleton for the About page.
 * Mirrors the exact section structure, card borders, responsive breakpoints,
 * aspect ratios, and side-by-side hero layout of the real About page to eliminate layout shifts.
 */
export function AboutPageSkeleton() {
  return (
    <PageShell size="lg" glow containerClassName="px-3 sm:px-6 lg:px-8">
      <div className="space-y-4 sm:space-y-6 md:space-y-8 lg:space-y-10 max-w-6xl mx-auto" aria-busy="true" aria-label="Loading About page content">
        {/* 1. Hero Profile Showcase Skeleton */}
        <section className="space-y-3 sm:space-y-4" aria-hidden="true">
          {/* Eyebrow Header */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 sm:pb-3 border-b border-[hsl(var(--border-subtle))]">
            <div className="flex items-center gap-2">
              <Skeleton className="h-3.5 sm:h-4 w-32 rounded-md" />
              <SkeletonBadge className="w-24 h-5" />
            </div>
          </div>

          {/* Main Profile Showcase Card */}
          <div className="p-3 sm:p-5 md:p-8 lg:p-10 rounded-2xl sm:rounded-3xl border border-[hsl(var(--border-subtle))] sm:border-[hsl(var(--border))] bg-[hsl(var(--card))] backdrop-blur-xl shadow-xl sm:shadow-2xl">
            <div className="grid grid-cols-1 min-[650px]:grid-cols-12 gap-4 sm:gap-6 lg:gap-10 xl:gap-12 items-center">
              {/* Interactive Portrait on Left (Centered on Mobile < 650, Side-by-Side >= 650) */}
              <div className="min-[650px]:col-span-6 lg:col-span-6 xl:col-span-7 flex items-center justify-center w-full mx-auto">
                <div className="relative w-full rounded-xl sm:rounded-2xl md:rounded-3xl p-1 sm:p-2 border border-[hsl(var(--border-subtle))] sm:border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-lg sm:shadow-2xl max-w-[210px] min-[380px]:max-w-[250px] min-[500px]:max-w-[290px] min-[650px]:max-w-[340px] md:max-w-[380px] lg:max-w-[460px] xl:max-w-[500px]">
                  <div className="w-full aspect-square rounded-2xl bg-[hsl(var(--muted)/0.25)] relative overflow-hidden flex flex-col items-center justify-center border border-[hsl(var(--border-subtle))]">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full border-2 border-indigo-500/20 border-t-cyan-400 border-r-indigo-400 animate-spin mb-2 sm:mb-3" />
                    <Skeleton className="h-3 w-24 rounded-md" />
                  </div>
                </div>
              </div>

              {/* Bio & Creator Overview on Right */}
              <div className="min-[650px]:col-span-6 lg:col-span-6 xl:col-span-5 space-y-3 sm:space-y-4 text-center min-[650px]:text-left">
                <div className="pb-2.5 sm:pb-3.5 border-b border-[hsl(var(--border-subtle))] space-y-1.5 sm:space-y-2">
                  <Skeleton className="h-6 sm:h-8 w-44 sm:w-56 rounded-lg mx-auto min-[650px]:mx-0" />
                  <Skeleton className="h-3.5 sm:h-4 w-32 sm:w-40 rounded-md mx-auto min-[650px]:mx-0" />
                </div>

                <div className="space-y-2 sm:space-y-2.5 pt-1 text-left">
                  <Skeleton className="h-3.5 sm:h-4 w-full rounded-md" />
                  <Skeleton className="h-3.5 sm:h-4 w-11/12 rounded-md" />
                  <Skeleton className="h-3.5 sm:h-4 w-4/5 rounded-md" />
                  <Skeleton className="h-3.5 sm:h-4 w-3/4 rounded-md" />
                </div>

                <div className="flex flex-wrap items-center justify-center min-[650px]:justify-start gap-2 pt-2.5 sm:pt-3 border-t border-[hsl(var(--border-subtle))]">
                  <Skeleton className="h-7 sm:h-8 w-24 sm:w-28 rounded-lg" />
                  <Skeleton className="h-7 sm:h-8 w-24 sm:w-28 rounded-lg" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Core Motivation Skeleton */}
        <section className="space-y-2 sm:space-y-3" aria-hidden="true">
          <div className="p-3.5 sm:p-5 md:p-7 lg:p-8 rounded-xl sm:rounded-2xl md:rounded-3xl border border-[hsl(var(--border-subtle))] sm:border-[hsl(var(--border))] bg-[hsl(var(--card))] backdrop-blur-sm space-y-2.5 sm:space-y-3.5">
            <Skeleton className="h-3.5 w-28 rounded-md" />
            <Skeleton className="h-5 sm:h-7 w-3/4 max-w-lg rounded-lg" />
            <div className="space-y-2 pt-1">
              <Skeleton className="h-3.5 sm:h-4 w-full rounded-md" />
              <Skeleton className="h-3.5 sm:h-4 w-5/6 rounded-md" />
              <Skeleton className="h-3.5 sm:h-4 w-4/5 rounded-md" />
            </div>
          </div>
        </section>

        {/* 3. Project Journey Skeleton */}
        <section className="space-y-3 sm:space-y-4" aria-hidden="true">
          <div className="p-3.5 sm:p-5 md:p-7 lg:p-8 rounded-xl sm:rounded-2xl md:rounded-3xl border border-[hsl(var(--border-subtle))] sm:border-[hsl(var(--border))] bg-[hsl(var(--card))] space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-3.5 w-32 rounded-md" />
              <SkeletonBadge className="w-20 h-5" />
            </div>
            <Skeleton className="h-5 sm:h-6 w-1/2 max-w-sm rounded-lg" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 pt-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="p-3.5 sm:p-4 rounded-xl border border-[hsl(var(--border-subtle))] bg-[hsl(var(--card))] space-y-2 sm:space-y-2.5">
                  <Skeleton className="h-3.5 w-20 rounded-md" />
                  <Skeleton className="h-4 sm:h-5 w-3/4 rounded-md" />
                  <Skeleton className="h-3 w-full rounded-md" />
                  <Skeleton className="h-3 w-4/5 rounded-md" />
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </PageShell>
  );
}

/**
 * In-page content skeleton for the Archive page.
 */
export function ArchiveCatalogSkeleton() {
  return (
    <PageShell className="py-6 sm:py-8 space-y-6">
      <div className="space-y-2">
        <SkeletonBadge className="w-24 h-6" />
        <Skeleton className="h-9 w-64 sm:w-80 rounded-xl" />
        <Skeleton className="h-4 w-full max-w-xl rounded-md" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 pt-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="p-5 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="w-10 h-10 rounded-xl" />
              <SkeletonBadge className="w-16 h-5" />
            </div>
            <Skeleton className="h-5 w-40 rounded-lg" />
            <Skeleton className="h-4 w-full rounded-md" />
            <Skeleton className="h-4 w-3/4 rounded-md" />
          </Card>
        ))}
      </div>
    </PageShell>
  );
}
