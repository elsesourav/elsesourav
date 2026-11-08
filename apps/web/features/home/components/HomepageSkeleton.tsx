import * as React from 'react';
import { Container, Skeleton } from '@elsesourav/ui';

/**
 * Simple, High-Fidelity Hero Section Skeleton
 * Renders a clean structural placeholder matching the HomeHero geometry,
 * preventing premature card flashes and eliminating layout shifts.
 */
export function HomepageSkeleton() {
  return (
    <div className="relative min-h-[calc(100vh-4rem)] sm:min-h-[92vh] flex items-center justify-center overflow-hidden select-none pt-12 sm:pt-16 md:pt-20 pb-16 sm:pb-20">
      <Container
        size="full"
        className="relative z-10 w-full max-w-[1536px] px-4 sm:px-6 lg:px-8 xl:px-12 my-auto"
      >
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center">
          {/* Left Column: Hero Content Placeholder */}
          <div className="md:col-span-7 space-y-5 sm:space-y-6 max-w-2xl">
            {/* Badge */}
            <Skeleton className="h-7 w-36 sm:w-44 rounded-full" />

            {/* Multi-Line Headline */}
            <div className="space-y-3 pt-1">
              <Skeleton className="h-10 sm:h-14 md:h-16 w-full rounded-2xl" />
              <Skeleton className="h-10 sm:h-14 md:h-16 w-4/5 rounded-2xl" />
            </div>

            {/* Subtitle / Description */}
            <div className="space-y-2 pt-1 max-w-lg">
              <Skeleton className="h-4 sm:h-5 w-full rounded-lg" />
              <Skeleton className="h-4 sm:h-5 w-5/6 rounded-lg" />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-3">
              <Skeleton className="h-11 sm:h-12 w-36 sm:w-40 rounded-full" />
              <Skeleton className="h-11 sm:h-12 w-28 sm:w-32 rounded-full" />
            </div>

            {/* Bottom Metrics Bar */}
            <div className="pt-6 grid grid-cols-3 gap-3 max-w-lg border-t border-[hsl(var(--border-subtle))]">
              <div className="space-y-1.5">
                <Skeleton className="h-5 w-14 rounded" />
                <Skeleton className="h-3 w-16 rounded" />
              </div>
              <div className="space-y-1.5">
                <Skeleton className="h-5 w-14 rounded" />
                <Skeleton className="h-3 w-16 rounded" />
              </div>
              <div className="space-y-1.5">
                <Skeleton className="h-5 w-14 rounded" />
                <Skeleton className="h-3 w-16 rounded" />
              </div>
            </div>
          </div>

          {/* Right Column: Visual Scene Placeholder (Desktop) */}
          <div className="hidden md:flex md:col-span-5 items-center justify-center">
            <Skeleton className="w-[380px] lg:w-[460px] h-[340px] lg:h-[420px] rounded-3xl opacity-60" />
          </div>
        </div>
      </Container>
    </div>
  );
}
