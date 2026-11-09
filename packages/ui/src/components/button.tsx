'use client';

import * as React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { cn } from '../lib/utils';

const CELL = { type: 'spring', stiffness: 520, damping: 34, mass: 0.45 } as const;
const CROSSFADE = { type: 'spring', stiffness: 260, damping: 34, mass: 0.8 } as const;
const DRAW_EASE = [0.23, 1, 0.32, 1] as const;
const BLOOM = { duration: 0.5, ease: 'linear' } as const;
const BASE_RIPPLE = 40;

export interface ButtonProps
  extends Omit<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    'onAnimationStart' | 'onDragStart' | 'onDragEnd' | 'onDrag'
  > {
  variant?:
    | 'primary'
    | 'secondary'
    | 'outline'
    | 'ghost'
    | 'danger'
    | 'destructive'
    | 'subtle'
    | 'elevated';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'icon' | 'icon-xs' | 'icon-sm' | 'icon-lg';
  isLoading?: boolean;
  loading?: boolean;
  loadingText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  ripple?: boolean;
  copyValue?: string;
  copiedLabel?: string;
  copyTimeout?: number;
  onCopySuccess?: (value: string) => void;
  onCopyError?: (error: unknown) => void;
}

type RippleSpec = {
  id: number;
  x: number;
  y: number;
  scale: number;
  released: boolean;
};

