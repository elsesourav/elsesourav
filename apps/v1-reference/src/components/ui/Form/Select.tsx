import React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface SelectOption {
  readonly value: string;
  readonly label: string;
  readonly disabled?: boolean;
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  readonly options?: readonly SelectOption[];
  readonly placeholder?: string;
  readonly isInvalid?: boolean;
  readonly selectSize?: 'sm' | 'md' | 'lg';
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      children,
      className,
      options,
      placeholder,
      isInvalid = false,
      selectSize = 'md',
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <div
        className={cn(
          'ui-select-wrapper',
          `ui-select-wrapper--${selectSize}`,
          isInvalid && 'is-invalid',
          disabled && 'is-disabled',
          className
        )}
      >
        <select
          ref={ref}
          disabled={disabled}
          aria-invalid={isInvalid}
          className="ui-select"
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options
            ? options.map((opt) => (
                <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                  {opt.label}
                </option>
              ))
            : children}
        </select>
        <ChevronDown size={16} className="ui-select__arrow" aria-hidden="true" />
      </div>
    );
  }
);

Select.displayName = 'Select';
