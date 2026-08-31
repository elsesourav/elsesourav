'use client';

import * as React from 'react';
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
          triggerRef.current?.focus();
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

  return (
    <div className="relative" ref={menuRef}>
      <button
        ref={triggerRef}
        type="button"
        onClick={handleToggle}
        className="flex items-center justify-center w-10 h-10 rounded-xl text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--surface-subtle))] active:scale-95 transition-all duration-150 ease-smooth focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--background))] min-h-[40px] min-w-[40px] cursor-pointer"
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
          className={`absolute right-0 mt-2 w-44 rounded-2xl bg-[hsl(var(--surface-elevated))] border border-[hsl(var(--border))] shadow-2xl p-1.5 z-50 text-xs backdrop-blur-xl ${
            isClosing ? 'animate-popup-out' : 'animate-popup-in'
          }`}
        >
          <div className="px-3 py-1.5 text-[11px] font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
            Appearance
          </div>

          {THEME_OPTIONS.map((option) => {
            const Icon = option.icon;
            const isSelected = theme === option.value;

            return (
              <button
                key={option.value}
                role="menuitem"
                type="button"
                onClick={() => {
                  setTheme(option.value);
                  requestClose(() => {
                    triggerRef.current?.focus();
                  });
                }}
                className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl transition-colors text-left font-medium select-none focus:outline-none focus-visible:bg-[hsl(var(--accent))] ${
                  isSelected
                    ? 'text-[hsl(var(--primary))] bg-[hsl(var(--accent))]'
                    : 'text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))]'
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
