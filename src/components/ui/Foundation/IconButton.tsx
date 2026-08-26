import React from 'react';
import { Button, type ButtonVariant, type ButtonSize } from './Button';
import { cn } from '@/utils/cn';

export interface IconButtonProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'children'
> {
  readonly icon: React.ReactNode;
  readonly 'aria-label': string;
  readonly variant?: ButtonVariant;
  readonly size?: ButtonSize;
  readonly isLoading?: boolean;
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, className, size = 'icon', 'aria-label': ariaLabel, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        size={size}
        aria-label={ariaLabel}
        className={cn('ui-icon-btn', className)}
        {...props}
      >
        {icon}
      </Button>
    );
  }
);

IconButton.displayName = 'IconButton';
