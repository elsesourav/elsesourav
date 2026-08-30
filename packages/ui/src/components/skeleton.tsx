import * as React from 'react';
import { cn } from '../lib/utils';

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-xl bg-[hsl(var(--surface-subtle))] skeleton-shimmer animate-pulse border border-[hsl(var(--border-subtle))]',
        className
      )}
      {...props}
    />
  );
}

export function SkeletonText({
  lines = 1,
  className,
  lastLineWidth = '70%',
}: {
  lines?: number;
  className?: string;
  lastLineWidth?: string;
}) {
  if (lines <= 1) {
    return <Skeleton className={cn('h-4 w-full', className)} />;
  }

  return (
    <div className="space-y-2.5 w-full">
      {Array.from({ length: lines }).map((_, idx) => (
        <Skeleton
          key={idx}
          className={cn('h-4', className)}
          style={{ width: idx === lines - 1 ? lastLineWidth : '100%' }}
        />
      ))}
    </div>
  );
}

export function SkeletonBadge({ className }: { className?: string }) {
  return <Skeleton className={cn('h-6 w-20 rounded-full', className)} />;
}

export function SkeletonButton({ className }: { className?: string }) {
  return <Skeleton className={cn('h-11 w-32 rounded-xl', className)} />;
}

export function SkeletonAvatar({ className }: { className?: string }) {
  return <Skeleton className={cn('h-10 w-10 rounded-full shrink-0', className)} />;
}

export function SkeletonImage({ className }: { className?: string }) {
  return <Skeleton className={cn('aspect-video w-full rounded-2xl', className)} />;
}

export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 space-y-4 shadow-sm',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-28 rounded-lg" />
        <SkeletonBadge className="w-14" />
      </div>
      <Skeleton className="h-6 w-3/4 rounded-lg" />
      <div className="space-y-2 pt-1">
        <Skeleton className="h-4 w-full rounded-md" />
        <Skeleton className="h-4 w-5/6 rounded-md" />
      </div>
      <div className="flex items-center gap-2 pt-3 border-t border-[hsl(var(--border-subtle))]">
        <SkeletonBadge className="w-16" />
        <SkeletonBadge className="w-20" />
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 space-y-3 overflow-hidden shadow-sm">
      <div className="flex gap-4 pb-3 border-b border-[hsl(var(--border-subtle))]">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1 rounded-md" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-4 py-2">
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} className="h-4 flex-1 opacity-70 rounded-md" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto py-8">
      <div className="space-y-3">
        <SkeletonBadge className="w-24" />
        <Skeleton className="h-10 w-3/4 rounded-xl" />
        <Skeleton className="h-4 w-1/2 rounded-md" />
      </div>
      <SkeletonImage className="h-64 sm:h-80" />
      <div className="space-y-3 pt-4">
        <Skeleton className="h-4 w-full rounded-md" />
        <Skeleton className="h-4 w-full rounded-md" />
        <Skeleton className="h-4 w-5/6 rounded-md" />
        <Skeleton className="h-4 w-2/3 rounded-md" />
      </div>
    </div>
  );
}
