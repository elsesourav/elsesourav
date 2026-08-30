import * as React from 'react';
import { Card, Skeleton, SkeletonBadge } from '@elsesourav/ui';

export function HelpCategorySkeleton() {
  return (
    <Card className="p-6 rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] space-y-5">
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
    </Card>
  );
}

export function HelpArticleCardSkeleton() {
  return (
    <Card className="p-5 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] space-y-3">
      <div className="flex items-center justify-between">
        <SkeletonBadge className="w-20 h-5" />
        <Skeleton className="h-4 w-4 rounded-md" />
      </div>
      <Skeleton className="h-5 w-4/5 rounded-md" />
      <Skeleton className="h-3.5 w-full rounded-md" />
    </Card>
  );
}
