import * as React from 'react';
import { Skeleton } from '@elsesourav/ui';

export default function SupportTicketsLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-56 bg-zinc-900/60 rounded-xl" />
          <Skeleton className="h-4 w-80 bg-zinc-900/60" />
        </div>
        <Skeleton className="h-9 w-36 bg-zinc-900/60 rounded-xl" />
      </div>

      <Skeleton className="h-56 w-full rounded-3xl bg-zinc-900/60" />
    </div>
  );
}
