import * as React from 'react';
import { Card, Skeleton, SkeletonBadge, SkeletonButton } from '@elsesourav/ui';

export default function SupportLoading() {
  return (
    <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 space-y-12">
        {/* Page Header Skeleton */}
        <div className="space-y-3">
          <Skeleton className="h-4 w-48 rounded font-mono" />
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 sm:h-11 w-72 sm:w-96 rounded-2xl" />
            <SkeletonBadge className="w-24 h-6" />
          </div>
          <Skeleton className="h-4 sm:h-5 w-full max-w-2xl rounded-lg" />
        </div>

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Support Ticket Form Card Skeleton */}
          <div className="lg:col-span-2">
            <Card className="p-6 sm:p-8 rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] space-y-6">
              <div className="space-y-2">
                <Skeleton className="h-4 w-28 rounded" />
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20 rounded" />
                  <Skeleton className="h-10 w-full rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24 rounded" />
                  <Skeleton className="h-10 w-full rounded-xl" />
                </div>
              </div>

              <div className="space-y-2">
                <Skeleton className="h-4 w-32 rounded" />
                <Skeleton className="h-32 w-full rounded-xl" />
              </div>

              <SkeletonButton className="h-11 w-44 rounded-xl" />
            </Card>
          </div>

          {/* Sidebar Guidelines & SLA Skeleton */}
          <div className="space-y-6">
            <Card className="p-5 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] space-y-4">
              <Skeleton className="h-5 w-32 rounded-lg" />
              <div className="space-y-2.5">
                <Skeleton className="h-3.5 w-full rounded" />
                <Skeleton className="h-3.5 w-5/6 rounded" />
                <Skeleton className="h-3.5 w-4/5 rounded" />
              </div>
            </Card>

            <Card className="p-5 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] space-y-4">
              <Skeleton className="h-5 w-36 rounded-lg" />
              <div className="space-y-2.5">
                <Skeleton className="h-3.5 w-full rounded" />
                <Skeleton className="h-3.5 w-4/5 rounded" />
              </div>
              <Skeleton className="h-8 w-28 rounded-lg mt-2" />
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
