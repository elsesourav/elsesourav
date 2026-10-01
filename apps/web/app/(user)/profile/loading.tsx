import * as React from 'react';
import { Card, Skeleton } from '@elsesourav/ui';

export default function ProfileLoading() {
  return (
    <div className="w-full space-y-4 sm:space-y-5 animate-pulse">
      {/* Profile Hero Card Skeleton */}
      <Card className="rounded-2xl sm:rounded-3xl border-border/80 bg-card/90 backdrop-blur-xl p-4 sm:p-6 md:p-7">
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-5 sm:gap-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5 text-center sm:text-left w-full sm:w-auto">
            <Skeleton className="w-20 h-20 sm:w-24 sm:h-24 rounded-full shrink-0 bg-muted/40 border-2 border-border" />
            <div className="space-y-2.5 flex-1 min-w-0">
              <Skeleton className="h-7 sm:h-8 w-44 sm:w-56 rounded-xl bg-muted/50 mx-auto sm:mx-0" />
              <Skeleton className="h-4 w-28 rounded-md bg-muted/30 mx-auto sm:mx-0" />
              <div className="flex items-center gap-3 pt-1 justify-center sm:justify-start">
                <Skeleton className="h-3.5 w-32 rounded bg-muted/30" />
                <Skeleton className="h-3.5 w-24 rounded bg-muted/30" />
              </div>
            </div>
          </div>
          <div className="w-full sm:w-auto shrink-0 flex justify-center sm:justify-end pt-1 sm:pt-0">
            <Skeleton className="h-9 w-full sm:w-28 rounded-xl bg-muted/40 border border-border" />
          </div>
        </div>
      </Card>

      {/* Account Quick Actions Skeleton */}
      <div className="space-y-3">
        <Skeleton className="h-4 w-28 rounded bg-muted/40" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {[1, 2, 3].map((i) => (
            <Card
              key={i}
              className="p-4 sm:p-5 rounded-2xl bg-card border border-border/80 space-y-3"
            >
              <div className="flex items-center justify-between">
                <Skeleton className="w-9 h-9 rounded-xl bg-muted/50 border border-border" />
                <Skeleton className="w-4 h-4 rounded-full bg-muted/30" />
              </div>
              <div className="space-y-1.5 pt-1">
                <Skeleton className="h-4 w-28 rounded bg-muted/50" />
                <Skeleton className="h-3 w-full rounded bg-muted/30" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
