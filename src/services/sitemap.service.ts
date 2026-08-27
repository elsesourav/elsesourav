import { appRepository } from '@/repositories/app.repository';
import { blogRepository } from '@/repositories/blog.repository';
import { helpRepository } from '@/repositories/help.repository';
import {
  buildSitemapEntries,
  generateSitemapXml,
  generateRobotsTxt,
  type SitemapEntry,
  type BuildSitemapOptions,
} from '@/utils/sitemap-generator';
import { siteConfig } from '@/config/site.config';
import type { App } from '@/types/app.types';
import type { BlogPost } from '@/types/blog.types';
import type { HelpArticle, HelpCategory } from '@/types/help.types';
import { isOk } from '@/lib/result';

export interface SitemapGenerationResult {
  readonly success: boolean;
  readonly sitemapXml: string;
  readonly robotsTxt: string;
  readonly entryCount: number;
  readonly entries: readonly SitemapEntry[];
  readonly error?: string;
}

export class SitemapService {
  /**
   * Fetches published entities from Firestore repositories safely.
   * If Firestore is unreachable (e.g. offline build), falls back to static baseline routes.
   */
  public async fetchPublishedContent(): Promise<{
    apps: App[];
    blogPosts: BlogPost[];
    helpArticles: HelpArticle[];
    helpCategories: HelpCategory[];
  }> {
    const apps: App[] = [];
    const blogPosts: BlogPost[] = [];
    const helpArticles: HelpArticle[] = [];
    const helpCategories: HelpCategory[] = [];

    try {
      // 1. Fetch published Apps
      const appsResult = await appRepository.findMany({
        filters: [{ field: 'status', operator: '==', value: 'published' }],
        limit: 500,
      });
      if (isOk(appsResult) && appsResult.data?.items) {
        apps.push(...appsResult.data.items);
      }
    } catch (err) {
      console.warn('[SitemapService] Note: Could not query published apps (offline/fallback mode)', err);
    }

    try {
      // 2. Fetch published Blog Posts
      const blogResult = await blogRepository.findMany({
        filters: [{ field: 'status', operator: '==', value: 'published' }],
        limit: 500,
      });
      if (isOk(blogResult) && blogResult.data?.items) {
        blogPosts.push(...blogResult.data.items);
      }
    } catch (err) {
      console.warn('[SitemapService] Note: Could not query published blog posts (offline/fallback mode)', err);
    }

    try {
      // 3. Fetch published Help Articles & Categories
      const helpResult = await helpRepository.listPublishedArticles({ limit: 500 });
      if (isOk(helpResult) && helpResult.data?.items) {
        helpArticles.push(...helpResult.data.items);
      }

      const catResult = await helpRepository.listCategories({ limit: 100 });
      if (isOk(catResult) && catResult.data?.items) {
        helpCategories.push(...catResult.data.items);
      }
    } catch (err) {
      console.warn('[SitemapService] Note: Could not query help documentation (offline/fallback mode)', err);
    }

    return { apps, blogPosts, helpArticles, helpCategories };
  }

  /**
   * Generates production sitemap.xml and robots.txt strings from active dynamic content.
   */
  public async generateProductionSitemap(
    customOptions?: Partial<BuildSitemapOptions>
  ): Promise<SitemapGenerationResult> {
    try {
      let apps = customOptions?.apps ? [...customOptions.apps] : undefined;
      let blogPosts = customOptions?.blogPosts ? [...customOptions.blogPosts] : undefined;
      let helpArticles = customOptions?.helpArticles ? [...customOptions.helpArticles] : undefined;
      let helpCategories = customOptions?.helpCategories ? [...customOptions.helpCategories] : undefined;

      // If domain items not supplied directly, query them from repository layer
      if (!apps || !blogPosts || !helpArticles) {
        const fetched = await this.fetchPublishedContent();
        apps = apps || fetched.apps;
        blogPosts = blogPosts || fetched.blogPosts;
        helpArticles = helpArticles || fetched.helpArticles;
        helpCategories = helpCategories || fetched.helpCategories;
      }

      const origin = customOptions?.origin || siteConfig.siteOrigin;

      const entries = buildSitemapEntries({
        origin,
        apps,
        blogPosts,
        helpArticles,
        helpCategories,
      });

      const sitemapXml = generateSitemapXml(entries);
      const robotsTxt = generateRobotsTxt({ origin, sitemapUrl: `${origin}/sitemap.xml` });

      return {
        success: true,
        sitemapXml,
        robotsTxt,
        entryCount: entries.length,
        entries,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown sitemap generation error';
      // Graceful fallback to static entries
      const fallbackEntries = buildSitemapEntries({ origin: siteConfig.siteOrigin });
      return {
        success: false,
        sitemapXml: generateSitemapXml(fallbackEntries),
        robotsTxt: generateRobotsTxt({ origin: siteConfig.siteOrigin }),
        entryCount: fallbackEntries.length,
        entries: fallbackEntries,
        error: message,
      };
    }
  }
}

export const sitemapService = new SitemapService();
