import * as React from 'react';
import { cn } from '../lib/utils';

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  spacing?: 'sm' | 'md' | 'lg' | 'none';
  as?: React.ElementType;
}

export function Section({
  spacing = 'md',
  as: Component = 'section',
  className,
  children,
  ...props
}: SectionProps) {
  const spacings = {
    none: '',
    sm: 'py-8 sm:py-12',
    md: 'py-12 sm:py-16 lg:py-20',
    lg: 'py-16 sm:py-24 lg:py-32',
  };

  return (
    <Component className={cn('relative w-full', spacings[spacing], className)} {...props}>
      {children}
    </Component>
  );
}

export interface SectionHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  caption?: string;
  title: string;
  description?: string;
  align?: 'left' | 'center' | 'right';
}

export function SectionHeader({
  caption,
  title,
  description,
  align = 'left',
  className,
  ...props
}: SectionHeaderProps) {
  const alignments = {
    left: 'text-left',
    center: 'text-center mx-auto',
    right: 'text-right ml-auto',
  };

  return (
    <div className={cn('max-w-3xl mb-8 sm:mb-12 space-y-2', alignments[align], className)} {...props}>
      {caption && (
        <span className="text-caption text-indigo-400 font-semibold tracking-wider">
          {caption}
        </span>
      )}
      <h2 className="text-h2 font-bold text-white tracking-tight">{title}</h2>
      {description && (
        <p className="text-body text-zinc-400 leading-relaxed max-w-2xl">{description}</p>
      )}
    </div>
  );
}

export interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  badge?: React.ReactNode;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  align?: 'left' | 'center';
}

export function PageHeader({
  badge,
  title,
  description,
  actions,
  align = 'left',
  className,
  ...props
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        'pb-8 pt-4 sm:pt-6 border-b border-zinc-800/80 mb-8 sm:mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between',
        align === 'center' && 'text-center md:flex-col md:items-center',
        className
      )}
      {...props}
    >
      <div className="space-y-3 max-w-3xl">
        {badge && <div className="inline-flex">{badge}</div>}
        <h1 className="text-h1 font-extrabold text-white tracking-tight leading-tight">{title}</h1>
        {description && (
          <p className="text-body text-zinc-400 leading-relaxed">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-3 shrink-0">{actions}</div>}
    </div>
  );
}
