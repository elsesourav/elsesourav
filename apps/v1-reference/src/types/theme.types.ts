/**
 * Theme & UI Configuration Types
 */

export type ThemeMode = 'system' | 'dark' | 'light';

export interface ThemeConfig {
  readonly mode: ThemeMode;
  readonly accentColor?: string;
  readonly reduceMotion: boolean;
  readonly compactMode: boolean;
}
