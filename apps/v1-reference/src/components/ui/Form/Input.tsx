import React from 'react';
import { cn } from '@/utils/cn';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  readonly isInvalid?: boolean;
  readonly leftAdornment?: React.ReactNode;
  readonly rightAdornment?: React.ReactNode;
  readonly leftIcon?: React.ReactNode;
  readonly rightIcon?: React.ReactNode;
  readonly inputSize?: 'sm' | 'md' | 'lg';
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      isInvalid = false,
      leftAdornment,
      rightAdornment,
      leftIcon,
      rightIcon,
      inputSize = 'md',
      disabled,
      ...props
    },
    ref
  ) => {
    const startAdornment = leftIcon || leftAdornment;
    const endAdornment = rightIcon || rightAdornment;

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
        {startAdornment && <span className="ui-input__adornment">{startAdornment}</span>}
        <input
          ref={ref}
          disabled={disabled}
          aria-invalid={isInvalid}
          className="ui-input"
          {...props}
        />
        {endAdornment && <span className="ui-input__adornment">{endAdornment}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';
