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
  SUPPORT_TICKETS: '/support/tickets',
  SUPPORT_TICKET_DETAIL: '/support/tickets/:ticketId',
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
  SETTINGS_PROFILE: '/settings/profile',
  SETTINGS_PREFERENCES: '/settings/preferences',
  SETTINGS_SECURITY: '/settings/security',

  // Admin Portal Routes
  ADMIN: {
    ROOT: '/admin',
    APPS: '/admin/apps',
    APPS_NEW: '/admin/apps/new',
    APPS_EDIT: '/admin/apps/:id/edit',
    CATEGORIES: '/admin/categories',
    TAGS: '/admin/tags',
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
