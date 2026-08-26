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
