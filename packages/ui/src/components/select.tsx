import * as React from 'react';
import { cn } from '../lib/utils';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options?: SelectOption[];
  error?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, options, children, error, id, ...props }, ref) => {
    const errorId = id ? `${id}-error` : undefined;

    return (
      <div className="relative w-full">
        <select
          id={id}
          ref={ref}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className={cn(
            'flex h-10 min-h-[40px] w-full appearance-none rounded-xl border border-[hsl(var(--input))] bg-[hsl(var(--surface-subtle))] px-3.5 py-2 text-sm text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--background))] disabled:cursor-not-allowed disabled:opacity-50 transition-colors pr-10 cursor-pointer',
            error && 'border-rose-500 focus-visible:ring-rose-500',
            className
          )}
          {...props}
        >
          {options
            ? options.map((opt) => (
                <option
                  key={opt.value}
                  value={opt.value}
                  disabled={opt.disabled}
                  className="bg-[hsl(var(--surface))] text-[hsl(var(--foreground))] py-1"
                >
                  {opt.label}
                </option>
              ))
            : children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
        {error && (
          <p id={errorId} role="alert" className="mt-1.5 text-xs text-rose-400 font-medium">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
