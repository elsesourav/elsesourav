/**
 * Application Route Paths
 */

export const ROUTES = {
  HOME: '/',
  APPS: '/apps',
  CATEGORIES: '/categories',
  BLOG: '/blog',
  ABOUT: '/about',
  SUPPORT: '/support',
  SEARCH: '/search',
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    FORGOT_PASSWORD: '/auth/forgot-password',
  },
} as const;
