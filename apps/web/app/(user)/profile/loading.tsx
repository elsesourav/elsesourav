import * as React from 'react';
import { Card, Skeleton, SkeletonBadge } from '@elsesourav/ui';

export default function ProfileLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-pulse">
      {/* Profile Hero Card Skeleton */}
      <Card className="rounded-3xl border-zinc-800/80 bg-zinc-900/40 backdrop-blur-xl p-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <Skeleton className="w-24 h-24 rounded-full shrink-0 bg-zinc-800 border-2 border-zinc-700/50" />
          <div className="space-y-3 text-center sm:text-left flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-center sm:justify-start">
              <Skeleton className="h-8 w-48 rounded-xl bg-zinc-800" />
              <SkeletonBadge className="w-20 h-6" />
            </div>
            <Skeleton className="h-4 w-32 rounded bg-zinc-900/80 mx-auto sm:mx-0" />
            <Skeleton className="h-4 w-full max-w-lg rounded bg-zinc-900/60" />
            <Skeleton className="h-4 w-3/4 max-w-md rounded bg-zinc-900/60" />
            <div className="flex items-center gap-4 pt-2 justify-center sm:justify-start">
              <Skeleton className="h-3.5 w-24 rounded bg-zinc-900" />
              <Skeleton className="h-3.5 w-28 rounded bg-zinc-900" />
            </div>
          </div>
        </div>
      </Card>

      {/* Profile Library / Activity Skeleton */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-36 rounded-lg bg-zinc-900/60" />
          <Skeleton className="h-4 w-20 rounded bg-zinc-900/60" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Skeleton className="h-36 rounded-2xl bg-zinc-900/40 border border-zinc-800/60" />
          <Skeleton className="h-36 rounded-2xl bg-zinc-900/40 border border-zinc-800/60" />
        </div>
      </div>
    </div>
  );
}
