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
      className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 pt-4 sm:pt-6 border-t border-[hsl(var(--border-subtle))]"
      aria-label="Pagination Navigation"
    >
      <span className="text-[11px] sm:text-xs text-[hsl(var(--muted-foreground))] order-2 sm:order-1 font-mono text-center sm:text-left">
        Showing page{' '}
        <span className="text-[hsl(var(--foreground))] font-semibold">{currentPage}</span> of{' '}
        <span className="text-[hsl(var(--foreground))] font-semibold">{totalPages}</span> (
        {totalMatches} total results)
      </span>

      <div className="flex items-center gap-1.5 sm:gap-2 order-1 sm:order-2">
        <Button
          variant="outline"
          size="xs"
          onClick={() => navigateToPage(currentPage - 1)}
          disabled={currentPage <= 1}
          leftIcon={<ChevronLeft className="w-3.5 h-3.5" />}
          aria-label="Go to previous page"
        >
          Previous
        </Button>

        <div className="flex items-center gap-1">
          {Array.from({ length: totalPages }).map((_, idx) => {
            const pageNum = idx + 1;
            const isCurrent = pageNum === currentPage;
            return (
              <Button
                key={pageNum}
                type="button"
                variant={isCurrent ? 'primary' : 'outline'}
                size="icon-xs"
                onClick={() => navigateToPage(pageNum)}
                aria-current={isCurrent ? 'page' : undefined}
                className="font-mono text-xs rounded-lg"
              >
                {pageNum}
              </Button>
            );
          })}
        </div>

        <Button
          variant="outline"
          size="xs"
          onClick={() => navigateToPage(currentPage + 1)}
          disabled={currentPage >= totalPages}
          rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
          aria-label="Go to next page"
        >
          Next
        </Button>
      </div>
    </nav>
  );
}
