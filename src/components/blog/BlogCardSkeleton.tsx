import React from 'react';
import { Skeleton } from '@/components/ui';
import './BlogCard.css';

export interface BlogCardSkeletonProps {
  readonly featured?: boolean;
  readonly className?: string;
}

export const BlogCardSkeleton: React.FC<BlogCardSkeletonProps> = ({
  featured = false,
  className = '',
}) => {
  return (
    <div
      className={`blog-card ${featured ? 'blog-card--featured' : ''} ${className}`}
      aria-hidden="true"
      data-testid="blog-card-skeleton"
    >
      {/* Cover Skeleton */}
      <div className="blog-card__cover-wrapper" style={{ overflow: 'hidden' }}>
        <Skeleton
          variant="rectangular"
          width="100%"
          height="100%"
          style={{ aspectRatio: '16/9' }}
        />
        <div className="blog-card__category-badge">
          <Skeleton
            variant="rounded"
            width="64px"
            height="22px"
            style={{ borderRadius: 'var(--radius-full)' }}
          />
        </div>
      </div>

      {/* Body Skeleton */}
      <div className="blog-card__body">
        <Skeleton
          variant="rounded"
          width="85%"
          height="22px"
          style={{ marginBottom: 10, borderRadius: 'var(--radius-sm)' }}
        />
        <Skeleton
          variant="rounded"
          width="60%"
          height="22px"
          style={{ marginBottom: 14, borderRadius: 'var(--radius-sm)' }}
        />

        <div style={{ margin: 'var(--space-2) 0 var(--space-4)' }}>
          <Skeleton
            variant="text"
            width="100%"
            height="14px"
            style={{ marginBottom: 6, borderRadius: 'var(--radius-sm)' }}
          />
          <Skeleton
            variant="text"
            width="90%"
            height="14px"
            style={{ marginBottom: 6, borderRadius: 'var(--radius-sm)' }}
          />
          <Skeleton
            variant="text"
            width="75%"
            height="14px"
            style={{ borderRadius: 'var(--radius-sm)' }}
          />
        </div>

        {/* Footer Meta Skeleton */}
        <footer className="blog-card__meta">
          <div className="blog-card__meta-left">
            <Skeleton
              variant="rounded"
              width="72px"
              height="16px"
              style={{ borderRadius: 'var(--radius-sm)' }}
            />
            <Skeleton
              variant="rounded"
              width="64px"
              height="16px"
              style={{ borderRadius: 'var(--radius-sm)' }}
            />
          </div>
          <div className="blog-card__tags">
            <Skeleton
              variant="rounded"
              width="45px"
              height="18px"
              style={{ borderRadius: 'var(--radius-full)' }}
            />
          </div>
        </footer>
      </div>
    </div>
  );
};
