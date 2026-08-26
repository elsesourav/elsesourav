import React from 'react';
import { cn } from '@/utils/cn';
import './Button.css';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  readonly variant?: 'primary' | 'glass' | 'ghost' | 'outline';
  readonly size?: 'sm' | 'md' | 'lg';
  readonly isLoading?: boolean;
  readonly leftIcon?: React.ReactNode;
  readonly rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'glass',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  disabled,
  ...props
}) => {
  return (
    <button
      className={cn('ui-button', `ui-button--${variant}`, `ui-button--${size}`, className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="ui-button__spinner" aria-hidden="true" />
      ) : (
        leftIcon && <span className="ui-button__icon">{leftIcon}</span>
      )}
      <span className="ui-button__content">{children}</span>
      {!isLoading && rightIcon && <span className="ui-button__icon">{rightIcon}</span>}
    </button>
  );
};
