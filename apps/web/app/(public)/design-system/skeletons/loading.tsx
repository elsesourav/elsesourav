import * as React from 'react';
import { Card, Skeleton, SkeletonBadge } from '@elsesourav/ui';

export default function SkeletonShowcaseLoading() {
  return (
    <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 space-y-12">
        <div className="space-y-3 max-w-2xl">
          <SkeletonBadge className="w-48 h-6" />
          <Skeleton className="h-9 sm:h-11 w-80 rounded-2xl" />
          <Skeleton className="h-4 sm:h-5 w-full rounded-lg" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, idx) => (
            <Card
              key={idx}
              className="p-6 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] space-y-4"
            >
              <Skeleton className="h-5 w-32 rounded-lg" />
              <Skeleton className="h-32 w-full rounded-xl" />
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
