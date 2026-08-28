import React from 'react';
import { Skeleton } from '@/components/ui';
import './AppCard.css';

export const AppCardSkeleton: React.FC = () => {
  return (
    <div className="app-card" aria-hidden="true" data-testid="app-card-skeleton">
      <div className="app-card__header">
        <Skeleton
          width="56px"
          height="56px"
          variant="rounded"
          style={{ borderRadius: 'var(--radius-lg)' }}
        />
        <div className="app-card__title-area">
          <Skeleton
            width="70%"
            height="20px"
            variant="rounded"
            style={{ marginBottom: 8, borderRadius: 'var(--radius-sm)' }}
          />
          <Skeleton
            width="40%"
            height="16px"
            variant="rounded"
            style={{ borderRadius: 'var(--radius-full)' }}
          />
        </div>
      </div>

      <div style={{ flex: 1, margin: 'var(--space-2) 0 var(--space-4)' }}>
        <Skeleton
          width="100%"
          height="14px"
          variant="text"
          style={{ marginBottom: 6, borderRadius: 'var(--radius-sm)' }}
        />
        <Skeleton
          width="85%"
          height="14px"
          variant="text"
          style={{ borderRadius: 'var(--radius-sm)' }}
        />
      </div>

      <div className="app-card__tags">
        <Skeleton
          width="50px"
          height="20px"
          variant="rounded"
          style={{ borderRadius: 'var(--radius-full)' }}
        />
        <Skeleton
          width="60px"
          height="20px"
          variant="rounded"
          style={{ borderRadius: 'var(--radius-full)' }}
        />
      </div>

      <div className="app-card__footer">
        <Skeleton
          width="80%"
          height="32px"
          variant="rounded"
          style={{ borderRadius: 'var(--radius-md)' }}
        />
        <Skeleton
          width="32px"
          height="32px"
          variant="rounded"
          style={{ borderRadius: 'var(--radius-full)' }}
        />
      </div>
    </div>
  );
};
