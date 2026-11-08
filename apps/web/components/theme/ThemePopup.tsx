'use client';

import * as React from 'react';
import { flushSync } from 'react-dom';
import { Sun, Moon, Monitor, Check } from 'lucide-react';
import { useTheme, type Theme } from './ThemeProvider';

const THEME_OPTIONS: { value: Theme; label: string; icon: typeof Sun }[] = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
];

export function ThemePopup() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [open, setOpen] = React.useState(false);
  const [isClosing, setIsClosing] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);

  const requestClose = React.useCallback(
    (callback?: () => void) => {
      if (isClosing) return;
      setIsClosing(true);
      setTimeout(() => {
        setIsClosing(false);
        setOpen(false);
        callback?.();
      }, 130);
    },
    [isClosing]
  );

  const handleToggle = () => {
    if (open) {
      requestClose();
    } else {
      setIsClosing(false);
      setOpen(true);
    }
  };

  // Close on outside click or touch
  React.useEffect(() => {
    const handlePointerOutside = (event: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        requestClose();
      }
    };

    if (open && !isClosing) {
      document.addEventListener('mousedown', handlePointerOutside);
      document.addEventListener('touchstart', handlePointerOutside, { passive: true });
    }
    return () => {
      document.removeEventListener('mousedown', handlePointerOutside);
      document.removeEventListener('touchstart', handlePointerOutside);
    };
  }, [open, isClosing, requestClose]);

  // Close on Escape, restore focus
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        requestClose(() => {
          triggerRef.current?.focus({ preventScroll: true });
        });
      }
    };

    if (open) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, requestClose]);

  // Current display icon
  const CurrentIcon = resolvedTheme === 'dark' ? Moon : Sun;

  const handleSelectTheme = (value: Theme, e?: React.MouseEvent) => {
    // Exact center coordinates of the theme trigger icon button in the header
    const rect = triggerRef.current?.getBoundingClientRect();
    const origin = rect
      ? {
          clientX: Math.round(rect.left + rect.width / 2),
          clientY: Math.round(rect.top + rect.height / 2),
        }
      : e && typeof e.clientX === 'number' && e.clientX > 0
        ? {
            clientX: Math.round(e.clientX),
            clientY: Math.round(e.clientY),
          }
        : undefined;

    // Immediately unmount popup synchronously from the DOM before taking the view transition snapshot
    flushSync(() => {
      setOpen(false);
      setIsClosing(false);
    });

    setTheme(value, origin);
  };

  return (
    <div className="relative shrink-0" ref={menuRef}>
      <button
        ref={triggerRef}
        type="button"
        onClick={handleToggle}
        className="shrink-0 flex items-center justify-center w-9 h-9 min-h-[36px] min-w-[36px] rounded-xl border border-slate-900/[0.08] dark:border-white/10 bg-white/80 dark:bg-white/[0.06] backdrop-blur-md hover:bg-white dark:hover:bg-white/[0.1] hover:border-slate-900/15 dark:hover:border-white/20 text-slate-700 dark:text-zinc-200 hover:text-slate-950 dark:hover:text-white active:scale-95 transition-all duration-150 ease-smooth focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--background))] cursor-pointer shadow-[0_1px_2px_rgba(0,0,0,0.03)] dark:shadow-none"
        aria-label="Change theme"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <CurrentIcon className="w-4 h-4" />
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Appearance"
          className={`absolute right-0 mt-2 w-52 rounded-2xl bg-white/95 dark:bg-[hsl(var(--surface-elevated))] border border-slate-200/90 dark:border-[hsl(var(--border))] shadow-2xl p-1.5 z-50 text-xs backdrop-blur-xl ${
            isClosing ? 'animate-popup-out' : 'animate-popup-in'
          }`}
        >
          <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 dark:text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
            Theme
          </div>

          {THEME_OPTIONS.map((option) => {
            const Icon = option.icon;
            const isSelected = theme === option.value;

            return (
              <button
                key={option.value}
                role="menuitem"
                type="button"
                onClick={(e) => handleSelectTheme(option.value, e)}
                className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl transition-colors text-left font-medium select-none focus:outline-none focus-visible:bg-slate-100 dark:focus-visible:bg-[hsl(var(--accent))] ${
                  isSelected
                    ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-[hsl(var(--accent))]'
                    : 'text-slate-700 dark:text-[hsl(var(--foreground))] hover:bg-slate-100 dark:hover:bg-[hsl(var(--accent))]'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Icon className="w-3.5 h-3.5" />
                  <span>{option.label}</span>
                </span>
                {isSelected && <Check className="w-3.5 h-3.5" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
