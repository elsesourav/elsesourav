import * as React from 'react';
import { Card, Skeleton } from '@elsesourav/ui';

export function HelpCategorySkeleton() {
  return (
    <Card className="p-6 rounded-3xl border-zinc-800/80 bg-zinc-900/40 space-y-5">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton className="w-10 h-10 rounded-2xl bg-zinc-800/60" />
          <Skeleton className="h-4 w-16 bg-zinc-800/60 rounded-full" />
        </div>
        <Skeleton className="h-5 w-40 bg-zinc-800/60 rounded" />
        <Skeleton className="h-4 w-full bg-zinc-800/60 rounded" />
      </div>

      <div className="space-y-2 pt-2 border-t border-zinc-800/60">
        <Skeleton className="h-3.5 w-full bg-zinc-800/60 rounded" />
        <Skeleton className="h-3.5 w-5/6 bg-zinc-800/60 rounded" />
        <Skeleton className="h-3.5 w-4/6 bg-zinc-800/60 rounded" />
      </div>
    </Card>
  );
}

export function HelpArticleCardSkeleton() {
  return (
    <Card className="p-5 rounded-2xl border-zinc-800/80 bg-zinc-900/40 space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-20 bg-zinc-800/60 rounded-full" />
        <Skeleton className="h-4 w-4 bg-zinc-800/60 rounded" />
      </div>
      <Skeleton className="h-5 w-4/5 bg-zinc-800/60 rounded" />
      <Skeleton className="h-3.5 w-full bg-zinc-800/60 rounded" />
    </Card>
  );
}
