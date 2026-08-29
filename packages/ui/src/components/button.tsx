import * as React from 'react';
import { cn } from '../lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      loading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const isCurrentlyLoading = Boolean(isLoading || loading);

    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 disabled:opacity-50 disabled:pointer-events-none cursor-pointer select-none active:scale-[0.98]';

    const variants = {
      primary:
        'bg-indigo-600 text-white hover:bg-indigo-500 shadow-md shadow-indigo-600/20 border border-indigo-500/30',
      secondary:
        'bg-zinc-800 text-zinc-100 hover:bg-zinc-700 border border-zinc-700/80 shadow-sm',
      outline:
        'border border-zinc-700/80 text-zinc-200 hover:bg-zinc-800/60 hover:text-white',
      ghost:
        'text-zinc-300 hover:bg-zinc-800/50 hover:text-white',
      danger:
        'bg-rose-600 text-white hover:bg-rose-500 shadow-md shadow-rose-600/20 border border-rose-500/30',
    };

    const sizes = {
      sm: 'text-xs px-3 py-1.5 gap-1.5 min-h-[32px]',
      md: 'text-sm px-4 py-2 gap-2 min-h-[40px]',
      lg: 'text-base px-6 py-2.5 gap-2.5 min-h-[48px]',
      icon: 'p-2 w-10 h-10 min-h-[40px] min-w-[40px]',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isCurrentlyLoading}
        aria-busy={isCurrentlyLoading || undefined}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isCurrentlyLoading && (
          <span
            className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"
            aria-hidden="true"
          />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
