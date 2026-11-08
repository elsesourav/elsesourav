'use client';

import * as React from 'react';
import type { SearchScope } from './SearchSkeletons';

interface SearchOverlayScopeBarProps {
  scope: SearchScope;
  onScopeChange: (scope: SearchScope) => void;
}

export function SearchOverlayScopeBar({
  scope,
  onScopeChange,
}: SearchOverlayScopeBarProps) {
  return (
    <div className="flex items-center gap-1 px-4 sm:px-5 py-1.5 border-b border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-subtle))]/50 text-xs">
      <span className="text-[10px] font-mono text-[hsl(var(--muted-foreground))] uppercase tracking-wider mr-1 select-none">
        Scope:
      </span>
      <button
        type="button"
        onClick={() => onScopeChange('all')}
        className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium transition-all cursor-pointer ${
          scope === 'all'
            ? 'bg-zinc-800 text-white dark:bg-white/20 dark:text-white shadow-xs'
            : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--surface-subtle))]'
        }`}
      >
        All
      </button>
      <button
        type="button"
        onClick={() => onScopeChange('project')}
        className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium transition-all cursor-pointer ${
          scope === 'project'
            ? 'bg-zinc-800 text-white dark:bg-white/20 dark:text-white shadow-xs'
            : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--surface-subtle))]'
        }`}
      >
        Apps &gt;
      </button>
      <button
        type="button"
        onClick={() => onScopeChange('note')}
        className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium transition-all cursor-pointer ${
          scope === 'note'
            ? 'bg-zinc-800 text-white dark:bg-white/20 dark:text-white shadow-xs'
            : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--surface-subtle))]'
        }`}
      >
        Update &gt;
      </button>
      <button
        type="button"
        onClick={() => onScopeChange('account')}
        className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium transition-all cursor-pointer ${
          scope === 'account'
            ? 'bg-zinc-800 text-white dark:bg-white/20 dark:text-white shadow-xs'
            : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--surface-subtle))]'
        }`}
      >
        Account &gt;
      </button>
    </div>
  );
}
