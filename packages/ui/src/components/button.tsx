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
      'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150 ease-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--background))] disabled:opacity-50 disabled:pointer-events-none cursor-pointer select-none active:scale-[0.98] active:translate-y-0';

    const variants = {
      primary:
        'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-500/25 border border-indigo-400/30 hover:-translate-y-0.5 active:translate-y-0',
      secondary:
        'bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))] hover:bg-[hsl(var(--surface-subtle))] hover:border-[hsl(var(--border-strong))] border border-[hsl(var(--border))] shadow-sm hover:-translate-y-0.5 active:translate-y-0',
      outline:
        'border border-[hsl(var(--border))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--surface-subtle))] hover:border-[hsl(var(--border-strong))] hover:text-[hsl(var(--foreground))] hover:-translate-y-0.5 active:translate-y-0',
      ghost:
        'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--surface-subtle))] hover:text-[hsl(var(--foreground))] active:scale-[0.98]',
      danger:
        'bg-rose-600 text-white hover:bg-rose-500 hover:shadow-lg hover:shadow-rose-600/25 border border-rose-500/30 hover:-translate-y-0.5 active:translate-y-0',
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

export interface IconButtonProps extends Omit<ButtonProps, 'children'> {
  icon: React.ReactNode;
  'aria-label': string;
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, className, size = 'icon', ...props }, ref) => {
    return (
      <Button ref={ref} size={size} className={cn('p-2', className)} {...props}>
        {icon}
      </Button>
    );
  }
);

IconButton.displayName = 'IconButton';
