import * as React from 'react';
import { Card, Skeleton } from '@elsesourav/ui';

export function AppCardSkeleton() {
  return (
    <Card className="border-zinc-800/80 bg-zinc-900/40 p-5 rounded-2xl flex flex-col justify-between h-[220px]">
      <div className="space-y-3">
        <div className="flex items-start gap-3.5">
          <Skeleton className="w-12 h-12 rounded-xl bg-zinc-800/60 shrink-0" />
          <div className="space-y-1.5 flex-1 min-w-0">
            <Skeleton className="h-4 w-3/4 bg-zinc-800/60" />
            <Skeleton className="h-3 w-1/3 bg-zinc-800/60" />
          </div>
        </div>
        <Skeleton className="h-3 w-full bg-zinc-800/60" />
        <Skeleton className="h-3 w-4/5 bg-zinc-800/60" />
      </div>
      <div className="flex items-center justify-between pt-3 border-t border-zinc-800/40">
        <Skeleton className="h-4 w-16 bg-zinc-800/60 rounded-full" />
        <Skeleton className="h-4 w-20 bg-zinc-800/60 rounded-full" />
      </div>
    </Card>
  );
}
