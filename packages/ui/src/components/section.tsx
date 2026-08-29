import * as React from 'react';
import { cn } from '../lib/utils';

export type SectionSpacing = 'none' | 'sm' | 'md' | 'lg' | 'xl';
export type SectionSurface = 'transparent' | 'subtle' | 'solid' | 'elevated' | 'glass';

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  spacing?: SectionSpacing;
  surface?: SectionSurface;
  fullBleed?: boolean;
  as?: React.ElementType;
}

export function Section({
  spacing = 'md',
  surface = 'transparent',
  fullBleed = false,
  as: Component = 'section',
  className,
  children,
  ...props
}: SectionProps) {
  const spacings: Record<SectionSpacing, string> = {
    none: '',
    sm: 'py-6 sm:py-10',
    md: 'py-10 sm:py-16 lg:py-20',
    lg: 'py-16 sm:py-24 lg:py-28',
    xl: 'py-20 sm:py-28 lg:py-36',
  };

  const surfaces: Record<SectionSurface, string> = {
    transparent: '',
    subtle: 'bg-zinc-900/30 border-y border-zinc-800/60',
    solid: 'bg-zinc-950 border-y border-zinc-800',
    elevated: 'bg-zinc-900/60 border-y border-zinc-800/80 shadow-md',
    glass: 'bg-zinc-950/60 backdrop-blur-md border-y border-zinc-800/80',
  };

  return (
    <Component
      className={cn(
        'relative w-full',
        spacings[spacing],
        surfaces[surface],
        !fullBleed && 'overflow-hidden',
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

export interface SectionHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  caption?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  align?: 'left' | 'center' | 'split';
}

export function SectionHeader({
  caption,
  title,
  description,
  actions,
  align = 'left',
  className,
  ...props
}: SectionHeaderProps) {
  if (align === 'split') {
    return (
      <div
        className={cn(
          'flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 sm:mb-12 pb-4 border-b border-zinc-800/60',
          className
        )}
        {...props}
      >
        <div className="space-y-1.5 max-w-2xl">
          {caption && (
            <span className="text-caption text-indigo-400 font-semibold tracking-wider uppercase">
              {caption}
            </span>
          )}
          <h2 className="text-h2 font-bold text-white tracking-tight leading-tight">{title}</h2>
          {description && (
            <p className="text-body text-zinc-400 leading-relaxed text-sm">{description}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-3 shrink-0">{actions}</div>}
      </div>
    );
  }

  const alignments = {
    left: 'text-left',
    center: 'text-center mx-auto',
  };

  return (
    <div
      className={cn('max-w-3xl mb-8 sm:mb-12 space-y-2', alignments[align], className)}
      {...props}
    >
      {caption && (
        <span className="text-caption text-indigo-400 font-semibold tracking-wider uppercase">
          {caption}
        </span>
      )}
      <h2 className="text-h2 font-bold text-white tracking-tight leading-tight">{title}</h2>
      {description && (
        <p className="text-body text-zinc-400 leading-relaxed max-w-2xl">{description}</p>
      )}
      {actions && <div className="pt-3 flex items-center gap-3">{actions}</div>}
    </div>
  );
}

export interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  eyebrow?: string;
  badge?: React.ReactNode;
  title: string;
  description?: string;
  metadata?: React.ReactNode;
  actions?: React.ReactNode;
  align?: 'left' | 'center' | 'split';
}

export function PageHeader({
  eyebrow,
  badge,
  title,
  description,
  metadata,
  actions,
  align = 'left',
  className,
  ...props
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        'pb-8 pt-2 sm:pt-4 border-b border-zinc-800/80 mb-8 sm:mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between',
        align === 'center' && 'text-center md:flex-col md:items-center',
        className
      )}
      {...props}
    >
      <div className="space-y-3 max-w-3xl">
        {(eyebrow || badge) && (
          <div className="flex flex-wrap items-center gap-2.5">
            {eyebrow && (
              <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider font-mono">
                {eyebrow}
              </span>
            )}
            {badge}
          </div>
        )}
        <h1 className="text-h1 font-extrabold text-white tracking-tight leading-tight">{title}</h1>
        {description && (
          <p className="text-body text-zinc-400 leading-relaxed">{description}</p>
        )}
        {metadata && <div className="pt-1">{metadata}</div>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-3 shrink-0">{actions}</div>}
    </div>
  );
}

export function ActionGroup({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex flex-wrap items-center gap-3', className)}
      {...props}
    />
  );
}
