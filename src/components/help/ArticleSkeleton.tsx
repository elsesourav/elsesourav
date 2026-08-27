import React from 'react';
import { Skeleton } from '@/components/ui';

export interface ArticleSkeletonProps {
  readonly className?: string;
  readonly hasCoverImage?: boolean;
}

export const ArticleSkeleton: React.FC<ArticleSkeletonProps> = ({
  className = '',
  hasCoverImage = false,
}) => {
  return (
    <article
      className={`ui-article-skeleton ${className}`}
      aria-hidden="true"
      data-testid="article-skeleton"
      style={{ maxWidth: '820px', margin: '0 auto', width: '100%' }}
    >
      {/* Breadcrumbs Skeleton */}
      <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-6)' }}>
        <Skeleton variant="rounded" width="60px" height="16px" style={{ borderRadius: 'var(--radius-sm)' }} />
        <Skeleton variant="rounded" width="12px" height="16px" style={{ borderRadius: 'var(--radius-sm)' }} />
        <Skeleton variant="rounded" width="80px" height="16px" style={{ borderRadius: 'var(--radius-sm)' }} />
      </div>

      {/* Title & Subtitle */}
      <Skeleton
        variant="rounded"
        width="90%"
        height="38px"
        style={{ marginBottom: 'var(--space-3)', borderRadius: 'var(--radius-sm)' }}
      />
      <Skeleton
        variant="rounded"
        width="65%"
        height="38px"
        style={{ marginBottom: 'var(--space-6)', borderRadius: 'var(--radius-sm)' }}
      />

      {/* Meta Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-3)',
          marginBottom: 'var(--space-8)',
          paddingBottom: 'var(--space-6)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <Skeleton variant="circular" width="40px" height="40px" />
        <div>
          <Skeleton variant="rounded" width="120px" height="16px" style={{ marginBottom: 4, borderRadius: 'var(--radius-sm)' }} />
          <Skeleton variant="rounded" width="80px" height="14px" style={{ borderRadius: 'var(--radius-sm)' }} />
        </div>
      </div>

      {/* Optional Cover Image */}
      {hasCoverImage && (
        <Skeleton
          variant="rounded"
          width="100%"
          height="360px"
          style={{ marginBottom: 'var(--space-8)', borderRadius: 'var(--radius-xl)' }}
        />
      )}

      {/* Content Paragraph Skeletons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
        <Skeleton variant="text" width="100%" height="16px" />
        <Skeleton variant="text" width="98%" height="16px" />
        <Skeleton variant="text" width="94%" height="16px" />
        <Skeleton variant="text" width="85%" height="16px" />
      </div>

      <Skeleton
        variant="rounded"
        width="45%"
        height="28px"
        style={{ margin: 'var(--space-6) 0 var(--space-4)', borderRadius: 'var(--radius-sm)' }}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', marginBottom: 'var(--space-8)' }}>
        <Skeleton variant="text" width="100%" height="16px" />
        <Skeleton variant="text" width="96%" height="16px" />
        <Skeleton variant="text" width="92%" height="16px" />
      </div>

      {/* Code Block Skeleton */}
      <Skeleton
        variant="rounded"
        width="100%"
        height="120px"
        style={{ borderRadius: 'var(--radius-lg)' }}
      />
    </article>
  );
};
