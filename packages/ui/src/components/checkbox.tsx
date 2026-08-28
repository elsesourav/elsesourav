import * as React from 'react';
import { cn } from '../lib/utils';
import { Check } from 'lucide-react';

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: React.ReactNode;
  description?: React.ReactNode;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, description, checked, defaultChecked, onChange, id, disabled, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;
    const [isChecked, setIsChecked] = React.useState(Boolean(checked || defaultChecked));

    React.useEffect(() => {
      if (checked !== undefined) {
        setIsChecked(Boolean(checked));
      }
    }, [checked]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (disabled) return;
      if (checked === undefined) {
        setIsChecked(e.target.checked);
      }
      onChange?.(e);
    };

    return (
      <div className="flex items-start gap-3 select-none">
        <div className="relative flex items-center justify-center">
          <input
            type="checkbox"
            id={inputId}
            ref={ref}
            checked={isChecked}
            disabled={disabled}
            onChange={handleChange}
            className="peer sr-only"
            {...props}
          />
          <div
            className={cn(
              'h-5 w-5 shrink-0 rounded border border-zinc-700 bg-zinc-950 transition-all flex items-center justify-center cursor-pointer',
              'peer-focus-visible:ring-2 peer-focus-visible:ring-indigo-500 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-zinc-950',
              'peer-checked:bg-indigo-600 peer-checked:border-indigo-600',
              'peer-disabled:opacity-50 peer-disabled:cursor-not-allowed',
              className
            )}
          >
            {isChecked && <Check className="h-3.5 w-3.5 text-white stroke-[3]" />}
          </div>
        </div>
        {(label || description) && (
          <div className="flex flex-col text-xs leading-tight">
            {label && (
              <label
                htmlFor={inputId}
                className={cn('font-medium text-zinc-200 cursor-pointer', disabled && 'opacity-50 cursor-not-allowed')}
              >
                {label}
              </label>
            )}
            {description && <p className="text-zinc-500 mt-0.5">{description}</p>}
          </div>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';
