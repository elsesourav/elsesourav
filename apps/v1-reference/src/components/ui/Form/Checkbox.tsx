import React, { useEffect, useRef } from 'react';
import { Check, Minus } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface CheckboxProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'type' | 'size'
> {
  readonly isIndeterminate?: boolean;
  readonly isInvalid?: boolean;
  readonly label?: React.ReactNode;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      className,
      isIndeterminate = false,
      isInvalid = false,
      label,
      checked,
      disabled,
      id,
      ...props
    },
    ref
  ) => {
    const internalRef = useRef<HTMLInputElement | null>(null);

    const setRefs = (element: HTMLInputElement | null): void => {
      internalRef.current = element;
      if (typeof ref === 'function') {
        ref(element);
      } else if (ref) {
        ref.current = element;
      }
    };

    useEffect(() => {
      if (internalRef.current) {
        internalRef.current.indeterminate = isIndeterminate;
      }
    }, [isIndeterminate]);

    return (
      <label
        className={cn(
          'ui-checkbox-container',
          disabled && 'is-disabled',
          isInvalid && 'is-invalid',
          className
        )}
      >
        <input
          ref={setRefs}
          type="checkbox"
          id={id}
          checked={checked}
          disabled={disabled}
          aria-invalid={isInvalid}
          className="ui-checkbox__input"
          {...props}
        />
        <span className="ui-checkbox__box" aria-hidden="true">
          {isIndeterminate ? (
            <Minus size={12} className="ui-checkbox__icon" />
          ) : (
            checked && <Check size={12} className="ui-checkbox__icon" />
          )}
        </span>
        {label && <span className="ui-checkbox__label">{label}</span>}
      </label>
    );
  }
);

Checkbox.displayName = 'Checkbox';
