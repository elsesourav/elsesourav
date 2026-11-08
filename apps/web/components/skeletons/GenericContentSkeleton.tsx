import * as React from 'react';
import { Card, PageShell, Skeleton, SkeletonBadge } from '@elsesourav/ui';

/**
 * In-page content skeleton for Legal (Terms, Privacy) & Documentation documents.
 */
export function LegalDocSkeleton() {
  return (
    <PageShell className="py-8 sm:py-12 max-w-4xl mx-auto space-y-6">
      <div className="space-y-2 pb-4 border-b border-[hsl(var(--border))]">
        <SkeletonBadge className="w-20 h-5" />
        <Skeleton className="h-8 w-60 rounded-xl" />
        <Skeleton className="h-3.5 w-40 rounded" />
      </div>

      <div className="space-y-4 pt-2">
        <Skeleton className="h-4 w-full rounded-md" />
        <Skeleton className="h-4 w-full rounded-md" />
        <Skeleton className="h-4 w-5/6 rounded-md" />
        <Skeleton className="h-4 w-4/6 rounded-md" />
        <div className="py-2" />
        <Skeleton className="h-6 w-48 rounded-lg" />
        <Skeleton className="h-4 w-full rounded-md" />
        <Skeleton className="h-4 w-11/12 rounded-md" />
        <Skeleton className="h-4 w-3/4 rounded-md" />
      </div>
    </PageShell>
  );
}

/**
 * In-page content skeleton for Auth forms (Login, Signup, Forgot Password).
 */
export function AuthFormSkeleton() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6 sm:p-8 rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] space-y-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <Skeleton className="w-12 h-12 rounded-2xl" />
          <Skeleton className="h-6 w-36 rounded-lg" />
          <Skeleton className="h-3.5 w-52 rounded" />
        </div>

        <div className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Skeleton className="h-3.5 w-16 rounded" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
          <div className="space-y-1.5">
            <Skeleton className="h-3.5 w-20 rounded" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
          <Skeleton className="h-10 w-full rounded-xl mt-4" />
        </div>
      </Card>
    </div>
  );
}
