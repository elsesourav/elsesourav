import * as React from 'react';
import { Skeleton } from '@elsesourav/ui';

export default function DashboardLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Banner Skeleton */}
      <Skeleton className="h-44 w-full rounded-3xl bg-zinc-900/60" />

      {/* Metric Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Skeleton className="h-28 rounded-2xl bg-zinc-900/60" />
        <Skeleton className="h-28 rounded-2xl bg-zinc-900/60" />
        <Skeleton className="h-28 rounded-2xl bg-zinc-900/60" />
      </div>

      {/* Recent Library Skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-6 w-48 bg-zinc-900/60 rounded-lg" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Skeleton className="h-20 rounded-xl bg-zinc-900/60" />
          <Skeleton className="h-20 rounded-xl bg-zinc-900/60" />
          <Skeleton className="h-20 rounded-xl bg-zinc-900/60" />
        </div>
      </div>
    </div>
  );
}
