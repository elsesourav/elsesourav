import * as React from 'react';
import { Skeleton, SkeletonBadge, Card } from '@elsesourav/ui';

export default function UserLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Skeleton */}
      <div className="space-y-3">
        <SkeletonBadge className="w-24 h-5" />
        <Skeleton className="h-8 w-64 rounded-xl" />
        <Skeleton className="h-4 w-96 max-w-full rounded-md" />
      </div>

      {/* Grid of Skeleton Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="p-6 space-y-4 border-[hsl(var(--border))] bg-[hsl(var(--card))]">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
              <div className="space-y-2 flex-1 min-w-0">
                <Skeleton className="h-4 w-3/4 rounded-md" />
                <Skeleton className="h-3 w-1/2 rounded" />
              </div>
            </div>
            <Skeleton className="h-12 w-full rounded-xl" />
          </Card>
        ))}
      </div>
    </div>
  );
}
