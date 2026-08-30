import * as React from 'react';
import { Card, CardContent, CardHeader, Skeleton, SkeletonBadge } from '@elsesourav/ui';

export default function SettingsLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-48 rounded-xl bg-zinc-900/60" />
          <SkeletonBadge className="w-16 h-5" />
        </div>
        <Skeleton className="h-4 w-72 bg-zinc-900/60 rounded-md" />
      </div>

      {/* Tabs Switcher Skeleton */}
      <div className="flex items-center gap-2 bg-zinc-900/60 p-1.5 rounded-2xl border border-zinc-800/60">
        <Skeleton className="h-9 w-24 rounded-xl bg-zinc-800/80" />
        <Skeleton className="h-9 w-28 rounded-xl bg-zinc-900/40" />
        <Skeleton className="h-9 w-24 rounded-xl bg-zinc-900/40" />
        <Skeleton className="h-9 w-28 rounded-xl bg-zinc-900/40" />
      </div>

      {/* Main Settings Card Skeleton */}
      <Card className="rounded-3xl border-zinc-800/80 bg-zinc-900/40 backdrop-blur-xl p-6 space-y-6">
        <CardHeader className="p-0 pb-4 border-b border-zinc-800/60 space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="w-4 h-4 rounded-full bg-zinc-800" />
            <Skeleton className="h-5 w-40 rounded-lg bg-zinc-800" />
          </div>
          <Skeleton className="h-3.5 w-80 bg-zinc-900/60 rounded" />
        </CardHeader>

        <CardContent className="p-0 space-y-6 max-w-xl">
          {/* Avatar Section Skeleton */}
          <div className="p-4 rounded-2xl bg-zinc-950/40 border border-zinc-800/80 space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-36 rounded bg-zinc-800" />
              <Skeleton className="h-4 w-28 rounded bg-zinc-800" />
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Skeleton className="w-16 h-16 rounded-full shrink-0 bg-zinc-800" />
              <div className="space-y-2 w-full">
                <Skeleton className="h-3 w-44 rounded bg-zinc-900/80" />
                <div className="grid grid-cols-6 gap-2">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="w-10 h-10 rounded-full bg-zinc-800" />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Display Name Input Skeleton */}
          <div className="space-y-2">
            <Skeleton className="h-3.5 w-28 rounded bg-zinc-800" />
            <Skeleton className="h-10 w-full rounded-xl bg-zinc-950/60" />
          </div>

          {/* Username Input Skeleton */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <Skeleton className="h-3.5 w-20 rounded bg-zinc-800" />
              <Skeleton className="h-3.5 w-16 rounded bg-zinc-900" />
            </div>
            <Skeleton className="h-10 w-full rounded-xl bg-zinc-950/60" />
          </div>

          {/* Bio Textarea Skeleton */}
          <div className="space-y-2">
            <Skeleton className="h-3.5 w-16 rounded bg-zinc-800" />
            <Skeleton className="h-24 w-full rounded-xl bg-zinc-950/60" />
          </div>

          {/* Save Button Skeleton */}
          <Skeleton className="h-10 w-44 rounded-xl bg-indigo-950/40 border border-indigo-500/20" />
        </CardContent>
      </Card>
    </div>
  );
}
