import * as React from 'react';
import { cn } from '../lib/utils';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | 'primary'
    | 'secondary'
    | 'subtle'
    | 'outline'
    | 'ghost'
    | 'danger'
    | 'destructive';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      loading = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const isCurrentlyLoading = Boolean(isLoading || loading);
    const normalizedVariant = variant === 'destructive' ? 'danger' : variant;

    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-xl transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100 cursor-pointer select-none';

    const variants: Record<string, string> = {
      primary:
        'bg-indigo-600 text-white hover:bg-indigo-500 shadow-md shadow-indigo-600/20 active:bg-indigo-700',
      secondary:
        'bg-zinc-800 text-zinc-100 hover:bg-zinc-700 border border-zinc-700/80 active:bg-zinc-800',
      subtle:
        'bg-zinc-900/80 text-zinc-300 hover:bg-zinc-800 hover:text-white border border-zinc-800 active:bg-zinc-850',
      outline:
        'border border-zinc-700 text-zinc-200 hover:bg-zinc-800/60 hover:text-white hover:border-zinc-600 active:bg-zinc-800/80',
      ghost:
        'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-100 active:bg-zinc-800/70',
      danger:
        'bg-rose-600 text-white hover:bg-rose-500 shadow-md shadow-rose-600/20 active:bg-rose-700',
    };

    const sizes: Record<string, string> = {
      sm: 'text-xs px-3 py-1.5 gap-1.5 min-h-[32px]',
      md: 'text-sm px-4 py-2 gap-2 min-h-[40px]',
      lg: 'text-base px-5 py-2.5 gap-2.5 min-h-[48px]',
      icon: 'p-2 aspect-square min-h-[36px] min-w-[36px]',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isCurrentlyLoading}
        aria-busy={isCurrentlyLoading || undefined}
        aria-disabled={disabled || isCurrentlyLoading || undefined}
        className={cn(
          baseStyles,
          variants[normalizedVariant] || variants.primary,
          sizes[size],
          className
        )}
        {...props}
      >
        {isCurrentlyLoading ? (
          <span
            className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-1.5"
            aria-hidden="true"
          />
        ) : (
          leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>
        )}
        {children}
        {!isCurrentlyLoading && rightIcon && (
          <span className="inline-flex shrink-0">{rightIcon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export interface IconButtonProps
  extends Omit<ButtonProps, 'leftIcon' | 'rightIcon' | 'size'> {
  'aria-label': string;
  size?: 'sm' | 'md' | 'lg';
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, size = 'md', ...props }, ref) => {
    const iconSizes: Record<string, string> = {
      sm: 'p-1.5 min-h-[28px] min-w-[28px] text-xs',
      md: 'p-2 min-h-[36px] min-w-[36px] text-sm',
      lg: 'p-2.5 min-h-[44px] min-w-[44px] text-base',
    };

    return (
      <Button
        ref={ref}
        size="icon"
        className={cn('rounded-lg', iconSizes[size], className)}
        {...props}
      />
    );
  }
);

IconButton.displayName = 'IconButton';
