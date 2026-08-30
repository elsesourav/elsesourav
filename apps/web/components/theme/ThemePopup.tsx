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
  const menuRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);

  // Close on outside click
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  // Close on Escape, restore focus
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };

    if (open) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  // Current display icon
  const CurrentIcon = resolvedTheme === 'dark' ? Moon : Sun;

  return (
    <div className="relative" ref={menuRef}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center justify-center w-9 h-9 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--background))]"
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
          className="absolute right-0 mt-2 w-44 rounded-2xl bg-[hsl(var(--surface-elevated))] border border-[hsl(var(--border))] shadow-2xl p-1.5 z-50 text-xs backdrop-blur-xl animate-scale-in"
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
                  setOpen(false);
                  triggerRef.current?.focus();
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
