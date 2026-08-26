/**
 * Navigation and Route Types
 */

export interface NavigationItem {
  readonly label: string;
  readonly path: string;
  readonly iconName?: string;
  readonly isExternal?: boolean;
  readonly badge?: string;
}

export type AppRoute =
  | '/'
  | '/apps'
  | '/categories'
  | '/blog'
  | '/about'
  | '/support'
  | '/search'
  | '/auth/login'
  | '/auth/register';
