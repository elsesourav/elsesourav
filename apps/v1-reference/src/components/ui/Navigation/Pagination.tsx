import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface PaginationProps extends React.HTMLAttributes<HTMLElement> {
  readonly currentPage: number;
  readonly totalPages: number;
  readonly onPageChange: (page: number) => void;
  readonly showFirstLast?: boolean;
  readonly maxVisiblePages?: number;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  showFirstLast = true,
  maxVisiblePages = 5,
  className,
  ...props
}) => {
  if (totalPages <= 1) return null;

  const getPageNumbers = (): readonly (number | 'ellipsis')[] => {
    if (totalPages <= maxVisiblePages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | 'ellipsis')[] = [];
    const half = Math.floor(maxVisiblePages / 2);
    let start = Math.max(1, currentPage - half);
    let end = Math.min(totalPages, currentPage + half);

    if (currentPage <= half) {
      end = maxVisiblePages;
    } else if (currentPage + half >= totalPages) {
      start = totalPages - maxVisiblePages + 1;
    }

    if (start > 1) {
      pages.push(1);
      if (start > 2) pages.push('ellipsis');
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (end < totalPages) {
      if (end < totalPages - 1) pages.push('ellipsis');
      pages.push(totalPages);
    }

    return pages;
  };

  const pages = getPageNumbers();

  return (
    <nav aria-label="Pagination" className={cn('ui-pagination', className)} {...props}>
      {showFirstLast && (
        <button
          type="button"
          disabled={currentPage === 1}
          onClick={() => onPageChange(1)}
          aria-label="Go to first page"
          className="ui-pagination__btn ui-pagination__btn--icon"
        >
          <ChevronsLeft size={16} />
        </button>
      )}

      <button
        type="button"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        aria-label="Go to previous page"
        className="ui-pagination__btn ui-pagination__btn--icon"
      >
        <ChevronLeft size={16} />
      </button>

      <div className="ui-pagination__pages">
        {pages.map((p, index) => {
          if (p === 'ellipsis') {
            return (
              <span key={`ellipsis-${index}`} className="ui-pagination__ellipsis">
                ...
              </span>
            );
          }

          const isActive = currentPage === p;

          return (
            <button
              key={p}
              type="button"
              aria-current={isActive ? 'page' : undefined}
              aria-label={`Page ${p}`}
              onClick={() => onPageChange(p)}
              className={cn('ui-pagination__btn', isActive && 'is-active')}
            >
              {p}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        aria-label="Go to next page"
        className="ui-pagination__btn ui-pagination__btn--icon"
      >
        <ChevronRight size={16} />
      </button>

      {showFirstLast && (
        <button
          type="button"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(totalPages)}
          aria-label="Go to last page"
          className="ui-pagination__btn ui-pagination__btn--icon"
        >
          <ChevronsRight size={16} />
        </button>
      )}
    </nav>
  );
};
