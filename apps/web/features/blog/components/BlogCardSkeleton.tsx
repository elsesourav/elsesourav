import * as React from 'react';
import { Card, Skeleton } from '@elsesourav/ui';

export function BlogCardSkeleton() {
  return (
    <Card className="flex flex-col justify-between overflow-hidden rounded-2xl border-zinc-800/80 bg-zinc-900/40 p-0">
      <Skeleton className="aspect-[16/9] w-full rounded-none bg-zinc-900/80" />

      <div className="p-5 space-y-4">
        <div className="space-y-2.5">
          <div className="flex items-center gap-2">
            <Skeleton className="h-3 w-20 bg-zinc-800/60 rounded" />
            <Skeleton className="h-3 w-16 bg-zinc-800/60 rounded" />
          </div>
          <Skeleton className="h-5 w-5/6 bg-zinc-800/60 rounded-md" />
          <Skeleton className="h-4 w-full bg-zinc-800/60 rounded-md" />
          <Skeleton className="h-4 w-2/3 bg-zinc-800/60 rounded-md" />
        </div>

        <div className="pt-3 border-t border-zinc-800/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-6 rounded-full bg-zinc-800/60" />
            <Skeleton className="h-3 w-24 bg-zinc-800/60 rounded" />
          </div>
          <Skeleton className="h-3 w-16 bg-zinc-800/60 rounded" />
        </div>
      </div>
    </Card>
  );
}
