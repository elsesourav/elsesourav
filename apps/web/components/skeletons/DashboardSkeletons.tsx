import * as React from 'react';
import { Card, PageShell, Skeleton, SkeletonBadge } from '@elsesourav/ui';

/**
 * In-page content skeleton for User & Admin dashboard views.
 */
export function DashboardPageSkeleton() {
  return (
    <PageShell className="py-6 sm:py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[hsl(var(--border))]">
        <div className="space-y-1.5">
          <Skeleton className="h-7 w-48 rounded-lg" />
          <Skeleton className="h-4 w-72 rounded-md" />
        </div>
        <Skeleton className="h-10 w-32 rounded-xl" />
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="p-4 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] space-y-2">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-20 rounded" />
              <Skeleton className="w-8 h-8 rounded-lg" />
            </div>
            <Skeleton className="h-8 w-24 rounded-lg" />
            <Skeleton className="h-3 w-32 rounded" />
          </Card>
        ))}
      </div>

      {/* Main Content Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-4">
          <Card className="p-6 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-36 rounded-md" />
              <SkeletonBadge className="w-16 h-5" />
            </div>
            <div className="space-y-3 pt-2">
              <Skeleton className="h-12 w-full rounded-xl" />
              <Skeleton className="h-12 w-full rounded-xl" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
          </Card>
        </div>

        <div className="lg:col-span-4 space-y-4">
          <Card className="p-5 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] space-y-4">
            <Skeleton className="h-5 w-28 rounded-md" />
            <div className="space-y-2.5">
              <Skeleton className="h-10 w-full rounded-lg" />
              <Skeleton className="h-10 w-full rounded-lg" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
          </Card>
        </div>
      </div>
    </PageShell>
  );
}

/**
 * In-page content skeleton for generic settings / profile forms.
 */
export function FormPageSkeleton() {
  return (
    <PageShell className="py-6 sm:py-8 max-w-4xl mx-auto space-y-6">
      <div className="space-y-1.5 pb-4 border-b border-[hsl(var(--border))]">
        <Skeleton className="h-7 w-44 rounded-lg" />
        <Skeleton className="h-4 w-64 rounded-md" />
      </div>

      <Card className="p-6 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24 rounded" />
          <Skeleton className="h-10 w-full rounded-xl" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-32 rounded" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
        <div className="flex justify-end pt-2">
          <Skeleton className="h-10 w-28 rounded-xl" />
        </div>
      </Card>
    </PageShell>
  );
}
