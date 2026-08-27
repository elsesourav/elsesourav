import React from 'react';
import { Skeleton } from './Skeleton';

export interface ListSkeletonProps {
  readonly items?: number;
  readonly hasAvatar?: boolean;
  readonly className?: string;
}

export const ListSkeleton: React.FC<ListSkeletonProps> = ({
  items = 4,
  hasAvatar = true,
  className = '',
}) => {
  return (
    <div
      className={`ui-list-skeleton ${className}`}
      aria-hidden="true"
      data-testid="list-skeleton"
      style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}
    >
      {Array.from({ length: items }).map((_, idx) => (
        <div
          key={idx}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-4)',
            padding: 'var(--space-4)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border)',
            background: 'var(--color-bg-secondary)',
          }}
        >
          {hasAvatar && (
            <Skeleton
              variant="rounded"
              width="44px"
              height="44px"
              style={{ borderRadius: 'var(--radius-md)', flexShrink: 0 }}
            />
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <Skeleton
              variant="rounded"
              width={`${Math.floor(40 + (idx % 3) * 15)}%`}
              height="18px"
              style={{ marginBottom: 8, borderRadius: 'var(--radius-sm)' }}
            />
            <Skeleton
              variant="text"
              width={`${Math.floor(60 + (idx % 4) * 10)}%`}
              height="14px"
              style={{ borderRadius: 'var(--radius-sm)' }}
            />
          </div>
          <Skeleton
            variant="rounded"
            width="60px"
            height="22px"
            style={{ borderRadius: 'var(--radius-full)', flexShrink: 0 }}
          />
        </div>
      ))}
    </div>
  );
};
