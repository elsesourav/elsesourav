'use client';

import * as React from 'react';
import { cn } from '../lib/utils';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  alt?: string;
  name?: string | null;
  identifier?: string | null;
  size?: AvatarSize;
  fallback?: string;
  fallbackInitials?: string;
  showStatus?: boolean;
  statusColor?: 'emerald' | 'amber' | 'rose' | 'zinc';
}

const COLOR_THEMES = [
  {
    bg: 'bg-gradient-to-br from-indigo-500/20 via-indigo-600/10 to-violet-900/30 dark:from-indigo-600/30 dark:via-indigo-900/20 dark:to-violet-950/50',
    border: 'border-indigo-500/30 dark:border-indigo-500/40',
    text: 'text-indigo-600 dark:text-indigo-300',
  },
  {
    bg: 'bg-gradient-to-br from-emerald-500/20 via-emerald-600/10 to-teal-900/30 dark:from-emerald-600/30 dark:via-emerald-900/20 dark:to-teal-950/50',
    border: 'border-emerald-500/30 dark:border-emerald-500/40',
    text: 'text-emerald-600 dark:text-emerald-300',
  },
  {
    bg: 'bg-gradient-to-br from-sky-500/20 via-sky-600/10 to-cyan-900/30 dark:from-sky-600/30 dark:via-sky-900/20 dark:to-cyan-950/50',
    border: 'border-sky-500/30 dark:border-sky-500/40',
    text: 'text-sky-600 dark:text-sky-300',
  },
  {
    bg: 'bg-gradient-to-br from-amber-500/20 via-amber-600/10 to-orange-900/30 dark:from-amber-600/30 dark:via-amber-900/20 dark:to-orange-950/50',
    border: 'border-amber-500/30 dark:border-amber-500/40',
    text: 'text-amber-600 dark:text-amber-300',
  },
  {
    bg: 'bg-gradient-to-br from-purple-500/20 via-purple-600/10 to-fuchsia-900/30 dark:from-purple-600/30 dark:via-purple-900/20 dark:to-fuchsia-950/50',
    border: 'border-purple-500/30 dark:border-purple-500/40',
    text: 'text-purple-600 dark:text-purple-300',
  },
  {
    bg: 'bg-gradient-to-br from-rose-500/20 via-rose-600/10 to-pink-900/30 dark:from-rose-600/30 dark:via-rose-900/20 dark:to-pink-950/50',
    border: 'border-rose-500/30 dark:border-rose-500/40',
    text: 'text-rose-600 dark:text-rose-300',
  },
] as const;

function getHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function getAvatarInitials(name?: string | null, fallback = 'U'): string {
  if (!name || !name.trim()) return fallback;
  const parts = name.trim().split(/\s+/);
  const first = parts[0] || '';
  if (parts.length === 1) {
    return first.slice(0, 2).toUpperCase();
  }
  const last = parts[parts.length - 1] || '';
  return ((first[0] || '') + (last[0] || '')).toUpperCase();
}

export function getDefaultAvatarUrl(identifier?: string | null): string {
  if (!identifier) return '/avatars/avatar-1.svg';
  const index = (getHash(identifier) % 6) + 1;
  return `/avatars/avatar-${index}.svg`;
}

export function Avatar({
  src,
  alt = 'User avatar',
  name,
  identifier,
  size = 'md',
  fallback,
  fallbackInitials,
  showStatus = false,
  statusColor = 'emerald',
  className,
  ...props
}: AvatarProps) {
  const [imgError, setImgError] = React.useState(false);

  // Reset error if src changes
  React.useEffect(() => {
    setImgError(false);
  }, [src]);

  const rawKey = identifier || name || alt || 'user';
  const themeIndex = getHash(rawKey) % COLOR_THEMES.length;
  const theme = COLOR_THEMES[themeIndex] || COLOR_THEMES[0];
  const initials = fallback || fallbackInitials || getAvatarInitials(name || alt);

  const sizeClasses: Record<AvatarSize, string> = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 sm:w-16 sm:h-16 text-lg sm:text-xl',
    xl: 'w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 text-xl sm:text-2xl md:text-3xl',
  };

  const statusDotSizes: Record<AvatarSize, string> = {
    xs: 'w-1.5 h-1.5',
    sm: 'w-2.5 h-2.5',
    md: 'w-3 h-3',
    lg: 'w-3.5 h-3.5',
    xl: 'w-4 h-4',
  };

  const statusColors = {
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    rose: 'bg-rose-500',
    zinc: 'bg-zinc-500',
  };

  const hasValidImage = Boolean(src && !imgError);

  return (
    <div className="relative inline-block shrink-0">
      <div
        className={cn(
          'relative flex items-center justify-center rounded-full overflow-hidden border font-bold select-none transition-all shadow-sm',
          sizeClasses[size],
          theme.bg,
          theme.border,
          theme.text,
          className
        )}
        {...(!hasValidImage ? { role: 'img', 'aria-label': alt || name || 'User avatar' } : {})}
        {...props}
      >
        {hasValidImage ? (
          <img
            src={src!}
            alt={alt || name || 'User avatar'}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <span className="tracking-tight">{initials}</span>
        )}
      </div>

      {showStatus && (
        <span
          className={cn(
            'absolute bottom-0 right-0 rounded-full ring-2 ring-background shadow-sm',
            statusDotSizes[size],
            statusColors[statusColor]
          )}
          aria-hidden="true"
        />
      )}
    </div>
  );
}

export { Avatar as UserAvatar };
