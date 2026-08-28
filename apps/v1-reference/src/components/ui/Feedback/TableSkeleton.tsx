import React from 'react';
import { Skeleton } from './Skeleton';
import '@/components/ui/DataDisplay/DataDisplay.css';

export interface TableSkeletonProps {
  readonly rows?: number;
  readonly columns?: number;
  readonly hasHeader?: boolean;
  readonly className?: string;
}

export const TableSkeleton: React.FC<TableSkeletonProps> = ({
  rows = 5,
  columns = 5,
  hasHeader = true,
  className = '',
}) => {
  return (
    <div
      className={`ui-table-container ${className}`}
      aria-hidden="true"
      data-testid="table-skeleton"
    >
      <table className="ui-table">
        {hasHeader && (
          <thead>
            <tr>
              {Array.from({ length: columns }).map((_, colIdx) => (
                <th key={colIdx} style={{ padding: 'var(--space-3) var(--space-4)' }}>
                  <Skeleton
                    variant="rounded"
                    width={`${Math.floor(40 + (colIdx % 3) * 20)}%`}
                    height="16px"
                    style={{ borderRadius: 'var(--radius-sm)' }}
                  />
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {Array.from({ length: rows }).map((_, rowIdx) => (
            <tr key={rowIdx}>
              {Array.from({ length: columns }).map((_, colIdx) => (
                <td key={colIdx} style={{ padding: 'var(--space-4)' }}>
                  <Skeleton
                    variant={colIdx === 0 ? 'rounded' : 'text'}
                    width={colIdx === 0 ? '70%' : `${Math.floor(50 + ((rowIdx + colIdx) % 4) * 12)}%`}
                    height={colIdx === 0 ? '20px' : '16px'}
                    style={{ borderRadius: 'var(--radius-sm)' }}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
