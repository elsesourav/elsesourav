import * as React from 'react';
import { Card, Skeleton, SkeletonBadge } from '@elsesourav/ui';

/**
 * Skeleton for the Account Overview tab (Profile Hero + Security Overview + Quick Actions).
 */
export function AccountOverviewSkeleton() {
  return (
    <div className="w-full space-y-2.5 sm:space-y-4 md:space-y-5 lg:space-y-6" aria-busy="true">
      {/* 1. Identity Hero Card Skeleton */}
      <Card className="p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl md:rounded-3xl border border-border/50 sm:border-border/80 bg-card/90">
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-3.5 sm:gap-5 md:gap-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-4 md:gap-5 text-center sm:text-left w-full sm:w-auto">
            {/* Avatar Circle */}
            <Skeleton className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full shrink-0" />

            <div className="space-y-2 flex-1 min-w-0 w-full sm:w-auto">
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <Skeleton className="h-6 sm:h-7 w-40 sm:w-48 rounded-lg" />
                <SkeletonBadge className="w-16 h-5" />
              </div>
              <Skeleton className="h-4 w-28 rounded-md mx-auto sm:mx-0" />
              <div className="flex items-center justify-center sm:justify-start gap-3 pt-1">
                <Skeleton className="h-3.5 w-36 rounded" />
                <Skeleton className="h-3.5 w-24 rounded" />
              </div>
            </div>
          </div>

          <Skeleton className="h-8 sm:h-9 w-28 rounded-xl shrink-0" />
        </div>
      </Card>

      {/* 2. Security Overview Card Skeleton */}
      <Card className="p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl md:rounded-3xl border border-border/50 sm:border-border/80 bg-card/90 space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border/50">
          <div className="space-y-1">
            <Skeleton className="h-5 w-36 rounded-md" />
            <Skeleton className="h-3.5 w-56 rounded" />
          </div>
          <Skeleton className="h-7 w-20 rounded-lg" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="p-3 rounded-xl border border-border/50 bg-muted/20 space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <Skeleton className="h-3 w-16 rounded" />
                <Skeleton className="w-3.5 h-3.5 rounded-full" />
              </div>
              <Skeleton className="h-4 w-24 rounded-md" />
              <Skeleton className="h-2.5 w-20 rounded" />
            </div>
          ))}
        </div>
      </Card>

      {/* 3. Action Cards Skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-3.5 w-28 rounded" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card
              key={i}
              className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-border/50 bg-card/90 space-y-3"
            >
              <div className="flex items-center justify-between">
                <Skeleton className="w-8 h-8 rounded-xl" />
                <Skeleton className="w-4 h-4 rounded" />
              </div>
              <div className="space-y-1">
                <Skeleton className="h-4 w-24 rounded-md" />
                <Skeleton className="h-3 w-full rounded" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton for the Settings tab (Avatar studio + Profile form).
 */
export function AccountSettingsSkeleton() {
  return (
    <div className="w-full space-y-4 sm:space-y-6" aria-busy="true">
      {/* Avatar Studio Skeleton */}
      <Card className="p-4 sm:p-6 rounded-2xl border border-border/50 bg-card/90 space-y-4">
        <div className="space-y-1">
          <Skeleton className="h-5 w-32 rounded-md" />
          <Skeleton className="h-3.5 w-56 rounded" />
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
          <Skeleton className="w-20 h-20 sm:w-24 sm:h-24 rounded-full shrink-0" />
          <div className="space-y-2 w-full sm:w-auto">
            <div className="flex gap-2">
              <Skeleton className="h-9 w-32 rounded-xl" />
              <Skeleton className="h-9 w-24 rounded-xl" />
            </div>
            <Skeleton className="h-3 w-48 rounded" />
          </div>
        </div>
      </Card>

      {/* Profile Form Skeleton */}
      <Card className="p-4 sm:p-6 rounded-2xl border border-border/50 bg-card/90 space-y-5">
        <div className="space-y-1">
          <Skeleton className="h-5 w-36 rounded-md" />
          <Skeleton className="h-3.5 w-64 rounded" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="space-y-1.5">
            <Skeleton className="h-3.5 w-24 rounded" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
          <div className="space-y-1.5">
            <Skeleton className="h-3.5 w-20 rounded" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
        </div>

        <div className="space-y-1.5">
          <Skeleton className="h-3.5 w-16 rounded" />
          <Skeleton className="h-20 w-full rounded-xl" />
        </div>

        <div className="flex justify-end pt-2">
          <Skeleton className="h-10 w-32 rounded-xl" />
        </div>
      </Card>
    </div>
  );
}

/**
 * Skeleton for the Security tab (Email, Password, Danger zone).
 */
export function AccountSecuritySkeleton() {
  return (
    <div className="w-full space-y-4 sm:space-y-6" aria-busy="true">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card
          key={i}
          className="p-4 sm:p-6 rounded-2xl border border-border/50 bg-card/90 space-y-4"
        >
          <div className="flex items-center justify-between pb-3 border-b border-border/50">
            <div className="space-y-1">
              <Skeleton className="h-5 w-36 rounded-md" />
              <Skeleton className="h-3.5 w-56 rounded" />
            </div>
            <Skeleton className="w-8 h-8 rounded-lg" />
          </div>
          <div className="space-y-3 pt-1">
            <Skeleton className="h-10 w-full rounded-xl" />
            <div className="flex justify-end">
              <Skeleton className="h-9 w-28 rounded-xl" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

export interface AccountPageSkeletonProps {
  tab?: 'overview' | 'settings' | 'security' | string | null;
}

/**
 * Responsive in-page skeleton loader for the Account view and subtabs.
 */
export function AccountPageSkeleton({ tab }: AccountPageSkeletonProps) {
  if (tab === 'settings' || tab === 'profile') {
    return <AccountSettingsSkeleton />;
  }
  if (tab === 'security' || tab === 'account' || tab === 'danger') {
    return <AccountSecuritySkeleton />;
  }
  return <AccountOverviewSkeleton />;
}
