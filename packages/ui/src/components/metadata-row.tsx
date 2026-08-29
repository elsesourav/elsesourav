import * as React from 'react';
import { cn } from '../lib/utils';
import { LucideIcon } from 'lucide-react';

export interface MetadataItemProps {
  icon?: LucideIcon;
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}

export function MetadataItem({
  icon: Icon,
  label,
  value,
  mono = false,
}: MetadataItemProps) {
  return (
    <div className="flex items-center gap-2 text-xs text-zinc-400">
      {Icon && <Icon className="w-3.5 h-3.5 text-zinc-500 shrink-0" />}
      <span className="text-zinc-500">{label}:</span>
      <span className={cn('text-zinc-200 font-medium', mono && 'font-mono text-[11px]')}>
        {value}
      </span>
    </div>
  );
}

export interface MetadataRowProps extends React.HTMLAttributes<HTMLDivElement> {
  separator?: boolean;
}

export function MetadataRow({
  separator = true,
  className,
  children,
  ...props
}: MetadataRowProps) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-zinc-400',
        separator && 'pb-4 border-b border-zinc-800/80',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
