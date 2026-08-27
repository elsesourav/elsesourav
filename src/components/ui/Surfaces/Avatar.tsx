import React, { useState, useEffect } from 'react';
import { cn } from '@/utils/cn';
import { isSafeImageUrl } from '@/utils/url-safety';

export type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';
export type AvatarStatus = 'online' | 'offline' | 'busy' | 'away';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  readonly src?: string | null;
  readonly alt?: string;
  readonly name?: string;
  readonly size?: AvatarSize;
  readonly status?: AvatarStatus;
}

export const Avatar: React.FC<AvatarProps> = ({
  className,
  src,
  alt = 'Avatar',
  name,
  size = 'md',
  status,
  ...props
}) => {
  const isSafe = isSafeImageUrl(src);
  const [hasError, setHasError] = useState<boolean>(!src || !isSafe);

  useEffect(() => {
    setHasError(!src || !isSafeImageUrl(src));
  }, [src]);

  const getInitials = (fullName?: string): string => {
    if (!fullName) return '?';
    const parts = fullName.trim().split(/\s+/);
    const first = parts[0]?.[0] || '';
    const second = parts.length > 1 ? parts[1]?.[0] || '' : '';
    return (first + second).toUpperCase();
  };

  const showImage = src && isSafe && !hasError;

  return (
    <div className={cn('ui-avatar', `ui-avatar--${size}`, className)} {...props}>
      {showImage ? (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          onError={() => setHasError(true)}
          className="ui-avatar__img"
        />
      ) : (
        <span className="ui-avatar__initials" aria-hidden="true">
          {getInitials(name || alt)}
        </span>
      )}
      {status && (
        <span
          className={cn('ui-avatar__status', `ui-avatar__status--${status}`)}
          aria-label={`Status: ${status}`}
        />
      )}
    </div>
  );
};
