import * as React from 'react';
import { cn } from '../lib/utils';
import { Card } from './card';
import { LucideIcon, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon?: LucideIcon;
  description?: string;
}

export function StatCard({
  label,
  value,
  change,
  changeType = 'neutral',
  icon: Icon,
  description,
  className,
  ...props
}: StatCardProps) {
  return (
    <Card className={cn('p-6 space-y-2', className)} {...props}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-zinc-400">{label}</span>
        {Icon && (
          <div className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400">
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-white tracking-tight">{value}</div>
      {(change || description) && (
        <div className="flex items-center gap-2 text-xs pt-1">
          {change && (
            <span
              className={cn(
                'inline-flex items-center font-medium',
                changeType === 'positive' && 'text-emerald-400',
                changeType === 'negative' && 'text-red-400',
                changeType === 'neutral' && 'text-zinc-400'
              )}
            >
              {changeType === 'positive' && <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />}
              {changeType === 'negative' && <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />}
              {change}
            </span>
          )}
          {description && <span className="text-zinc-500">{description}</span>}
        </div>
      )}
    </Card>
  );
}
