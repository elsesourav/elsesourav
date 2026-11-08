import * as React from 'react';
import { Card, PageShell, Skeleton, SkeletonBadge } from '@elsesourav/ui';

export function HelpCategorySkeleton() {
  return (
    <Card className="p-3 sm:p-4 md:p-5 rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] space-y-4 flex flex-col justify-between">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton className="w-10 h-10 rounded-2xl" />
          <SkeletonBadge className="w-16 h-5" />
        </div>
        <Skeleton className="h-5 w-40 rounded-md" />
        <Skeleton className="h-4 w-full rounded-md" />
      </div>

      <div className="space-y-2 pt-2 border-t border-[hsl(var(--border-subtle))]">
        <Skeleton className="h-3.5 w-full rounded-md" />
        <Skeleton className="h-3.5 w-5/6 rounded-md" />
        <Skeleton className="h-3.5 w-4/6 rounded-md" />
      </div>

      <div className="pt-2">
        <Skeleton className="h-4 w-28 rounded-md" />
      </div>
    </Card>
  );
}

export function HelpArticleCardSkeleton() {
  return (
    <Card className="p-2.5 sm:p-3 md:p-3.5 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] h-full flex flex-col justify-between space-y-2.5">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <SkeletonBadge className="w-20 h-5" />
          <Skeleton className="h-4 w-4 rounded-md" />
        </div>
        <div className="flex items-start gap-2.5 pt-1">
          <Skeleton className="w-4 h-4 rounded mt-0.5 shrink-0" />
          <Skeleton className="h-5 w-4/5 rounded-md" />
        </div>
        <Skeleton className="h-3.5 w-full rounded-md pl-6" />
      </div>

      <div className="pt-2 border-t border-[hsl(var(--border-subtle))] flex justify-end">
        <Skeleton className="h-3.5 w-20 rounded-md" />
      </div>
    </Card>
  );
}

export function HelpOverviewSkeleton() {
  return (
    <PageShell className="py-8 sm:py-12 space-y-8">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <SkeletonBadge className="w-24 h-6 mx-auto" />
        <Skeleton className="h-9 w-64 mx-auto rounded-xl" />
        <Skeleton className="h-4 w-full max-w-md mx-auto rounded-md" />
        <Skeleton className="h-11 w-full max-w-lg mx-auto rounded-xl mt-4" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <HelpCategorySkeleton key={i} />
        ))}
      </div>
    </PageShell>
  );
}
