import React from 'react';
import { cn } from '@/utils/cn';
import './Foundation.css';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'glass';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  readonly variant?: ButtonVariant;
  readonly size?: ButtonSize;
  readonly isLoading?: boolean;
  readonly leftIcon?: React.ReactNode;
  readonly rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className,
      variant = 'secondary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      type = 'button',
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        className={cn('ui-btn', `ui-btn--${variant}`, `ui-btn--${size}`, className)}
        disabled={disabled || isLoading}
        aria-busy={isLoading}
        {...props}
      >
        {isLoading ? (
          <span className="ui-btn__spinner" aria-hidden="true" />
        ) : (
          leftIcon && <span className="ui-btn__icon ui-btn__icon--left">{leftIcon}</span>
        )}
        {children && <span className="ui-btn__label">{children}</span>}
        {!isLoading && rightIcon && (
          <span className="ui-btn__icon ui-btn__icon--right">{rightIcon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
