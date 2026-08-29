import type { MetadataRoute } from 'next';
import { SITE_CONFIG } from '@elsesourav/config';
import {
  AppRepository,
  AppQueryService,
  BlogRepository,
  BlogService,
  HelpRepository,
  HelpService,
} from '@elsesourav/database';

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // revalidate hourly

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_CONFIG.url;
  const now = new Date();

  // 1. Static Core Public Pages
  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/apps`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/help`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/support`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/accessibility`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  try {
    const appQueryService = new AppQueryService(new AppRepository());
    const blogService = new BlogService(new BlogRepository());
    const helpService = new HelpService(new HelpRepository());

    const [apps, blogRes, helpCats] = await Promise.allSettled([
      appQueryService.listPublicApps({ limit: 100 }),
      blogService.listPublicPosts({ limit: 100 }),
      helpService.listPublicCategories(),
    ]);

    const dynamicEntries: MetadataRoute.Sitemap = [];

    // Add published apps
    if (apps.status === 'fulfilled') {
      for (const app of apps.value) {
        dynamicEntries.push({
          url: `${baseUrl}/apps/${app.slug}`,
          lastModified: app.publishedAt ? new Date(app.publishedAt) : now,
          changeFrequency: 'weekly',
          priority: 0.8,
        });
      }
    }

    // Add published blog posts
    if (blogRes.status === 'fulfilled') {
      for (const post of blogRes.value.items) {
        dynamicEntries.push({
          url: `${baseUrl}/blog/${post.slug}`,
          lastModified: new Date(post.createdAt),
          changeFrequency: 'monthly',
          priority: 0.7,
        });
      }
    }

    // Add published help categories and articles
    if (helpCats.status === 'fulfilled') {
      for (const cat of helpCats.value) {
        dynamicEntries.push({
          url: `${baseUrl}/help/${cat.slug}`,
          lastModified: now,
          changeFrequency: 'weekly',
          priority: 0.7,
        });

        for (const article of cat.articles) {
          dynamicEntries.push({
            url: `${baseUrl}/help/${cat.slug}/${article.slug}`,
            lastModified: new Date(article.updatedAt),
            changeFrequency: 'monthly',
            priority: 0.6,
          });
        }
      }
    }

    return [...staticEntries, ...dynamicEntries];
  } catch {
    // Fallback safely to static entries if database connection is unavailable during build
    return staticEntries;
  }
}
