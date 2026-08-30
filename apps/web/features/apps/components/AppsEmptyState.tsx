import * as React from 'react';
import Link from 'next/link';
import { Button } from '@elsesourav/ui';
import { Sparkles, RefreshCw, ArrowRight } from 'lucide-react';

interface AppsEmptyStateProps {
  hasFilters?: boolean;
}

export function AppsEmptyState({ hasFilters }: AppsEmptyStateProps) {
  return (
    <div className="py-16 px-6 text-center rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] backdrop-blur-sm max-w-lg mx-auto space-y-5 shadow-sm">
      <div className="w-14 h-14 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center mx-auto text-indigo-600 dark:text-indigo-400 shadow-md">
        <Sparkles className="w-7 h-7" />
      </div>

      <div className="space-y-1.5">
        <h3 className="text-lg font-bold text-[hsl(var(--foreground))]">No applications found</h3>
        <p className="text-xs text-[hsl(var(--muted-foreground))] max-w-sm mx-auto leading-relaxed">
          {hasFilters
            ? 'No applications match your active search or filter criteria. Try adjusting your search query or clearing active filters.'
            : 'No public applications have been published yet.'}
        </p>
      </div>

      {hasFilters ? (
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link href="/apps">
            <Button variant="outline" size="sm" className="text-xs gap-1.5">
              <RefreshCw className="w-3.5 h-3.5" /> Clear all filters
            </Button>
          </Link>
          <Link href="/archive">
            <Button variant="ghost" size="sm" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 text-xs gap-1.5">
              <span>Explore the Archive</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      ) : null}
    </div>
  );
}
