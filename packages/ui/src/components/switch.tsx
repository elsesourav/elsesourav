import * as React from 'react';
import { cn } from '../lib/utils';

export interface SwitchProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  label?: React.ReactNode;
  description?: React.ReactNode;
}

export function Switch({
  className,
  checked,
  defaultChecked = false,
  onCheckedChange,
  disabled,
  label,
  description,
  id,
  ...props
}: SwitchProps) {
  const generatedId = React.useId();
  const switchId = id || generatedId;
  const [isChecked, setIsChecked] = React.useState(Boolean(checked ?? defaultChecked));

  React.useEffect(() => {
    if (checked !== undefined) {
      setIsChecked(checked);
    }
  }, [checked]);

  const toggle = () => {
    if (disabled) return;
    const next = !isChecked;
    if (checked === undefined) {
      setIsChecked(next);
    }
    onCheckedChange?.(next);
  };

  return (
    <div className="flex items-center justify-between gap-4 select-none">
      {(label || description) && (
        <div className="flex flex-col text-xs leading-tight">
          {label && (
            <label
              htmlFor={switchId}
              onClick={toggle}
              className={cn('font-medium text-zinc-200 cursor-pointer', disabled && 'opacity-50 cursor-not-allowed')}
            >
              {label}
            </label>
          )}
          {description && <p className="text-zinc-500 mt-0.5">{description}</p>}
        </div>
      )}
      <button
        type="button"
        role="switch"
        id={switchId}
        aria-checked={isChecked}
        disabled={disabled}
        onClick={toggle}
        className={cn(
          'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950',
          'disabled:cursor-not-allowed disabled:opacity-50',
          isChecked ? 'bg-indigo-600' : 'bg-zinc-800',
          className
        )}
        {...props}
      >
        <span
          className={cn(
            'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out',
            isChecked ? 'translate-x-5' : 'translate-x-0'
          )}
        />
      </button>
    </div>
  );
}
