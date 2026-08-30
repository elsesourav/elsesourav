import type { MetadataRoute } from 'next';
import { SITE_CONFIG } from '@elsesourav/config';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/apps',
          '/apps/',
          '/notes',
          '/notes/',
          '/help',
          '/help/',
          '/about',
          '/support',
          '/privacy',
          '/terms',
          '/accessibility',
        ],
        disallow: [
          '/admin',
          '/admin/',
          '/api/',
          '/dashboard',
          '/dashboard/',
          '/library',
          '/library/',
          '/notifications',
          '/notifications/',
          '/profile',
          '/profile/',
          '/settings',
          '/settings/',
          '/support/tickets',
          '/support/tickets/',
          '/login',
          '/signup',
          '/forgot-password',
          '/reset-password',
          '/verify',
          '/auth-error',
          '/design-system',
          '/design-system/',
        ],
      },
    ],
    sitemap: `${SITE_CONFIG.url}/sitemap.xml`,
  };
}
