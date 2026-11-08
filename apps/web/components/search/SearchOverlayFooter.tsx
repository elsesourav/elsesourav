'use client';

import * as React from 'react';
import type { SearchScope } from './SearchSkeletons';

interface SearchOverlayFooterProps {
  count: number;
  scope: SearchScope;
}

export function SearchOverlayFooter({ count, scope }: SearchOverlayFooterProps) {
  return (
    <div className="px-5 py-2 border-t border-[hsl(var(--border))] flex items-center justify-between text-[11px] text-[hsl(var(--subtle-foreground))]">
      <span>
        {count > 0
          ? `${count} result${count !== 1 ? 's' : ''}${
              scope !== 'all'
                ? ` in ${scope === 'project' ? 'Apps' : scope === 'note' ? 'Updates' : 'Account'}`
                : ''
            }`
          : '0 results'}
      </span>
      <span className="hidden sm:flex items-center gap-2">
        <span className="flex items-center gap-1">
          <kbd className="inline-flex items-center justify-center w-5 h-5 bg-[hsl(var(--surface-subtle))] border border-[hsl(var(--border))] rounded text-[10px] font-mono">
            ↑
          </kbd>
          <kbd className="inline-flex items-center justify-center w-5 h-5 bg-[hsl(var(--surface-subtle))] border border-[hsl(var(--border))] rounded text-[10px] font-mono">
            ↓
          </kbd>
          <span className="ml-0.5">navigate</span>
        </span>
        <span className="flex items-center gap-1">
          <kbd className="inline-flex items-center justify-center px-1.5 h-5 bg-[hsl(var(--surface-subtle))] border border-[hsl(var(--border))] rounded text-[10px] font-mono">
            ↵
          </kbd>
          <span className="ml-0.5">open</span>
        </span>
      </span>
    </div>
  );
}
