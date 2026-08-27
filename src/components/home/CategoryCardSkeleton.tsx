import React from 'react';
import { Skeleton } from '@/components/ui';
import './CategoryCard.css';

export const CategoryCardSkeleton: React.FC = () => {
  return (
    <div className="category-card" aria-hidden="true" data-testid="category-card-skeleton">
      <div className="category-card__icon-wrapper">
        <Skeleton
          variant="rounded"
          width="40px"
          height="40px"
          style={{ borderRadius: 'var(--radius-md)' }}
        />
      </div>

      <div className="category-card__body">
        <Skeleton
          variant="rounded"
          width="60%"
          height="18px"
          style={{ marginBottom: 6, borderRadius: 'var(--radius-sm)' }}
        />
        <Skeleton
          variant="text"
          width="85%"
          height="14px"
          style={{ borderRadius: 'var(--radius-sm)' }}
        />
      </div>

      <div className="category-card__arrow">
        <Skeleton
          variant="rounded"
          width="20px"
          height="20px"
          style={{ borderRadius: 'var(--radius-sm)' }}
        />
      </div>
    </div>
  );
};
