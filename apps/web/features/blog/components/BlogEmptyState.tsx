import * as React from 'react';
import Link from 'next/link';
import { Button } from '@elsesourav/ui';
import { BookOpen, RotateCcw } from 'lucide-react';

interface BlogEmptyStateProps {
  hasFilters?: boolean;
}

export function BlogEmptyState({ hasFilters = false }: BlogEmptyStateProps) {
  return (
    <div className="py-10 sm:py-16 md:py-20 px-3 sm:px-6 text-center rounded-2xl sm:rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] backdrop-blur-sm max-w-lg mx-auto space-y-3.5 sm:space-y-5 shadow-xs">
      <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center mx-auto text-indigo-500 dark:text-indigo-400">
        <BookOpen className="w-5 h-5 sm:w-7 sm:h-7" />
      </div>

      <div className="space-y-1 sm:space-y-1.5">
        <h3 className="text-base sm:text-lg font-bold text-[hsl(var(--foreground))]">
          {hasFilters ? 'No updates match your filters' : 'No updates published yet'}
        </h3>
        <p className="text-[11px] sm:text-xs text-[hsl(var(--muted-foreground))] max-w-xs mx-auto leading-relaxed">
          {hasFilters
            ? 'Try adjusting your search query, selecting another category, or removing active tags.'
            : 'Check back soon for software architecture updates, release observations, and engineering insights.'}
        </p>
      </div>

      {hasFilters && (
        <div className="pt-1 sm:pt-2">
          <Link href="/updates">
            <Button
              variant="outline"
              size="sm"
              className="border-[hsl(var(--border))] hover:bg-[hsl(var(--accent))] text-[hsl(var(--foreground))] text-xs gap-1.5 h-8 px-3"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Clear All Filters
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