function writeClipboardFallback(text: string): boolean {
  if (typeof document === 'undefined') return false;
  const area = document.createElement('textarea');
  area.value = text;
  area.setAttribute('readonly', '');
  area.style.position = 'fixed';
  area.style.top = '0';
  area.style.left = '0';
  area.style.opacity = '0';
  document.body.appendChild(area);

  const selection = document.getSelection();
  const previous = selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null;

  area.select();
  let ok = false;
  try {
    ok = document.execCommand('copy');
  } catch {
    ok = false;
  }

  document.body.removeChild(area);
  if (selection && previous) {
    selection.removeAllRanges();
    selection.addRange(previous);
  }
  return ok;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      loading = false,
      loadingText,
      leftIcon,
      rightIcon,
      ripple = false,
      copyValue,
      copiedLabel,
      copyTimeout = 2000,
      onCopySuccess,
      onCopyError,
      disabled = false,
      children,
      onClick,
      ...props
    },
    ref
  ) => {
    const isCurrentlyLoading = Boolean(isLoading || loading);
    const reduced = useReducedMotion();

    // Copy state handling
    const [copyStatus, setCopyStatus] = React.useState<'idle' | 'copied' | 'error'>('idle');
    const copyTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

    React.useEffect(() => {
      return () => {
        if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
      };
    }, []);

    // Ripple state handling
    const [ripples, setRipples] = React.useState<RippleSpec[]>([]);
    const rippleSeq = React.useRef(0);
    const rippleTimers = React.useRef(new Map<number, ReturnType<typeof setTimeout>[]>());
    const ripplePointers = React.useRef(new Map<number, number>());

    const clearRippleTimers = React.useCallback(() => {
      rippleTimers.current.forEach((timers) => timers.forEach(clearTimeout));
      rippleTimers.current.clear();
    }, []);

    React.useEffect(() => {
      return () => {
        clearRippleTimers();
      };
    }, [clearRippleTimers]);

    const spawnRipple = React.useCallback(
      (el: HTMLElement, clientX?: number, clientY?: number) => {
        const rect = el.getBoundingClientRect();
        const x = Math.round(clientX === undefined ? rect.width / 2 : clientX - rect.left);
        const y = Math.round(clientY === undefined ? rect.height / 2 : clientY - rect.top);
        const reach = Math.max(
          Math.hypot(x, y),
          Math.hypot(rect.width - x, y),
          Math.hypot(x, rect.height - y),
          Math.hypot(rect.width - x, rect.height - y)
        );

        const id = (rippleSeq.current += 1);
        setRipples((prev) => {
          const next = prev.length >= 3 ? prev.slice(1) : prev;
          return [
            ...next,
            {
              id,
              x,
              y,
              scale: Math.round((reach * 200) / BASE_RIPPLE) / 100,
              released: false,
            },
          ];
        });
        return id;
      },
      []
    );

    const releaseRipple = React.useCallback((id: number) => {
      const start = setTimeout(() => {
        setRipples((prev) => prev.map((r) => (r.id === id ? { ...r, released: true } : r)));
      }, 180);

      const drop = setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== id));
        rippleTimers.current.delete(id);
      }, 500);

      rippleTimers.current.set(id, [start, drop]);
    }, []);

    const handleClick = React.useCallback(
      async (event: React.MouseEvent<HTMLButtonElement>) => {
        if (isCurrentlyLoading || disabled) {
          event.preventDefault();
          return;
        }

        if (copyValue) {
          try {
            let ok = false;
            if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
              await navigator.clipboard.writeText(copyValue);
              ok = true;
            } else {
              ok = writeClipboardFallback(copyValue);
            }

            if (ok) {
              setCopyStatus('copied');
              onCopySuccess?.(copyValue);
              if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
              copyTimerRef.current = setTimeout(() => {
                setCopyStatus('idle');
              }, copyTimeout);
            } else {
              setCopyStatus('error');
              onCopyError?.(new Error('Failed to copy to clipboard'));
            }
          } catch (err) {
            setCopyStatus('error');
            onCopyError?.(err);
          }
        }

        onClick?.(event);
      },
      [copyTimeout, copyValue, disabled, isCurrentlyLoading, onClick, onCopyError, onCopySuccess]
    );

    const baseStyles =
      'relative isolate inline-flex items-center justify-center whitespace-nowrap font-medium select-none outline-none overflow-hidden ' +
      'transition-[color,background-color,border-color,box-shadow,opacity] duration-150 ease-smooth ' +
      'focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--background))] ' +
      'disabled:opacity-50 disabled:pointer-events-none cursor-pointer';

    const variants: Record<NonNullable<ButtonProps['variant']>, string> = {
      primary:
        'bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800 ' +
        'border border-indigo-500/50 shadow-[inset_0_1.5px_0_rgba(255,255,255,0.25),0_1px_2px_rgba(0,0,0,0.08),0_4px_12px_rgba(79,70,229,0.2)] ' +
        'hover:shadow-[inset_0_1.5px_0_rgba(255,255,255,0.3),0_2px_4px_rgba(0,0,0,0.1),0_6px_16px_rgba(79,70,229,0.3)] ' +
        'dark:bg-indigo-600 dark:text-white dark:hover:bg-indigo-500 dark:border-indigo-400/40 ' +
        'dark:shadow-[inset_0_1.5px_0_rgba(255,255,255,0.2),0_1px_2px_rgba(0,0,0,0.4),0_6px_20px_rgba(99,102,241,0.25)]',

      secondary:
        'bg-white text-stone-800 hover:bg-stone-50 border border-stone-200/90 ' +
        'shadow-[inset_0_1.5px_0_rgba(255,255,255,0.95),inset_0_-1px_0_rgba(28,25,23,0.06),0_1px_2px_rgba(28,25,23,0.06)] ' +
        'dark:bg-[#1f1f23] dark:text-zinc-200 dark:border-white/[0.12] ' +
        'dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.07),0_1px_2px_rgba(0,0,0,0.35)] dark:hover:bg-[#27272b] dark:hover:border-white/[0.18]',

      outline:
        'border border-stone-300/80 bg-transparent text-stone-700 hover:bg-stone-100/70 hover:border-stone-400/80 shadow-none ' +
        'dark:border-white/[0.16] dark:bg-transparent dark:text-zinc-200 dark:hover:bg-white/[0.06] dark:hover:border-white/[0.24]',

      ghost:
        'border-transparent bg-transparent text-stone-600 hover:bg-stone-100/80 hover:text-stone-900 shadow-none ' +
        'dark:border-transparent dark:bg-transparent dark:text-zinc-400 dark:hover:bg-white/[0.07] dark:hover:text-zinc-100',

      danger:
        'bg-rose-600 text-white border border-rose-500/70 hover:bg-rose-700 ' +
        'shadow-[inset_0_1.5px_0_rgba(255,255,255,0.2),0_1px_2px_rgba(225,29,72,0.2),0_4px_12px_rgba(225,29,72,0.25)] ' +
        'dark:bg-rose-600 dark:text-white dark:border-rose-400/40 dark:shadow-[inset_0_1.5px_0_rgba(255,255,255,0.15),0_4px_16px_rgba(225,29,72,0.3)] dark:hover:bg-rose-500',

      destructive:
        'bg-rose-600 text-white border border-rose-500/70 hover:bg-rose-700 ' +
        'shadow-[inset_0_1.5px_0_rgba(255,255,255,0.2),0_1px_2px_rgba(225,29,72,0.2),0_4px_12px_rgba(225,29,72,0.25)] ' +
        'dark:bg-rose-600 dark:text-white dark:border-rose-400/40 dark:shadow-[inset_0_1.5px_0_rgba(255,255,255,0.15),0_4px_16px_rgba(225,29,72,0.3)] dark:hover:bg-rose-500',

      subtle:
        'bg-indigo-50 text-indigo-700 border border-indigo-200/60 hover:bg-indigo-100/80 ' +
        'dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800/40 dark:hover:bg-indigo-900/50',

      elevated:
        'bg-white text-stone-800 hover:bg-stone-50 border border-stone-200/90 shadow-md hover:shadow-lg ' +
        'dark:bg-[#25252a] dark:text-zinc-100 dark:border-white/[0.14] dark:shadow-[0_4px_12px_rgba(0,0,0,0.5)] dark:hover:bg-[#2d2d33]',
    };

    const sizes: Record<NonNullable<ButtonProps['size']>, string> = {
      xs: 'h-7 px-2.5 text-xs gap-1.5 rounded-lg min-h-[28px]',
      sm: 'h-8 px-3 text-xs font-medium gap-2 rounded-[9px] min-h-[32px]',
      md: 'h-9 px-3.5 text-[13px] font-medium gap-2 rounded-[9px] min-h-[36px]',
      lg: 'h-11 px-5 text-sm font-semibold gap-2.5 rounded-xl min-h-[44px]',
      icon: 'p-0 w-9 h-9 min-h-[36px] min-w-[36px] rounded-[9px]',
      'icon-xs': 'p-0 w-7 h-7 min-h-[28px] min-w-[28px] rounded-lg',
      'icon-sm': 'p-0 w-8 h-8 min-h-[32px] min-w-[32px] rounded-[8px]',
      'icon-lg': 'p-0 w-11 h-11 min-h-[44px] min-w-[44px] rounded-xl',
    };

    const isCopied = copyStatus === 'copied';
    const hasLeftIcon = Boolean(leftIcon || isCurrentlyLoading || isCopied);

    return (
      <motion.button
        ref={ref}
        disabled={disabled || isCurrentlyLoading}
        aria-busy={isCurrentlyLoading || undefined}
        onClick={handleClick}
        whileTap={
          disabled || isCurrentlyLoading || reduced
            ? undefined
            : {
                y: 1,
                scale: 0.985,
              }
        }
        transition={CELL}
        style={{ touchAction: 'manipulation' }}
        onPointerDown={(e) => {
          if (!ripple || disabled || isCurrentlyLoading) return;
          if (e.pointerType === 'mouse' && e.button !== 0) return;
          const id = spawnRipple(e.currentTarget, e.clientX, e.clientY);
          ripplePointers.current.set(e.pointerId, id);
        }}
        onPointerUp={(e) => {
          if (!ripple) return;
          const id = ripplePointers.current.get(e.pointerId);
          if (id !== undefined) {
            ripplePointers.current.delete(e.pointerId);
            releaseRipple(id);
          }
        }}
        onPointerCancel={(e) => {
          if (!ripple) return;
          const id = ripplePointers.current.get(e.pointerId);
          if (id !== undefined) {
            ripplePointers.current.delete(e.pointerId);
            releaseRipple(id);
          }
        }}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {/* Ripple effect overlay */}
        {ripple && ripples.length > 0 && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]"
          >
            {ripples.map((r) => (
              <motion.span
                key={r.id}
                className="absolute block rounded-full bg-current opacity-15"
                style={{
                  left: r.x - BASE_RIPPLE / 2,
                  top: r.y - BASE_RIPPLE / 2,
                  width: BASE_RIPPLE,
                  height: BASE_RIPPLE,
                  willChange: 'transform, opacity',
                }}
                initial={{ scale: reduced ? r.scale : 0, opacity: 0 }}
                animate={{ scale: r.scale, opacity: r.released ? 0 : 0.2 }}
                transition={{
                  scale: reduced ? { duration: 0 } : BLOOM,
                  opacity: { duration: r.released ? 0.35 : 0.08 },
                }}
              />
            ))}
          </span>
        )}

        {/* Left icon / Loading Spinner / Copied Checkmark */}
        {hasLeftIcon && (
          <span className="shrink-0 flex items-center justify-center" aria-hidden="true">
            {isCurrentlyLoading ? (
              <ButtonSpinner reduced={Boolean(reduced)} />
            ) : isCopied ? (
              <CheckmarkIcon reduced={Boolean(reduced)} />
            ) : (
              leftIcon
            )}
          </span>
        )}

        {/* Button Content / Loading / Copied Text */}
        {isCopied && copiedLabel ? (
          <motion.span
            initial={{ opacity: 0, y: reduced ? 0 : 3, filter: 'blur(3px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={reduced ? { duration: 0 } : CROSSFADE}
            className="whitespace-nowrap"
          >
            {copiedLabel}
          </motion.span>
        ) : isCurrentlyLoading && loadingText ? (
          <motion.span
            initial={{ opacity: 0, y: reduced ? 0 : 3, filter: 'blur(3px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={reduced ? { duration: 0 } : CROSSFADE}
            className="whitespace-nowrap"
          >
            {loadingText}
          </motion.span>
        ) : children != null ? (
          <span>{children}</span>
        ) : null}

        {/* Right Icon slot */}
        {rightIcon && !isCurrentlyLoading && !isCopied && (
          <span className="shrink-0 flex items-center justify-center" aria-hidden="true">
            {rightIcon}
          </span>
        )}

        {/* Screen Reader Live Region for Copy State */}
        {copyValue && (
          <span role="status" aria-live="polite" className="sr-only">
            {isCopied ? copiedLabel || 'Copied to clipboard' : ''}
          </span>
        )}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';

function ButtonSpinner({ reduced }: { reduced: boolean }) {
  return (
    <motion.svg
      width="13"
      height="13"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden="true"
      className="shrink-0"
      animate={reduced ? undefined : { rotate: 360 }}
      transition={reduced ? undefined : { duration: 0.85, repeat: Infinity, ease: 'linear' }}
    >
      <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.25" />
      <path
        d="M10.5 6A4.5 4.5 0 0 0 6 1.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </motion.svg>
  );
}

function CheckmarkIcon({ reduced }: { reduced: boolean }) {
  return (
    <motion.svg
      width="13"
      height="13"
      viewBox="0 0 14 14"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0 text-emerald-500 dark:text-emerald-400"
      aria-hidden="true"
      initial={{ scale: reduced ? 1 : 0.85, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.16 }}
    >
      <motion.path
        d="M2.9 7.4 5.6 10.1 11.1 4"
        initial={{ pathLength: reduced ? 1 : 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.24, ease: DRAW_EASE }}
      />
    </motion.svg>
  );
}

export interface IconButtonProps extends Omit<ButtonProps, 'children'> {
  icon?: React.ReactNode;
  'aria-label': string;
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, className, size = 'icon', ...props }, ref) => {
    return (
      <Button ref={ref} size={size} className={className} {...props}>
        {icon}
      </Button>
    );
  }
);

IconButton.displayName = 'IconButton';
