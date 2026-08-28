import React from 'react';
import { cn } from '@/utils/cn';

export type SkeletonVariant = 'text' | 'circular' | 'rectangular' | 'rounded';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  readonly variant?: SkeletonVariant;
  readonly width?: string | number;
  readonly height?: string | number;
  readonly animate?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = 'text',
  width,
  height,
  animate = true,
  style,
  ...props
}) => {
  const dynamicStyle: React.CSSProperties = {
    width: width !== undefined ? (typeof width === 'number' ? `${width}px` : width) : undefined,
    height:
      height !== undefined ? (typeof height === 'number' ? `${height}px` : height) : undefined,
    ...style,
  };

  return (
    <div
      aria-hidden="true"
      className={cn(
        'ui-skeleton',
        `ui-skeleton--${variant}`,
        animate && 'ui-skeleton--animated',
        className
      )}
      style={dynamicStyle}
      {...props}
    />
  );
};
