'use client';

import * as React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Button } from '@elsesourav/ui';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface BlogPaginationProps {
  currentPage: number;
  totalPages: number;
  totalMatches: number;
}

export function BlogPagination({ currentPage, totalPages, totalMatches }: BlogPaginationProps) {
  const searchParams = useSearchParams();

  if (totalPages <= 1) {
    return null;
  }

  const createPageUrl = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', pageNumber.toString());
    return `/notes?${params.toString()}`;
  };

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav
      className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-[hsl(var(--border-subtle))]"
      aria-label="Blog pagination navigation"
    >
      <div className="text-xs text-[hsl(var(--muted-foreground))]">
        Page <span className="font-semibold text-[hsl(var(--foreground))]">{currentPage}</span> of{' '}
        <span className="font-semibold text-[hsl(var(--foreground))]">{totalPages}</span> (
        {totalMatches} total notes)
      </div>

      <div className="flex items-center gap-1.5">
        {/* Previous Page */}
        {currentPage > 1 ? (
          <Link href={createPageUrl(currentPage - 1)} aria-label="Go to previous page">
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-2.5 text-xs border-[hsl(var(--border))] hover:bg-[hsl(var(--accent))] text-[hsl(var(--foreground))]"
            >
              <ChevronLeft className="w-3.5 h-3.5 mr-1" /> Prev
            </Button>
          </Link>
        ) : (
          <Button
            variant="outline"
            size="sm"
            disabled
            className="h-8 px-2.5 text-xs border-[hsl(var(--border-subtle))] text-[hsl(var(--subtle-foreground))] opacity-50 cursor-not-allowed"
          >
            <ChevronLeft className="w-3.5 h-3.5 mr-1" /> Prev
          </Button>
        )}

        {/* Numbered Page Buttons */}
        <div className="hidden sm:flex items-center gap-1">
          {pages.map((p) => {
            const isCurrent = p === currentPage;
            return isCurrent ? (
              <Button
                key={p}
                size="sm"
                className="h-8 w-8 p-0 text-xs bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-bold shadow-sm"
                aria-current="page"
                aria-label={`Page ${p}`}
              >
                {p}
              </Button>
            ) : (
              <Link key={p} href={createPageUrl(p)} aria-label={`Go to page ${p}`}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-xs text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))]"
                >
                  {p}
                </Button>
              </Link>
            );
          })}
        </div>

        {/* Next Page */}
        {currentPage < totalPages ? (
          <Link href={createPageUrl(currentPage + 1)} aria-label="Go to next page">
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-2.5 text-xs border-[hsl(var(--border))] hover:bg-[hsl(var(--accent))] text-[hsl(var(--foreground))]"
            >
              Next <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </Link>
        ) : (
          <Button
            variant="outline"
            size="sm"
            disabled
            className="h-8 px-2.5 text-xs border-[hsl(var(--border-subtle))] text-[hsl(var(--subtle-foreground))] opacity-50 cursor-not-allowed"
          >
            Next <ChevronRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        )}
      </div>
    </nav>
  );
}
