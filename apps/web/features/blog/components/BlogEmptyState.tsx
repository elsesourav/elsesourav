import * as React from 'react';
import Link from 'next/link';
import { Button } from '@elsesourav/ui';
import { BookOpen, RotateCcw } from 'lucide-react';

interface BlogEmptyStateProps {
  hasFilters?: boolean;
}

export function BlogEmptyState({ hasFilters = false }: BlogEmptyStateProps) {
  return (
    <div className="py-20 px-4 text-center rounded-3xl border border-zinc-800/80 bg-zinc-900/30 backdrop-blur-sm max-w-lg mx-auto space-y-5">
      <div className="w-14 h-14 rounded-2xl bg-indigo-950/60 border border-indigo-500/30 flex items-center justify-center mx-auto text-indigo-400">
        <BookOpen className="w-7 h-7" />
      </div>

      <div className="space-y-1.5">
        <h3 className="text-lg font-bold text-zinc-100">
          {hasFilters ? 'No articles match your filters' : 'No articles published yet'}
        </h3>
        <p className="text-xs text-zinc-400 max-w-xs mx-auto leading-relaxed">
          {hasFilters
            ? 'Try adjusting your search query, selecting another category, or removing active tags.'
            : 'Check back soon for software architecture articles, release notes, and engineering insights.'}
        </p>
      </div>

      {hasFilters && (
        <div className="pt-2">
          <Link href="/blog">
            <Button variant="outline" size="sm" className="border-zinc-700 text-zinc-300 text-xs gap-1.5">
              <RotateCcw className="w-3.5 h-3.5" /> Clear All Filters
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
