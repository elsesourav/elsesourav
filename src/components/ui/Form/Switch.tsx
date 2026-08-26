import React from 'react';
import { cn } from '@/utils/cn';

export interface SwitchProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'type' | 'size'
> {
  readonly label?: React.ReactNode;
  readonly switchSize?: 'sm' | 'md' | 'lg';
}

export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, label, checked, disabled, switchSize = 'md', id, ...props }, ref) => {
    return (
      <label
        className={cn(
          'ui-switch-container',
          `ui-switch-container--${switchSize}`,
          disabled && 'is-disabled',
          className
        )}
      >
        <input
          ref={ref}
          type="checkbox"
          role="switch"
          id={id}
          checked={checked}
          disabled={disabled}
          aria-checked={checked}
          className="ui-switch__input"
          {...props}
        />
        <span className="ui-switch__track" aria-hidden="true">
          <span className="ui-switch__thumb" />
        </span>
        {label && <span className="ui-switch__label">{label}</span>}
      </label>
    );
  }
);

Switch.displayName = 'Switch';
