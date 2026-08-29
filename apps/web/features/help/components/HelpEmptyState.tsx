import * as React from 'react';
import Link from 'next/link';
import { Button } from '@elsesourav/ui';
import { HelpCircle, RotateCcw, MessageSquare } from 'lucide-react';

interface HelpEmptyStateProps {
  query?: string;
  categoryName?: string;
}

export function HelpEmptyState({ query, categoryName }: HelpEmptyStateProps) {
  return (
    <div className="py-16 px-4 text-center rounded-3xl border border-zinc-800/80 bg-zinc-900/30 backdrop-blur-sm max-w-lg mx-auto space-y-5">
      <div className="w-14 h-14 rounded-2xl bg-indigo-950/60 border border-indigo-500/30 flex items-center justify-center mx-auto text-indigo-400">
        <HelpCircle className="w-7 h-7" />
      </div>

      <div className="space-y-1.5">
        <h3 className="text-lg font-bold text-zinc-100">
          {query
            ? `No guides found for "${query}"`
            : categoryName
              ? `No articles in ${categoryName} yet`
              : 'No articles published yet'}
        </h3>
        <p className="text-xs text-zinc-400 max-w-xs mx-auto leading-relaxed">
          {query
            ? 'Try checking for typos, using different keywords, or opening a support ticket directly.'
            : 'Check back soon for documentation, guides, and troubleshooting steps.'}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        {query && (
          <Link href="/help">
            <Button
              variant="outline"
              size="sm"
              className="border-zinc-700 text-zinc-300 text-xs gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Clear Search
            </Button>
          </Link>
        )}
        <Link href="/support">
          <Button
            size="sm"
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs gap-1.5"
          >
            <MessageSquare className="w-3.5 h-3.5" /> Contact Support
          </Button>
        </Link>
      </div>
    </div>
  );
}
