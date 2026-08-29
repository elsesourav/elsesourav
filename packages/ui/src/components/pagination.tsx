import * as React from 'react';
import { cn } from '../lib/utils';
import { Button } from './button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface PaginationProps extends React.HTMLAttributes<HTMLElement> {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
  ...props
}: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <nav
      aria-label="Pagination"
      className={cn('flex items-center justify-center gap-2 py-4', className)}
      {...props}
    >
      <Button
        variant="ghost"
        size="sm"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="gap-1 px-2.5"
        aria-label="Go to previous page"
      >
        <ChevronLeft className="h-4 w-4" /> Previous
      </Button>

      <div className="flex items-center gap-1 text-xs text-zinc-400 font-medium">
        <span>Page</span>
        <span className="font-semibold text-zinc-100">{currentPage}</span>
        <span>of</span>
        <span className="font-semibold text-zinc-100">{totalPages}</span>
      </div>

      <Button
        variant="ghost"
        size="sm"
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="gap-1 px-2.5"
        aria-label="Go to next page"
      >
        Next <ChevronRight className="h-4 w-4" />
      </Button>
    </nav>
  );
}
