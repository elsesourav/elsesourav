import * as React from 'react';
import Link from 'next/link';
import { Button } from '@elsesourav/ui';
import { Sparkles, RefreshCw, Beaker, ArrowRight } from 'lucide-react';

interface AppsEmptyStateProps {
  hasFilters?: boolean;
}

export function AppsEmptyState({ hasFilters }: AppsEmptyStateProps) {
  return (
    <div className="py-16 px-6 text-center rounded-3xl border border-zinc-800/80 bg-zinc-900/30 backdrop-blur-sm max-w-lg mx-auto space-y-5">
      <div className="w-14 h-14 rounded-2xl bg-indigo-950/60 border border-indigo-500/30 flex items-center justify-center mx-auto text-indigo-400 shadow-xl">
        <Sparkles className="w-7 h-7" />
      </div>

      <div className="space-y-1.5">
        <h3 className="text-lg font-bold text-zinc-100">No projects found</h3>
        <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
          {hasFilters
            ? 'No projects match your active search or filter criteria. Try adjusting your query or resetting filters.'
            : 'No public projects have been published yet.'}
        </p>
      </div>

      {hasFilters ? (
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link href="/apps">
            <Button variant="outline" size="sm" className="border-zinc-700 text-zinc-300 text-xs gap-1.5">
              <RefreshCw className="w-3.5 h-3.5" /> Clear all filters
            </Button>
          </Link>
          <Link href="/apps?category=simulations">
            <Button variant="ghost" size="sm" className="text-indigo-400 hover:text-indigo-300 text-xs gap-1.5">
              <Beaker className="w-3.5 h-3.5" /> Check Lab experiments
            </Button>
          </Link>
        </div>
      ) : null}
    </div>
  );
}
