import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { Card } from '../Surfaces/Card';
import { cn } from '@/utils/cn';

export interface StatProps extends React.HTMLAttributes<HTMLDivElement> {
  readonly label: React.ReactNode;
  readonly value: React.ReactNode;
  readonly change?: {
    readonly value: string | number;
    readonly trend: 'up' | 'down' | 'neutral';
    readonly timeframe?: string;
  };
  readonly icon?: React.ReactNode;
  readonly helperText?: React.ReactNode;
  readonly isGlass?: boolean;
}

export const Stat: React.FC<StatProps> = ({
  className,
  label,
  value,
  change,
  icon,
  helperText,
  isGlass = false,
  ...props
}) => {
  return (
    <Card
      variant={isGlass ? 'glass' : 'default'}
      padding="md"
      className={cn('ui-stat-card', className)}
      {...props}
    >
      <div className="ui-stat__header">
        <span className="ui-stat__label">{label}</span>
        {icon && <div className="ui-stat__icon">{icon}</div>}
      </div>

      <div className="ui-stat__value">{value}</div>

      {(change || helperText) && (
        <div className="ui-stat__footer">
          {change && (
            <span
              className={cn('ui-stat__change', `ui-stat__change--${change.trend}`)}
              aria-label={`Trend: ${change.trend} ${change.value}`}
            >
              {change.trend === 'up' && <ArrowUpRight size={14} aria-hidden="true" />}
              {change.trend === 'down' && <ArrowDownRight size={14} aria-hidden="true" />}
              {change.trend === 'neutral' && <Minus size={14} aria-hidden="true" />}
              <span>{change.value}</span>
            </span>
          )}
          {change?.timeframe && <span className="ui-stat__timeframe">{change.timeframe}</span>}
          {helperText && !change && <span className="ui-stat__helper">{helperText}</span>}
        </div>
      )}
    </Card>
  );
};
