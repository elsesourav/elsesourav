import React from 'react';
import { Skeleton } from '@/components/ui';
import './LatestUpdateCard.css';

export const LatestUpdateCardSkeleton: React.FC = () => {
  return (
    <div className="latest-update-card" aria-hidden="true" data-testid="latest-update-skeleton">
      <Skeleton
        variant="rounded"
        width="48px"
        height="48px"
        className="latest-update-card__app-icon"
        style={{ borderRadius: 'var(--radius-lg)' }}
      />

      <div className="latest-update-card__body">
        <div className="latest-update-card__header">
          <Skeleton
            variant="rounded"
            width="50%"
            height="18px"
            style={{ borderRadius: 'var(--radius-sm)' }}
          />
          <Skeleton
            variant="rounded"
            width="50px"
            height="16px"
            style={{ borderRadius: 'var(--radius-full)' }}
          />
        </div>

        <Skeleton
          variant="rounded"
          width="75%"
          height="16px"
          style={{ margin: 'var(--space-1) 0', borderRadius: 'var(--radius-sm)' }}
        />

        <Skeleton
          variant="text"
          width="90%"
          height="14px"
          style={{ borderRadius: 'var(--radius-sm)' }}
        />
      </div>

      <div className="latest-update-card__arrow">
        <Skeleton
          variant="rounded"
          width="18px"
          height="18px"
          style={{ borderRadius: 'var(--radius-sm)' }}
        />
      </div>
    </div>
  );
};
