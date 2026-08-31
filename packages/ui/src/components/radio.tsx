'use client';

import * as React from 'react';
import { cn } from '../lib/utils';

interface RadioGroupContextValue {
  value?: string;
  name?: string;
  onChange?: (val: string) => void;
  disabled?: boolean;
}

const RadioGroupContext = React.createContext<RadioGroupContextValue | null>(null);

export interface RadioGroupProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  value?: string;
  defaultValue?: string;
  name?: string;
  onChange?: (val: string) => void;
  disabled?: boolean;
}

export function RadioGroup({
  value: controlledValue,
  defaultValue,
  name,
  onChange,
  disabled,
  className,
  children,
  ...props
}: RadioGroupProps) {
  const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue || '');
  const value = controlledValue !== undefined ? controlledValue : uncontrolledValue;

  const handleChange = React.useCallback(
    (nextVal: string) => {
      if (controlledValue === undefined) {
        setUncontrolledValue(nextVal);
      }
      onChange?.(nextVal);
    },
    [controlledValue, onChange]
  );

  return (
    <RadioGroupContext.Provider value={{ value, name, onChange: handleChange, disabled }}>
      <div role="radiogroup" className={cn('space-y-2', className)} {...props}>
        {children}
      </div>
    </RadioGroupContext.Provider>
  );
}

export interface RadioGroupItemProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: string;
  label?: string;
  description?: string;
}

export function RadioGroupItem({
  value,
  label,
  description,
  className,
  id,
  disabled,
  ...props
}: RadioGroupItemProps) {
  const context = React.useContext(RadioGroupContext);
  const generatedId = React.useId();
  const itemId = id || generatedId;

  const isChecked = context?.value === value;
  const isDisabled = disabled || context?.disabled;

  return (
    <div className={cn('flex items-start gap-3 cursor-pointer select-none', className)}>
      <div className="relative flex items-center justify-center mt-0.5">
        <input
          type="radio"
          id={itemId}
          name={context?.name}
          value={value}
          checked={isChecked}
          disabled={isDisabled}
          onChange={() => context?.onChange?.(value)}
          className="peer sr-only"
          {...props}
        />
        <div
          className={cn(
            'w-4 h-4 rounded-full border border-zinc-700 bg-zinc-950 transition-all flex items-center justify-center peer-focus-visible:ring-2 peer-focus-visible:ring-indigo-500 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-zinc-950',
            isChecked && 'border-indigo-500 bg-indigo-600',
            isDisabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          {isChecked && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
        </div>
      </div>
      {label && (
        <label htmlFor={itemId} className="cursor-pointer text-xs font-medium text-zinc-200">
          <div>{label}</div>
          {description && (
            <div className="text-[11px] text-zinc-500 mt-0.5 font-normal">{description}</div>
          )}
        </label>
      )}
    </div>
  );
}
