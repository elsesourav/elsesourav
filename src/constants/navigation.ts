import type { NavigationItem } from '@/types/navigation.types';
import { ROUTES } from './routes';

export const PRIMARY_NAVIGATION: readonly NavigationItem[] = [
  { label: 'Home', path: ROUTES.HOME },
  { label: 'Apps', path: ROUTES.APPS },
  { label: 'Categories', path: ROUTES.CATEGORIES },
  { label: 'Blog', path: ROUTES.BLOG },
  { label: 'About', path: ROUTES.ABOUT },
  { label: 'Support', path: ROUTES.SUPPORT },
] as const;

export interface FooterNavGroup {
  readonly title: string;
  readonly items: readonly {
    readonly label: string;
    readonly path: string;
    readonly isExternal?: boolean;
  }[];
}

export const FOOTER_NAVIGATION: readonly FooterNavGroup[] = [
  {
    title: 'Platform',
    items: [
      { label: 'Explore Apps', path: ROUTES.APPS },
      { label: 'Categories', path: ROUTES.CATEGORIES },
      { label: 'My Library', path: ROUTES.LIBRARY },
      { label: 'Help Center', path: ROUTES.HELP },
    ],
  },
  {
    title: 'Resources',
    items: [
      { label: 'Blog & Updates', path: ROUTES.BLOG },
      { label: 'About Sourav', path: ROUTES.ABOUT },
      { label: 'Support & Tickets', path: ROUTES.SUPPORT },
      { label: 'Site Map', path: ROUTES.SITEMAP },
    ],
  },
  {
    title: 'Legal',
    items: [
      { label: 'Privacy Policy', path: ROUTES.PRIVACY },
      { label: 'Terms of Service', path: ROUTES.TERMS },
    ],
  },
] as const;

export const SOCIAL_LINKS = [
  { label: 'GitHub', url: 'https://github.com/elsesourav', icon: 'github' },
  { label: 'Twitter / X', url: 'https://x.com/elsesourav', icon: 'twitter' },
  { label: 'LinkedIn', url: 'https://linkedin.com/in/elsesourav', icon: 'linkedin' },
] as const;
