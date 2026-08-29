import * as React from 'react';
import { cn } from '../lib/utils';
import { Card, CardHeader, CardTitle, CardDescription } from './card';
import { LucideIcon, FolderSearch, BellOff, Inbox, BookmarkX } from 'lucide-react';

export type EmptyStateVariant = 'default' | 'search' | 'library' | 'notifications' | 'support';

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: EmptyStateVariant;
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({
  variant = 'default',
  icon,
  title,
  description,
  action,
  className,
  ...props
}: EmptyStateProps) {
  const defaultIcons: Record<EmptyStateVariant, LucideIcon> = {
    default: FolderSearch,
    search: FolderSearch,
    library: BookmarkX,
    notifications: BellOff,
    support: Inbox,
  };

  const IconComponent = icon || defaultIcons[variant];

  return (
    <Card
      className={cn('text-center py-12 px-6 flex flex-col items-center justify-center rounded-2xl border-zinc-800/80 bg-zinc-950/60 shadow-sm', className)}
      {...props}
    >
      <CardHeader className="flex flex-col items-center p-0 space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 mb-2">
          <IconComponent className="w-6 h-6" />
        </div>
        <CardTitle className="text-lg text-zinc-100 font-semibold">{title}</CardTitle>
        <CardDescription className="max-w-sm text-xs text-zinc-400 leading-relaxed">{description}</CardDescription>
      </CardHeader>
      {action && <div className="mt-6">{action}</div>}
    </Card>
  );
}
