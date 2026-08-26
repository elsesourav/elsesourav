import React from 'react';
import { cn } from '@/utils/cn';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  readonly isInvalid?: boolean;
  readonly leftAdornment?: React.ReactNode;
  readonly rightAdornment?: React.ReactNode;
  readonly inputSize?: 'sm' | 'md' | 'lg';
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      isInvalid = false,
      leftAdornment,
      rightAdornment,
      inputSize = 'md',
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <div
        className={cn(
          'ui-input-wrapper',
          `ui-input-wrapper--${inputSize}`,
          isInvalid && 'is-invalid',
          disabled && 'is-disabled',
          className
        )}
      >
        {leftAdornment && <span className="ui-input__adornment">{leftAdornment}</span>}
        <input
          ref={ref}
          disabled={disabled}
          aria-invalid={isInvalid}
          className="ui-input"
          {...props}
        />
        {rightAdornment && <span className="ui-input__adornment">{rightAdornment}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';
