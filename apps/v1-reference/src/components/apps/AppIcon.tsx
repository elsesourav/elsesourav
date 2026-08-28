import React from 'react';
import { Image } from '@/components/ui';
import './AppIcon.css';

export type AppIconSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | number;
export type AppIconVariant = 'squircle' | 'rounded' | 'circle';

export interface AppIconProps {
  readonly iconUrl?: string | null;
  readonly name: string;
  readonly size?: AppIconSize;
  readonly variant?: AppIconVariant;
  readonly priority?: boolean;
  readonly className?: string;
  readonly alt?: string;
}

const SIZE_MAP: Record<string, number> = {
  sm: 32,
  md: 40,
  lg: 48,
  xl: 56,
  '2xl': 104,
};

export const AppIcon: React.FC<AppIconProps> = ({
  iconUrl,
  name,
  size = 'md',
  variant = 'squircle',
  priority = false,
  className = '',
  alt,
}) => {
  const pixelSize = typeof size === 'number' ? size : (SIZE_MAP[size] || 48);
  const initial = name ? name.trim().charAt(0).toUpperCase() : 'A';
  const sizeClass = typeof size === 'string' ? `app-icon-wrapper--size-${size}` : '';

  const fallbackElement = (
    <span className="app-icon-fallback" aria-hidden="true">
      {initial}
    </span>
  );

  return (
    <div
      className={`app-icon-wrapper app-icon-wrapper--${variant} ${sizeClass} ${className}`.trim()}
      style={{ width: `${pixelSize}px`, height: `${pixelSize}px` }}
      data-testid="app-icon"
    >
      <Image
        src={iconUrl}
        alt={alt || `${name} application icon`}
        width={pixelSize}
        height={pixelSize}
        aspectRatio="1/1"
        priority={priority}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        fallback={fallbackElement}
        className="app-icon-img"
        containerClassName="w-full h-full"
      />
    </div>
  );
};
