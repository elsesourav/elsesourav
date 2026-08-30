'use client';

import * as React from 'react';

export type Theme = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
}

const ThemeContext = React.createContext<ThemeContextValue>({
  theme: 'dark',
  resolvedTheme: 'dark',
  setTheme: () => {},
});

export function useTheme() {
  return React.useContext(ThemeContext);
}

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(resolved: 'light' | 'dark') {
  const d = document.documentElement;
  d.classList.remove('dark', 'light');
  d.classList.add(resolved);
  d.setAttribute('data-theme', resolved);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = React.useState<Theme>('dark');
  const [resolvedTheme, setResolvedTheme] = React.useState<'light' | 'dark'>('dark');

  // Initialize from localStorage on mount
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem('theme') as Theme | null;
      const t = stored === 'light' || stored === 'system' ? stored : 'dark';
      setThemeState(t);

      const resolved = t === 'system' ? getSystemTheme() : t;
      setResolvedTheme(resolved);
      applyTheme(resolved);
    } catch {
      // localStorage unavailable — stay on dark
    }
  }, []);

  // Listen for system preference changes when in 'system' mode
  React.useEffect(() => {
    if (theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      const resolved = e.matches ? 'dark' : 'light';
      setResolvedTheme(resolved);
      applyTheme(resolved);
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [theme]);

  const setTheme = React.useCallback((newTheme: Theme) => {
    setThemeState(newTheme);

    const resolved = newTheme === 'system' ? getSystemTheme() : newTheme;
    setResolvedTheme(resolved);
    applyTheme(resolved);

    try {
      localStorage.setItem('theme', newTheme);
    } catch {
      // localStorage unavailable — preference won't persist
    }
  }, []);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as unknown as { __setTheme?: (t: Theme) => void }).__setTheme = setTheme;
    }
  }, [setTheme]);

  const value = React.useMemo(
    () => ({ theme, resolvedTheme, setTheme }),
    [theme, resolvedTheme, setTheme]
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}
