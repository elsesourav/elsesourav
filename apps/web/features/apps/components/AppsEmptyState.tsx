import * as React from 'react';
import Link from 'next/link';
import { Button } from '@elsesourav/ui';
import { Sparkles, RefreshCw } from 'lucide-react';

interface AppsEmptyStateProps {
  hasFilters?: boolean;
}

export function AppsEmptyState({ hasFilters }: AppsEmptyStateProps) {
  return (
    <div className="py-16 px-4 text-center rounded-2xl border border-zinc-800/80 bg-zinc-900/30 backdrop-blur-sm max-w-lg mx-auto space-y-4">
      <div className="w-12 h-12 rounded-full bg-indigo-950/60 border border-indigo-500/30 flex items-center justify-center mx-auto text-indigo-400">
        <Sparkles className="w-6 h-6" />
      </div>

      <div className="space-y-1">
        <h3 className="text-base font-semibold text-zinc-100">No applications found</h3>
        <p className="text-xs text-zinc-400 max-w-xs mx-auto">
          {hasFilters
            ? 'No applications match your active search or category filters. Try adjusting your query.'
            : 'No public applications have been published to the catalog yet.'}
        </p>
      </div>

      {hasFilters && (
        <div className="pt-2">
          <Link href="/apps">
            <Button variant="outline" className="border-zinc-700 text-zinc-300 text-xs gap-1.5">
              <RefreshCw className="w-3.5 h-3.5" /> Clear all filters
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
