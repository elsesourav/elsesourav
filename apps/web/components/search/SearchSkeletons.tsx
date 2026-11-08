'use client';

import * as React from 'react';
import { Skeleton } from '@elsesourav/ui';

export type SearchScope = 'all' | 'project' | 'note' | 'account';

interface SearchLoadingSkeletonProps {
  scope: SearchScope;
}

export function SearchLoadingSkeleton({ scope }: SearchLoadingSkeletonProps) {
  return (
    <div className="py-2.5 px-4 space-y-4 animate-fade-in" aria-label="Searching results">
      {/* Apps group skeleton */}
      {(scope === 'all' || scope === 'project') && (
        <div className="space-y-2">
          <Skeleton className="h-3 w-14 rounded" />
          <div className="flex items-center gap-3 py-1.5 px-1">
            <Skeleton className="w-8 h-8 rounded-lg shrink-0" />
            <div className="space-y-1.5 flex-1 min-w-0">
              <Skeleton className="h-4 w-2/5 rounded" />
              <Skeleton className="h-3 w-3/5 rounded" />
            </div>
          </div>
          <div className="flex items-center gap-3 py-1.5 px-1">
            <Skeleton className="w-8 h-8 rounded-lg shrink-0" />
            <div className="space-y-1.5 flex-1 min-w-0">
              <Skeleton className="h-4 w-1/2 rounded" />
              <Skeleton className="h-3 w-2/3 rounded" />
            </div>
          </div>
        </div>
      )}

      {/* Updates group skeleton */}
      {(scope === 'all' || scope === 'note') && (
        <div
          className={`space-y-2 ${
            scope === 'all' ? 'pt-2 border-t border-[hsl(var(--border-subtle))]' : ''
          }`}
        >
          <Skeleton className="h-3 w-14 rounded" />
          <div className="flex items-center gap-3 py-1.5 px-1">
            <Skeleton className="w-8 h-8 rounded-lg shrink-0" />
            <div className="space-y-1.5 flex-1 min-w-0">
              <Skeleton className="h-4 w-3/5 rounded" />
              <Skeleton className="h-3 w-4/5 rounded" />
            </div>
          </div>
        </div>
      )}

      {/* Account group skeleton */}
      {scope === 'account' && (
        <div className="space-y-2">
          <Skeleton className="h-3 w-16 rounded" />
          <div className="flex items-center gap-3 py-1.5 px-1">
            <Skeleton className="w-8 h-8 rounded-lg shrink-0" />
            <div className="space-y-1.5 flex-1 min-w-0">
              <Skeleton className="h-4 w-2/5 rounded" />
              <Skeleton className="h-3 w-3/5 rounded" />
            </div>
          </div>
          <div className="flex items-center gap-3 py-1.5 px-1">
            <Skeleton className="w-8 h-8 rounded-lg shrink-0" />
            <div className="space-y-1.5 flex-1 min-w-0">
              <Skeleton className="h-4 w-1/2 rounded" />
              <Skeleton className="h-3 w-2/3 rounded" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface SearchEmptyHintsProps {
  scope: SearchScope;
  onSelectHint: (hint: string) => void;
}

const HINTS_BY_SCOPE: Record<SearchScope, string[]> = {
  all: ['Apps', 'Updates', 'About', 'Archive'],
  project: ['Dev Tools', 'Games', 'Web', 'macOS', 'Utilities'],
  note: ['Architecture', 'Releases', 'Engineering', 'Performance'],
  account: ['Account', 'Settings', 'Security', 'Notifications', 'Library', 'Support'],
};

export function SearchEmptyHints({ scope, onSelectHint }: SearchEmptyHintsProps) {
  const hints = HINTS_BY_SCOPE[scope] || HINTS_BY_SCOPE.all;
  const description =
    scope === 'project'
      ? 'Search applications, tools, and systems...'
      : scope === 'note'
        ? 'Search engineering updates, devlogs, and articles...'
        : scope === 'account'
          ? 'Search account settings, profile, and security...'
          : 'Search projects, updates, and experiments...';

  return (
    <div className="px-5 py-6 text-center">
      <p className="text-sm text-[hsl(var(--muted-foreground))]">{description}</p>
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-[11px]">
        {hints.map((hint) => (
          <button
            key={hint}
            type="button"
            onClick={() => onSelectHint(hint)}
            className="px-2.5 py-1 rounded-lg bg-[hsl(var(--surface-subtle))] border border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:border-[hsl(var(--border-strong))] transition-colors cursor-pointer"
          >
            {hint}
          </button>
        ))}
      </div>
    </div>
  );
}
