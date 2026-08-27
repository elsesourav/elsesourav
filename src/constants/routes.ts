/**
 * Application Route Paths
 */
export const ROUTES = {
  HOME: '/',
  APPS: '/apps',
  APP_DETAIL: '/apps/:slug',
  CATEGORIES: '/categories',
  CATEGORY_DETAIL: '/categories/:slug',
  BLOG: '/blog',
  BLOG_POST: '/blog/:slug',
  ABOUT: '/about',
  SUPPORT: '/support',
  HELP: '/help',
  HELP_CATEGORY: '/help/:categorySlug',
  HELP_ARTICLE: '/help/:categorySlug/:articleSlug',
  LOGIN: '/login',
  SIGNUP: '/signup',
  FORGOT_PASSWORD: '/forgot-password',
  PRIVACY: '/privacy',
  TERMS: '/terms',
  SITEMAP: '/sitemap',

  // Authenticated User Routes
  LIBRARY: '/library',
  SETTINGS: '/settings',

  // Admin Portal Routes
  ADMIN: {
    ROOT: '/admin',
    APPS: '/admin/apps',
    CATEGORIES: '/admin/categories',
    BLOG: '/admin/blog',
    BLOG_NEW: '/admin/blog/new',
    BLOG_EDIT: '/admin/blog/:id/edit',
    HELP: '/admin/help',
    SUPPORT: '/admin/support',
    ANALYTICS: '/admin/analytics',
    THEME: '/admin/theme',
    AUDIT_LOGS: '/admin/audit-logs',
  },
} as const;
