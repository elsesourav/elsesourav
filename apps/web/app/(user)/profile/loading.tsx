import * as React from 'react';
import { Skeleton } from '@elsesourav/ui';

export default function ProfileLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48 bg-zinc-900/60 rounded-xl" />
        <Skeleton className="h-4 w-72 bg-zinc-900/60" />
      </div>

      <Skeleton className="h-64 w-full rounded-3xl bg-zinc-900/60" />
    </div>
  );
}
