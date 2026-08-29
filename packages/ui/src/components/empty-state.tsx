import * as React from 'react';
import { cn } from '../lib/utils';
import { Card, CardHeader, CardTitle, CardDescription } from './card';
import { LucideIcon, FolderSearch } from 'lucide-react';

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({
  icon: Icon = FolderSearch,
  title,
  description,
  action,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <Card
      className={cn('text-center py-12 px-6 flex flex-col items-center justify-center', className)}
      {...props}
    >
      <CardHeader className="flex flex-col items-center p-0">
        <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4">
          <Icon className="w-6 h-6 text-zinc-400" />
        </div>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription className="max-w-sm mt-1.5">{description}</CardDescription>
      </CardHeader>
      {action && <div className="mt-6">{action}</div>}
    </Card>
  );
}
