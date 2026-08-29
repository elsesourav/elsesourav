import type { MetadataRoute } from 'next';
import { SITE_CONFIG } from '@elsesourav/config';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/apps', '/blog', '/help', '/about', '/design-system'],
        disallow: [
          '/admin',
          '/admin/',
          '/api/',
          '/settings',
          '/library',
          '/support',
          '/notifications',
          '/dashboard',
          '/profile',
          '/reset-password',
          '/forgot-password',
          '/verify',
          '/auth-error',
        ],
      },
    ],
    sitemap: `${SITE_CONFIG.url}/sitemap.xml`,
  };
}
