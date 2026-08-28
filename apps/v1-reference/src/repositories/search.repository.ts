import { ok, err } from '@/lib/result';
import { AppError } from '@/lib/errors';
import { appRepository } from './app.repository';
import { blogRepository } from './blog.repository';
import { helpArticleRepository } from './help.repository';
import type {
  GlobalSearchFilters,
  GlobalSearchResult,
  GlobalSearchResultItem,
} from '@/types/search.types';
import type { RepositoryResult } from './types';
import { globalSearchFiltersSchema } from '@/schemas/search.schema';
import {
  normalizeSearchQuery,
  extractSearchTokens,
  calculateRelevance,
} from '@/utils/search-relevance';

export interface ISearchRepository {
  search(filters: GlobalSearchFilters): RepositoryResult<GlobalSearchResult>;
  getSuggestions(
    query: string,
    limit?: number
  ): RepositoryResult<readonly GlobalSearchResultItem[]>;
  clearCache(): void;
}

interface CacheEntry {
  readonly timestamp: number;
  readonly result: GlobalSearchResult;
}

const CACHE_TTL_MS = 3 * 60 * 1000; // 3 minutes

export class FirestoreSearchRepository implements ISearchRepository {
  private readonly inMemoryCache = new Map<string, CacheEntry>();

  constructor(
    private readonly appRepo = appRepository,
    private readonly blogRepo = blogRepository,
    private readonly helpRepo = helpArticleRepository
  ) {}

  public clearCache(): void {
    this.inMemoryCache.clear();
  }

  public async search(filters: GlobalSearchFilters): RepositoryResult<GlobalSearchResult> {
    const validation = globalSearchFiltersSchema.safeParse(filters);
    if (!validation.success) {
      return err(
        AppError.badRequest(
          'Invalid search query parameters',
          validation.error.issues[0]?.path.join('.')
        )
      );
    }

    const { query: rawQuery, type = 'all', limit = 20 } = validation.data;
    const normalized = normalizeSearchQuery(rawQuery);

    if (!normalized) {
      return ok({
        query: rawQuery,
        apps: [],
        blogPosts: [],
        helpArticles: [],
        totalCount: 0,
      });
    }

    const cacheKey = `${normalized}:${type}:${limit}`;
    const cached = this.inMemoryCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return ok(cached.result);
    }

