import * as React from 'react';
import { Card, CardHeader, Skeleton } from '@elsesourav/ui';

export default function SettingsLoading() {
  return (
    <div className="w-full space-y-4 sm:space-y-5 animate-pulse">
      {/* Tabs Switcher Skeleton */}
      <div className="flex justify-start">
        <Skeleton className="h-9 w-full sm:w-64 rounded-xl bg-muted/40 border border-border" />
      </div>

      {/* Main Settings Card Skeleton */}
      <Card className="bg-card text-card-foreground border-border shadow-sm rounded-2xl sm:rounded-3xl overflow-hidden">
        <CardHeader className="pb-3 sm:pb-4 border-b border-border/60 space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="w-4 h-4 rounded-full bg-muted/50" />
            <Skeleton className="h-5 w-44 rounded-lg bg-muted/50" />
          </div>
          <Skeleton className="h-3.5 w-72 bg-muted/30 rounded" />
        </CardHeader>

        <div className="p-4 sm:p-5 pt-3 space-y-3.5">
          {/* Avatar Studio Skeleton */}
          <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-muted/30 border border-border/80 space-y-3.5">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-28 rounded bg-muted/50" />
              <Skeleton className="h-7 w-20 rounded-lg bg-muted/40" />
            </div>
            <div className="flex flex-col sm:flex-row items-center sm:items-stretch gap-4 sm:gap-5">
              <Skeleton className="w-32 h-32 sm:w-36 sm:h-36 rounded-2xl bg-muted/40 shrink-0 border border-border" />
              <div className="flex-1 w-full space-y-3">
                <Skeleton className="h-16 w-full rounded-xl bg-muted/20 border border-dashed border-border" />
                <div className="flex items-center gap-2 pt-1">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Skeleton
                      key={i}
                      className="w-10 h-10 rounded-xl bg-muted/30 border border-border shrink-0"
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Form Field Wells */}
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-muted/20 border border-border/80 space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <Skeleton className="h-3.5 w-28 rounded bg-muted/50" />
                <Skeleton className="h-5 w-12 rounded bg-muted/30" />
              </div>
              <Skeleton className="h-8 w-full rounded-xl bg-background/80 border border-border/70" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
