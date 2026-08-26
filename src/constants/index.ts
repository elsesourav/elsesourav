import type { NavigationItem } from '@/types';

export const APP_NAME = 'ElseSourav';
export const APP_TAGLINE = 'Developer & Software Publishing Platform';

export const PRIMARY_NAVIGATION: readonly NavigationItem[] = [
  { label: 'Home', path: '/' },
  { label: 'Apps', path: '/apps' },
  { label: 'Categories', path: '/categories' },
  { label: 'Blog', path: '/blog' },
  { label: 'About', path: '/about' },
  { label: 'Support', path: '/support' },
] as const;
