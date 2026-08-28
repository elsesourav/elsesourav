import * as React from 'react';
import { Skeleton, Card } from '@elsesourav/ui';

export default function AppDetailLoading() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        {/* Back button skeleton */}
        <Skeleton className="h-4 w-36 bg-zinc-800/60 rounded-md" />

        {/* Hero Card Skeleton */}
        <Card className="p-8 rounded-3xl border-zinc-800/80 bg-zinc-900/40 flex flex-col sm:flex-row gap-6">
          <Skeleton className="w-28 h-28 rounded-2xl bg-zinc-800/60 shrink-0" />
          <div className="flex-1 space-y-3">
            <div className="flex gap-2">
              <Skeleton className="h-8 w-48 bg-zinc-800/60 rounded-lg" />
              <Skeleton className="h-6 w-16 bg-zinc-800/60 rounded-full" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-5 w-24 bg-zinc-800/60 rounded-full" />
              <Skeleton className="h-5 w-16 bg-zinc-800/60 rounded-full" />
            </div>
            <Skeleton className="h-4 w-full bg-zinc-800/60" />
            <Skeleton className="h-4 w-3/4 bg-zinc-800/60" />
            <div className="flex gap-3 pt-2">
              <Skeleton className="h-10 w-36 bg-zinc-800/60 rounded-xl" />
              <Skeleton className="h-10 w-32 bg-zinc-800/60 rounded-xl" />
            </div>
          </div>
        </Card>

        {/* Description Skeleton */}
        <div className="space-y-4">
          <Skeleton className="h-6 w-40 bg-zinc-800/60" />
          <Card className="p-6 rounded-2xl border-zinc-800/80 bg-zinc-900/30 space-y-2">
            <Skeleton className="h-4 w-full bg-zinc-800/60" />
            <Skeleton className="h-4 w-full bg-zinc-800/60" />
            <Skeleton className="h-4 w-5/6 bg-zinc-800/60" />
          </Card>
        </div>
      </div>
    </div>
  );
}
