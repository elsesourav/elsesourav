import * as React from 'react';
import { Card, Skeleton, SkeletonBadge, SkeletonButton, SkeletonText, Container } from '@elsesourav/ui';
import { AppCardSkeleton } from '@/features/apps/components/AppCardSkeleton';

export function HomepageSkeleton() {
  return (
    <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))] overflow-hidden flex flex-col w-full selection:bg-indigo-500/30">
      {/* ==================================================================
          0. RESPONSIVE HEADER SKELETON (Matching PublicHeader Across Devices)
          ================================================================== */}
      <header
        aria-label="Loading navigation"
        className="sticky top-0 z-50 w-full h-16 border-b border-[hsl(var(--border))]/80 bg-[hsl(var(--background))]/80 backdrop-blur-md px-4 sm:px-6 lg:px-8 flex items-center justify-between"
      >
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <Skeleton className="w-8 h-8 rounded-xl shrink-0" />
          <Skeleton className="h-4 w-24 sm:w-28 rounded-md" />
        </div>

        {/* Desktop Nav Links (Hidden on mobile) */}
        <div className="hidden md:flex items-center gap-1.5 p-1 rounded-xl bg-[hsl(var(--surface-subtle))]/40 border border-[hsl(var(--border-subtle))]">
          <Skeleton className="h-6 w-14 rounded-lg" />
          <Skeleton className="h-6 w-16 rounded-lg" />
          <Skeleton className="h-6 w-16 rounded-lg" />
          <Skeleton className="h-6 w-14 rounded-lg" />
        </div>

        {/* Right Action Icons (Responsive on mobile vs desktop) */}
        <div className="flex items-center gap-2">
          <Skeleton className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl shrink-0" />
          <Skeleton className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl shrink-0" />
          <Skeleton className="hidden md:block h-8 w-20 rounded-full ml-1" />
          <Skeleton className="md:hidden w-8 h-8 rounded-xl shrink-0" />
        </div>
      </header>

      {/* ==================================================================
          1. HERO SECTION SKELETON (Matching HomeHero Layout Across Devices)
          ================================================================== */}
      <section
        aria-label="Loading hero"
        className="relative isolate overflow-hidden min-h-[100dvh] sm:min-h-[720px] lg:min-h-[800px] xl:min-h-[860px] flex items-center justify-center pt-16 sm:pt-24 lg:pt-28 pb-10 sm:pb-16 border-b border-[hsl(var(--border-subtle))]"
      >
        {/* Ambient background bloom */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none select-none overflow-hidden -z-10"
        >
          <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[500px] h-[340px] sm:h-[500px] bg-indigo-500/10 blur-[100px] sm:blur-[120px] rounded-full" />
          <div className="absolute top-1/3 right-1/4 w-[300px] sm:w-[450px] h-[300px] sm:h-[450px] bg-violet-500/10 blur-[110px] sm:blur-[130px] rounded-full" />
        </div>

        <Container size="full" className="max-w-[1536px] px-4 sm:px-6 lg:px-8 xl:px-12 my-auto relative">
          {/* Mobile-Only Floating Island Skeleton Silhouette (Matches HomeHero mobile island position & size) */}
          <div
            aria-hidden="true"
            className="md:hidden absolute -right-6 sm:-right-4 -top-6 sm:top-0 w-[240px] sm:w-[320px] aspect-[4/3] rounded-3xl bg-[hsl(var(--surface-subtle))]/60 border border-[hsl(var(--border-subtle))]/40 skeleton-shimmer blur-sm pointer-events-none select-none z-0"
          />

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-6 items-center relative z-10">
            {/* Left Column: Studio Narrative & CTAs (7 columns on desktop/tablet) */}
            <div className="md:col-span-7 xl:col-span-7 space-y-5 sm:space-y-6 max-w-2xl lg:max-w-[44rem] xl:max-w-[48rem]">
              {/* Studio Pill Badge */}
              <div>
                <SkeletonBadge className="w-36 sm:w-44 h-6 sm:h-7 rounded-full" />
              </div>

              {/* Responsive Headline Statement */}
              <div className="space-y-2.5 sm:space-y-3 pt-1">
                <Skeleton className="h-8 sm:h-10 md:h-12 lg:h-14 w-full rounded-xl" />
                <Skeleton className="h-8 sm:h-10 md:h-12 lg:h-14 w-11/12 rounded-xl" />
                <Skeleton className="h-8 sm:h-10 md:h-12 lg:h-14 w-4/5 rounded-xl" />
              </div>

              {/* Supporting Subtext */}
              <div className="space-y-2 max-w-xl pt-1">
                <SkeletonText lines={2} className="h-3.5 sm:h-4" lastLineWidth="75%" />
              </div>

              {/* Action Buttons Cluster (Full-width on small mobile, auto on tablet/desktop) */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2 sm:pt-3">
                <SkeletonButton className="w-full sm:w-36 h-11 rounded-full" />
                <SkeletonButton className="w-full sm:w-32 h-11 rounded-full" />
              </div>

              {/* 3 Trust Metrics (Responsive compact grid) */}
              <div className="pt-5 sm:pt-6 grid grid-cols-3 gap-2 sm:gap-4 max-w-lg border-t border-[hsl(var(--border-subtle))]">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                    <Skeleton className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl shrink-0" />
                    <div className="space-y-1 min-w-0 flex-1">
                      <Skeleton className="h-3 sm:h-3.5 w-8 sm:w-12 rounded" />
                      <Skeleton className="h-2.5 sm:h-3 w-12 sm:w-16 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Floating Island & 3D Live Canvas Placeholder (Desktop & Tablet only) */}
            <div className="hidden md:flex md:col-span-5 xl:col-span-5 justify-center md:justify-end relative w-full h-[420px] md:h-[460px] lg:h-[500px]">
              <div className="w-full h-full rounded-3xl border border-[hsl(var(--border))] bg-gradient-to-b from-[hsl(var(--card))]/60 to-[hsl(var(--surface-subtle))]/40 backdrop-blur-md p-6 relative overflow-hidden flex flex-col items-center justify-center space-y-5">
                {/* Stylized Island & Screen Mockup Frame */}
                <div className="relative w-4/5 aspect-[16/10] rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface-subtle))] flex flex-col items-center justify-center p-4 space-y-3 overflow-hidden">
                  <div className="flex items-center justify-between w-full pb-2 border-b border-[hsl(var(--border-subtle))]">
                    <div className="flex gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500/30" />
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500/30" />
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/30" />
                    </div>
                    <Skeleton className="h-2.5 w-20 rounded" />
                  </div>
                  <Skeleton className="w-full h-full rounded-lg" />
                </div>

                {/* Floating Island base graphic placeholder */}
                <div className="w-3/5 h-6 rounded-full bg-[hsl(var(--surface-subtle))] skeleton-shimmer border border-[hsl(var(--border-subtle))]" />
                <div className="flex items-center gap-2">
                  <Skeleton className="w-2 h-2 rounded-full" />
                  <Skeleton className="h-3 w-28 rounded" />
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ==================================================================
          2. SELECTED APPS SECTION SKELETON
          ================================================================== */}
      <section
        aria-label="Loading selected apps"
        className="py-14 sm:py-20 lg:py-24 bg-[#f8fafc] dark:bg-[#07090e] border-b border-[hsl(var(--border-subtle))]"
      >
        <Container size="lg" className="space-y-6 sm:space-y-8">
          {/* Responsive Header: Stacked on mobile, side-by-side on desktop */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6 pb-6 border-b border-slate-200/80 dark:border-white/10">
            <div className="space-y-2.5 sm:space-y-3 max-w-2xl">
              <SkeletonBadge className="w-28 sm:w-32 h-5 sm:h-6 rounded-full" />
              <Skeleton className="h-8 sm:h-10 w-48 sm:w-64 rounded-xl" />
              <Skeleton className="h-3.5 sm:h-4 w-72 sm:w-96 max-w-full rounded" />
            </div>
            <SkeletonButton className="w-36 sm:w-40 h-8 sm:h-9 rounded-full shrink-0" />
          </div>

          {/* Featured Lead App Card (Responsive internally) */}
          <AppCardSkeleton variant="featured" />

          {/* Supporting Apps Grid:
              - Mobile (< md): Displays 2 cards for optimal screen length
              - Tablet & Desktop (md:): Displays all 4 cards in 2x2 grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 pt-2">
            <AppCardSkeleton variant="catalog" />
            <AppCardSkeleton variant="catalog" />
            <div className="hidden md:block">
              <AppCardSkeleton variant="catalog" />
            </div>
            <div className="hidden md:block">
              <AppCardSkeleton variant="catalog" />
            </div>
          </div>

          {/* Bottom Catalog Exploration Banner */}
          <div className="mt-8 sm:mt-12 p-5 sm:p-8 rounded-2xl border border-indigo-500/20 dark:border-white/10 bg-gradient-to-r from-indigo-500/5 via-violet-500/5 to-purple-500/5 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-5 text-center sm:text-left">
            <div className="space-y-2">
              <Skeleton className="h-4 sm:h-4.5 w-48 sm:w-60 rounded" />
              <Skeleton className="h-3 sm:h-3.5 w-64 sm:w-80 max-w-full rounded" />
            </div>
            <SkeletonButton className="w-full sm:w-44 h-9 sm:h-10 rounded-full shrink-0" />
          </div>
        </Container>
      </section>

      {/* ==================================================================
          3. LATEST UPDATES (FIELD NOTES) SKELETON
          ================================================================== */}
      <section
        aria-label="Loading latest updates"
        className="py-14 sm:py-20 lg:py-24 border-b border-[hsl(var(--border-subtle))]"
      >
        <Container size="lg" className="space-y-6 sm:space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4 pb-4 border-b border-[hsl(var(--border-subtle))]">
            <div className="space-y-2">
              <SkeletonBadge className="w-20 h-5 rounded-full" />
              <Skeleton className="h-7 sm:h-8 w-44 sm:w-56 rounded-xl" />
              <Skeleton className="h-3.5 sm:h-4 w-60 sm:w-80 max-w-full rounded" />
            </div>
            <Skeleton className="h-3.5 sm:h-4 w-28 rounded shrink-0" />
          </div>

          {/* Responsive Layout:
              - Mobile & Tablet (< lg): Stacked column (Lead essay on top, supporting post below)
              - Desktop (lg:): 12-column grid (7 cols lead + 5 cols supporting) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 lg:gap-8 items-stretch pt-2">
            {/* Lead Editorial Essay */}
            <div className="lg:col-span-7">
              <Card className="h-full border border-[hsl(var(--border))] bg-gradient-to-br from-[hsl(var(--card))] to-[hsl(var(--surface-subtle))] p-5 sm:p-8 md:p-9 rounded-3xl flex flex-col justify-between space-y-5 sm:space-y-6">
                <div className="space-y-3.5 sm:space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-[hsl(var(--border-subtle))]">
                    <SkeletonBadge className="w-24 sm:w-28 h-4 sm:h-5" />
                    <Skeleton className="h-3 w-16 sm:w-20 rounded" />
                  </div>
                  <Skeleton className="h-6 sm:h-8 w-11/12 rounded-lg" />
                  <Skeleton className="h-6 sm:h-8 w-3/4 rounded-lg" />
                  <div className="space-y-2 pt-1 sm:pt-2">
                    <SkeletonText lines={3} className="h-3.5 sm:h-4" />
                  </div>
                </div>
                <div className="flex items-center justify-between pt-4 sm:pt-6 border-t border-[hsl(var(--border-subtle))]">
                  <Skeleton className="h-3 sm:h-3.5 w-24 sm:w-28 rounded" />
                  <Skeleton className="h-3 sm:h-3.5 w-20 sm:w-24 rounded" />
                </div>
              </Card>
            </div>

            {/* Supporting Posts:
                - Mobile (< sm): Shows 1 supporting post to maintain balanced vertical rhythm
                - Tablet & Desktop (sm:): Shows both supporting posts */}
            <div className="lg:col-span-5 flex flex-col gap-4 sm:gap-5 justify-between">
              <Card className="p-5 sm:p-6 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] flex flex-col justify-between space-y-4 flex-1">
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between pb-2 border-b border-[hsl(var(--border-subtle))]">
                    <SkeletonBadge className="w-20 h-4" />
                    <Skeleton className="h-3 w-16 rounded" />
                  </div>
                  <Skeleton className="h-5 w-4/5 rounded-md" />
                  <SkeletonText lines={2} className="h-3 sm:h-3.5" />
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-[hsl(var(--border-subtle))]">
                  <Skeleton className="h-3 w-24 rounded" />
                  <Skeleton className="h-3 w-16 rounded" />
                </div>
              </Card>

              <div className="hidden sm:block flex-1">
                <Card className="h-full p-5 sm:p-6 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] flex flex-col justify-between space-y-4">
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between pb-2 border-b border-[hsl(var(--border-subtle))]">
                      <SkeletonBadge className="w-20 h-4" />
                      <Skeleton className="h-3 w-16 rounded" />
                    </div>
                    <Skeleton className="h-5 w-4/5 rounded-md" />
                    <SkeletonText lines={2} className="h-3 sm:h-3.5" />
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-[hsl(var(--border-subtle))]">
                    <Skeleton className="h-3 w-24 rounded" />
                    <Skeleton className="h-3 w-16 rounded" />
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ==================================================================
          4. GUIDING PHILOSOPHY SECTION SKELETON
          ================================================================== */}
      <section
        aria-label="Loading philosophy"
        className="py-14 sm:py-20 lg:py-24 bg-[#f8fafc] dark:bg-[#07090e] border-b border-[hsl(var(--border-subtle))]"
      >
        <Container size="full" className="max-w-[1536px] px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Left Column: Creator Identity & Statement (5 cols on desktop) */}
            <div className="lg:col-span-5 space-y-4 sm:space-y-5">
              <SkeletonBadge className="w-32 sm:w-36 h-5 sm:h-6 rounded-full" />
              <Skeleton className="h-7 sm:h-9 w-4/5 rounded-xl" />
              <div className="space-y-2 pt-1 sm:pt-2">
                <SkeletonText lines={3} className="h-3.5 sm:h-4" />
              </div>
              <Card className="p-4 sm:p-5 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] space-y-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <Skeleton className="h-3.5 sm:h-4 w-28 rounded" />
                    <Skeleton className="h-2.5 sm:h-3 w-36 rounded" />
                  </div>
                </div>
                <SkeletonText lines={2} className="h-3 sm:h-3.5" />
              </Card>
            </div>

            {/* Right Column: Principles Grid (7 cols on desktop):
                - Mobile (< sm): 1 column showing 3 principles to avoid excessive vertical scrolling
                - Tablet & Desktop (sm:): 2 columns showing all 6 principles */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className={i >= 3 ? 'hidden sm:block' : ''}>
                  <Card className="p-4 sm:p-5 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] space-y-3">
                    <div className="flex items-center justify-between">
                      <Skeleton className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl" />
                      <Skeleton className="h-3.5 w-6 rounded font-mono" />
                    </div>
                    <Skeleton className="h-4.5 sm:h-5 w-28 sm:w-32 rounded-md" />
                    <SkeletonText lines={2} className="h-3 sm:h-3.5" lastLineWidth="80%" />
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* ==================================================================
          5. STUDIO DOORWAY SECTION SKELETON
          ================================================================== */}
      <section aria-label="Loading studio pathways" className="py-14 sm:py-20">
        <Container size="lg">
          <div className="rounded-3xl border border-[hsl(var(--border))] bg-gradient-to-b from-[hsl(var(--card))] to-[hsl(var(--surface-subtle))] p-6 sm:p-10 md:p-12 text-center space-y-6 sm:space-y-8">
            <div className="space-y-2.5 sm:space-y-3 max-w-xl mx-auto flex flex-col items-center">
              <SkeletonBadge className="w-28 sm:w-32 h-5 sm:h-6 rounded-full" />
              <Skeleton className="h-7 sm:h-9 w-60 sm:w-72 rounded-xl" />
              <SkeletonText lines={2} className="h-3 sm:h-3.5 max-w-md mx-auto" />
            </div>

            {/* 3 Pathway Cards: Stacked on mobile (< sm), 3 columns on tablet/desktop */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 max-w-4xl mx-auto">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card
                  key={i}
                  className="p-5 sm:p-6 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-left space-y-3 sm:space-y-4"
                >
                  <Skeleton className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl" />
                  <div className="space-y-1.5">
                    <Skeleton className="h-4.5 sm:h-5 w-24 sm:w-28 rounded-md" />
                    <SkeletonText lines={2} className="h-2.5 sm:h-3" />
                  </div>
                  <Skeleton className="h-3 w-16 sm:w-20 rounded" />
                </Card>
              ))}
            </div>

            {/* Bottom Support Link */}
            <div className="pt-2 flex items-center justify-center gap-2">
              <Skeleton className="w-3.5 h-3.5 rounded-full" />
              <Skeleton className="h-3 sm:h-3.5 w-48 sm:w-64 rounded" />
            </div>
          </div>
        </Container>
      </section>

      {/* ==================================================================
          6. RESPONSIVE FOOTER SKELETON (Matching PublicFooter Across Devices)
          ================================================================== */}
      <footer
        aria-label="Loading footer"
        className="border-t border-[hsl(var(--border))]/80 bg-[hsl(var(--background))]/95 pt-12 sm:pt-16 pb-10 text-sm"
      >
        <Container size="lg" className="space-y-10 sm:space-y-12">
          {/* Main Footer Grid: 1 column on mobile, 4 columns on tablet & desktop */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-8">
            {/* Brand Column (5 cols on desktop) */}
            <div className="md:col-span-5 space-y-4">
              <div className="flex items-center gap-3">
                <Skeleton className="w-8 h-8 rounded-xl shrink-0" />
                <Skeleton className="h-4.5 w-32 rounded" />
              </div>
              <SkeletonText lines={2} className="h-3 max-w-sm" />
              <div className="flex items-center gap-2 pt-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="w-8 h-8 rounded-lg" />
                ))}
              </div>
            </div>

            {/* Link Columns (7 cols on desktop: 3 sub-columns on tablet/desktop, compact stack on mobile) */}
            <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-6 sm:gap-8">
              {/* Apps */}
              <div className="space-y-3">
                <Skeleton className="h-4 w-16 rounded" />
                <div className="space-y-2">
                  <Skeleton className="h-3 w-24 rounded" />
                  <Skeleton className="h-3 w-20 rounded" />
                  <Skeleton className="h-3 w-28 rounded" />
                </div>
              </div>

              {/* Updates */}
              <div className="space-y-3">
                <Skeleton className="h-4 w-16 rounded" />
                <div className="space-y-2">
                  <Skeleton className="h-3 w-20 rounded" />
                  <Skeleton className="h-3 w-24 rounded" />
                  <Skeleton className="h-3 w-16 rounded" />
                </div>
              </div>

              {/* Studio */}
              <div className="col-span-2 sm:col-span-1 space-y-3">
                <Skeleton className="h-4 w-16 rounded" />
                <div className="space-y-2">
                  <Skeleton className="h-3 w-20 rounded" />
                  <Skeleton className="h-3 w-24 rounded" />
                  <Skeleton className="h-3 w-22 rounded" />
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Copyright & Status Bar */}
          <div className="pt-6 border-t border-[hsl(var(--border-subtle))] flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <Skeleton className="h-3 w-48 rounded" />
            <div className="flex items-center gap-3">
              <Skeleton className="h-3 w-16 rounded" />
              <Skeleton className="h-3 w-16 rounded" />
              <Skeleton className="h-3 w-20 rounded" />
            </div>
          </div>
        </Container>
      </footer>
    </div>
  );
}