    try {
      const tokens = extractSearchTokens(normalized);

      const appsPromise =
        type === 'all' || type === 'app'
          ? this.appRepo.findMany({
              filters: [{ field: 'status', operator: '==', value: 'published' }],
              limit: 60,
            })
          : Promise.resolve(ok({ items: [], hasMore: false }));

      const blogPromise =
        type === 'all' || type === 'blog_post'
          ? this.blogRepo.findMany({
              filters: [{ field: 'status', operator: '==', value: 'published' }],
              limit: 60,
            })
          : Promise.resolve(ok({ items: [], hasMore: false }));

      const helpPromise =
        type === 'all' || type === 'help_article'
          ? this.helpRepo.findMany({
              filters: [{ field: 'status', operator: '==', value: 'published' }],
              limit: 60,
            })
          : Promise.resolve(ok({ items: [], hasMore: false }));

      const [appsRes, blogRes, helpRes] = await Promise.all([
        appsPromise,
        blogPromise,
        helpPromise,
      ]);

      // 1. Process & Rank Applications (Domain Priority)
      const matchedApps: GlobalSearchResultItem[] = [];
      if (appsRes.success) {
        for (const app of appsRes.data.items) {
          if (app.status !== 'published' || app.deletedAt) continue;

          const relevance = calculateRelevance(normalized, tokens, {
            title: app.name,
            slug: app.slug,
            description: `${app.shortDescription} ${app.description}`,
            category: app.primaryCategory,
            tags: app.tags,
            isApp: true,
          });

          if (relevance) {
            matchedApps.push({
              id: app.id,
              type: 'app',
              title: app.name,
              description: app.shortDescription || app.description,
              destination: `/apps/${app.slug}`,
              category: app.primaryCategory,
              iconUrl: app.iconUrl,
              badges: [app.currentVersion, ...(app.tags || [])].filter((b): b is string =>
                Boolean(b)
              ),
              publishedAt: app.publishedAt || app.createdAt,
              relevanceScore: relevance.score,
              matchReason: relevance.matchReason,
            });
          }
        }
      }

      // 2. Process & Rank Blog Posts
      const matchedBlogPosts: GlobalSearchResultItem[] = [];
      if (blogRes.success) {
        for (const post of blogRes.data.items) {
          if (post.status !== 'published' || post.deletedAt) continue;

          const relevance = calculateRelevance(normalized, tokens, {
            title: post.title,
            slug: post.slug,
            description: `${post.excerpt || ''} ${post.content}`,
            category: post.category,
            tags: post.tags,
          });

          if (relevance) {
            matchedBlogPosts.push({
              id: post.id,
              type: 'blog_post',
              title: post.title,
              description: post.excerpt || post.content.substring(0, 140),
              destination: `/blog/${post.slug}`,
              category: post.category,
              iconUrl: post.coverImageUrl,
              badges: [
                post.readingTimeMinutes ? `${post.readingTimeMinutes} min read` : '',
                ...(post.tags || []),
              ].filter((b): b is string => Boolean(b)),
              publishedAt: post.publishedAt || post.createdAt,
              relevanceScore: relevance.score,
              matchReason: relevance.matchReason,
            });
          }
        }
      }

      // 3. Process & Rank Help Articles
      const matchedHelpArticles: GlobalSearchResultItem[] = [];
      if (helpRes.success) {
        for (const article of helpRes.data.items) {
          if (article.status !== 'published' || article.deletedAt) continue;

          const relevance = calculateRelevance(normalized, tokens, {
            title: article.title,
            slug: article.slug,
            description: `${article.excerpt || ''} ${article.content}`,
            category: article.categoryId,
          });

          if (relevance) {
            matchedHelpArticles.push({
              id: article.id,
              type: 'help_article',
              title: article.title,
              description: article.excerpt || article.content.substring(0, 140),
              destination: `/help/${article.categoryId}/${article.slug}`,
              category: article.categoryId,
              badges: [],
              publishedAt: article.publishedAt || article.createdAt,
              relevanceScore: relevance.score,
              matchReason: relevance.matchReason,
            });
          }
        }
      }

      // Sort items within each bucket deterministically: relevanceScore desc, then publishedAt desc
      const sortFn = (a: GlobalSearchResultItem, b: GlobalSearchResultItem) => {
        const scoreDiff = (b.relevanceScore ?? 0) - (a.relevanceScore ?? 0);
        if (scoreDiff !== 0) return scoreDiff;
        return (b.publishedAt ?? 0) - (a.publishedAt ?? 0);
      };

      const sortedApps = matchedApps.sort(sortFn).slice(0, limit);
      const sortedBlog = matchedBlogPosts.sort(sortFn).slice(0, limit);
      const sortedHelp = matchedHelpArticles.sort(sortFn).slice(0, limit);
      const totalCount = sortedApps.length + sortedBlog.length + sortedHelp.length;

      const finalResult: GlobalSearchResult = {
        query: rawQuery,
        apps: sortedApps,
        blogPosts: sortedBlog,
        helpArticles: sortedHelp,
        totalCount,
      };

      // Cache result in-memory
      this.inMemoryCache.set(cacheKey, {
        timestamp: Date.now(),
        result: finalResult,
      });

      return ok(finalResult);
    } catch (error) {
      return err(
        AppError.internal('Failed to execute global platform search', {
          originalError: error instanceof Error ? error.message : String(error),
        })
      );
    }
  }

  public async getSuggestions(
    rawQuery: string,
    limit = 6
  ): RepositoryResult<readonly GlobalSearchResultItem[]> {
    const normalized = normalizeSearchQuery(rawQuery);
    if (!normalized || normalized.length < 2) {
      return ok([]);
    }

    const searchRes = await this.search({ query: normalized, limit });
    if (!searchRes.success) {
      return err(searchRes.error);
    }

    const { apps, blogPosts, helpArticles } = searchRes.data;
    // Combine all and sort globally by relevanceScore
    const allMatches = [...apps, ...blogPosts, ...helpArticles].sort((a, b) => {
      const scoreDiff = (b.relevanceScore ?? 0) - (a.relevanceScore ?? 0);
      if (scoreDiff !== 0) return scoreDiff;
      return (b.publishedAt ?? 0) - (a.publishedAt ?? 0);
    });

    return ok(allMatches.slice(0, limit));
  }
}

export const searchRepository = new FirestoreSearchRepository();
