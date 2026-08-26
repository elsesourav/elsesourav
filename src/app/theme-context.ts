import { createContext } from 'react';
import type { ThemeMode } from '@/types/theme.types';

export interface ThemeContextValue {
  readonly themeMode: ThemeMode;
  readonly resolvedTheme: 'dark' | 'light';
  readonly setThemeMode: (mode: ThemeMode) => void;
  readonly toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const THEME_STORAGE_KEY = 'elsesourav_theme_preference';
