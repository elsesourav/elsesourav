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
    return `/blog?${params.toString()}`;
  };

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav
      className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-zinc-800/80"
      aria-label="Blog pagination navigation"
    >
      <div className="text-xs text-zinc-400">
        Page <span className="font-semibold text-zinc-200">{currentPage}</span> of{' '}
        <span className="font-semibold text-zinc-200">{totalPages}</span> ({totalMatches} total articles)
      </div>

      <div className="flex items-center gap-1.5">
        {/* Previous Page */}
        {currentPage > 1 ? (
          <Link href={createPageUrl(currentPage - 1)} aria-label="Go to previous page">
            <Button variant="outline" size="sm" className="h-8 px-2.5 text-xs border-zinc-800 hover:bg-zinc-800 text-zinc-300">
              <ChevronLeft className="w-3.5 h-3.5 mr-1" /> Prev
            </Button>
          </Link>
        ) : (
          <Button variant="outline" size="sm" disabled className="h-8 px-2.5 text-xs border-zinc-800/50 text-zinc-600 cursor-not-allowed">
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
                className="h-8 w-8 p-0 text-xs bg-indigo-600 hover:bg-indigo-600 text-white font-bold"
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
                  className="h-8 w-8 p-0 text-xs text-zinc-400 hover:text-white hover:bg-zinc-800"
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
            <Button variant="outline" size="sm" className="h-8 px-2.5 text-xs border-zinc-800 hover:bg-zinc-800 text-zinc-300">
              Next <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </Link>
        ) : (
          <Button variant="outline" size="sm" disabled className="h-8 px-2.5 text-xs border-zinc-800/50 text-zinc-600 cursor-not-allowed">
            Next <ChevronRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        )}
      </div>
    </nav>
  );
}
