import type { MetadataRoute } from 'next';
import { SITE_CONFIG } from '@elsesourav/config';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = SITE_CONFIG.url;
  const now = new Date();

  const routes = [
    '',
    '/apps',
    '/blog',
    '/help',
    '/support',
    '/about',
    '/privacy',
    '/terms',
    '/accessibility',
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: now,
    changeFrequency: route === '' || route === '/apps' ? 'daily' : 'weekly',
    priority: route === '' ? 1.0 : route === '/apps' ? 0.9 : 0.7,
  }));
}
