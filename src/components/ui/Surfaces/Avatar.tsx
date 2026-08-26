import React, { useState } from 'react';
import { cn } from '@/utils/cn';

export type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';
export type AvatarStatus = 'online' | 'offline' | 'busy' | 'away';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  readonly src?: string;
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
  const [hasError, setHasError] = useState<boolean>(false);

  const getInitials = (fullName?: string): string => {
    if (!fullName) return '?';
    const parts = fullName.trim().split(/\s+/);
    const first = parts[0]?.[0] || '';
    const second = parts.length > 1 ? parts[1]?.[0] || '' : '';
    return (first + second).toUpperCase();
  };

  const showImage = src && !hasError;

  return (
    <div className={cn('ui-avatar', `ui-avatar--${size}`, className)} {...props}>
      {showImage ? (
        <img src={src} alt={alt} onError={() => setHasError(true)} className="ui-avatar__img" />
      ) : (
        <span className="ui-avatar__initials">{getInitials(name || alt)}</span>
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
