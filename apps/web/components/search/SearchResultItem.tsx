'use client';

import * as React from 'react';
import { ArrowRight, type LucideIcon } from 'lucide-react';
import type { GlobalSearchResult } from '@elsesourav/types';

interface SearchResultItemProps {
  result: GlobalSearchResult;
  isActive: boolean;
  icon: LucideIcon;
  color: string;
  onSelect: () => void;
  onMouseEnter: () => void;
}

export function SearchResultItem({
  result,
  isActive,
  icon: Icon,
  color,
  onSelect,
  onMouseEnter,
}: SearchResultItemProps) {
  return (
    <button
      data-search-result
      type="button"
      onClick={onSelect}
      onMouseEnter={onMouseEnter}
      className={`w-full flex items-center gap-3 px-5 py-2.5 text-left transition-colors group min-h-[44px] cursor-pointer ${
        isActive ? 'bg-[hsl(var(--accent))]' : 'hover:bg-[hsl(var(--surface-subtle))]'
      }`}
      role="option"
      aria-selected={isActive}
      aria-label={`${result.title}${result.category ? `, ${result.category}` : ''}`}
    >
      {/* Icon */}
      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
          isActive
            ? 'bg-[hsl(var(--surface-elevated))]'
            : 'bg-[hsl(var(--surface-subtle))]'
        }`}
      >
        <Icon className={`w-4 h-4 ${color}`} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[hsl(var(--foreground))] truncate">
          {result.title}
        </p>
        {result.description && (
          <p className="text-xs text-[hsl(var(--muted-foreground))] truncate mt-0.5">
            {result.description}
          </p>
        )}
      </div>

      {/* Category Badge */}
      {result.category && (
        <span className="text-[10px] font-medium text-[hsl(var(--subtle-foreground))] bg-[hsl(var(--surface-subtle))] px-2 py-0.5 rounded-md shrink-0 hidden sm:inline-flex">
          {result.category}
        </span>
      )}

      {/* Arrow indicator for active item */}
      <ArrowRight
        className={`w-3.5 h-3.5 shrink-0 transition-opacity ${
          isActive ? 'opacity-70 text-[hsl(var(--muted-foreground))]' : 'opacity-0'
        }`}
      />
    </button>
  );
}
