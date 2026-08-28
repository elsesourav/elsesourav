import React from 'react';
import { Inbox } from 'lucide-react';
import { cn } from '@/utils/cn';
import './DataDisplay.css';

export interface EmptyStateProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  readonly icon?: React.ReactNode;
  readonly title?: React.ReactNode;
  readonly description?: React.ReactNode;
  readonly action?: React.ReactNode;
}

export const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  (
    {
      className,
      icon = <Inbox size={36} aria-hidden="true" />,
      title = 'No items found',
      description,
      action,
      ...props
    },
    ref
  ) => {
    return (
      <div ref={ref} className={cn('ui-empty-state', className)} {...props}>
        {icon && <div className="ui-empty-state__icon">{icon}</div>}
        {title && <h3 className="ui-empty-state__title">{title}</h3>}
        {description && <p className="ui-empty-state__description">{description}</p>}
        {action && <div className="ui-empty-state__action">{action}</div>}
      </div>
    );
  }
);

EmptyState.displayName = 'EmptyState';
