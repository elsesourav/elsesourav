import * as React from 'react';
import { Skeleton, SkeletonButton, Card } from '@elsesourav/ui';

export default function AdminLoading() {
  return (
    <div className="p-6 sm:p-8 space-y-8">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48 rounded-xl" />
        <SkeletonButton className="w-28 h-10 rounded-xl" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 space-y-2 border-[hsl(var(--border))] bg-[hsl(var(--card))]">
          <Skeleton className="h-4 w-24 rounded" />
          <Skeleton className="h-8 w-16 rounded-lg" />
        </Card>
        <Card className="p-6 space-y-2 border-[hsl(var(--border))] bg-[hsl(var(--card))]">
          <Skeleton className="h-4 w-24 rounded" />
          <Skeleton className="h-8 w-16 rounded-lg" />
        </Card>
        <Card className="p-6 space-y-2 border-[hsl(var(--border))] bg-[hsl(var(--card))]">
          <Skeleton className="h-4 w-24 rounded" />
          <Skeleton className="h-8 w-16 rounded-lg" />
        </Card>
        <Card className="p-6 space-y-2 border-[hsl(var(--border))] bg-[hsl(var(--card))]">
          <Skeleton className="h-4 w-24 rounded" />
          <Skeleton className="h-8 w-16 rounded-lg" />
        </Card>
      </div>
      <Card className="h-80 sm:h-96 rounded-2xl border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 space-y-4">
        <Skeleton className="h-6 w-36 rounded-lg" />
        <Skeleton className="h-full w-full rounded-xl" />
      </Card>
    </div>
  );
}
