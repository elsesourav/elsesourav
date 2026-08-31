'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@elsesourav/ui';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface AppPaginationProps {
  currentPage: number;
  totalPages: number;
  totalMatches: number;
}

export function AppPagination({ currentPage, totalPages, totalMatches }: AppPaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  if (totalPages <= 1) {
    return null;
  }

  const navigateToPage = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newPage <= 1) {
      params.delete('page');
    } else {
      params.set('page', newPage.toString());
    }

    const qs = params.toString();
    router.push(qs ? `/apps?${qs}` : '/apps');
  };

  return (
    <nav
      className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-[hsl(var(--border-subtle))]"
      aria-label="Pagination Navigation"
    >
      <span className="text-xs text-[hsl(var(--muted-foreground))] order-2 sm:order-1 font-mono">
        Showing page{' '}
        <span className="text-[hsl(var(--foreground))] font-semibold">{currentPage}</span> of{' '}
        <span className="text-[hsl(var(--foreground))] font-semibold">{totalPages}</span> (
        {totalMatches} total results)
      </span>

      <div className="flex items-center gap-2 order-1 sm:order-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigateToPage(currentPage - 1)}
          disabled={currentPage <= 1}
          className="text-xs gap-1"
          aria-label="Go to previous page"
        >
          <ChevronLeft className="w-3.5 h-3.5" /> Previous
        </Button>

        <div className="flex items-center gap-1">
          {Array.from({ length: totalPages }).map((_, idx) => {
            const pageNum = idx + 1;
            const isCurrent = pageNum === currentPage;
            return (
              <button
                key={pageNum}
                type="button"
                onClick={() => navigateToPage(pageNum)}
                aria-current={isCurrent ? 'page' : undefined}
                className={`w-8 h-8 rounded-lg text-xs font-mono font-medium transition-all ${
                  isCurrent
                    ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30'
                    : 'bg-[hsl(var(--surface-subtle))] border border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))]'
                }`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => navigateToPage(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="text-xs gap-1"
          aria-label="Go to next page"
        >
          Next <ChevronRight className="w-3.5 h-3.5" />
        </Button>
      </div>
    </nav>
  );
}
