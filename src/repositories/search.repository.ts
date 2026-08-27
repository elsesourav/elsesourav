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

export interface ISearchRepository {
  search(filters: GlobalSearchFilters): RepositoryResult<GlobalSearchResult>;
  getSuggestions(
    query: string,
    limit?: number
  ): RepositoryResult<readonly GlobalSearchResultItem[]>;
}

export class FirestoreSearchRepository implements ISearchRepository {
  constructor(
    private readonly appRepo = appRepository,
    private readonly blogRepo = blogRepository,
    private readonly helpRepo = helpArticleRepository
  ) {}

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
    const query = rawQuery.toLowerCase().trim();

    if (!query) {
      return ok({
        query: '',
        apps: [],
        blogPosts: [],
        helpArticles: [],
        totalCount: 0,
      });
    }

    try {
      const searchTokens = query.split(/\s+/).filter(Boolean);

      const appsPromise =
        type === 'all' || type === 'app'
          ? this.appRepo.findMany({
              filters: [{ field: 'status', operator: '==', value: 'published' }],
              limit: 50,
            })
          : Promise.resolve(ok({ items: [], hasMore: false }));

      const blogPromise =
        type === 'all' || type === 'blog_post'
          ? this.blogRepo.findMany({
              filters: [{ field: 'status', operator: '==', value: 'published' }],
              limit: 50,
            })
          : Promise.resolve(ok({ items: [], hasMore: false }));

      const helpPromise =
        type === 'all' || type === 'help_article'
          ? this.helpRepo.findMany({
              filters: [{ field: 'status', operator: '==', value: 'published' }],
              limit: 50,
            })
          : Promise.resolve(ok({ items: [], hasMore: false }));

      const [appsRes, blogRes, helpRes] = await Promise.all([
        appsPromise,
        blogPromise,
        helpPromise,
      ]);

      // Filter and Map Apps (Priority 1)
      const matchedApps: GlobalSearchResultItem[] = [];
      if (appsRes.success) {
        for (const app of appsRes.data.items) {
          // Strictly exclude draft/deleted/archived apps
          if (app.status !== 'published' || app.deletedAt) continue;

          const searchText =
            `${app.name} ${app.slug} ${app.shortDescription} ${app.description} ${app.primaryCategory} ${(app.tags || []).join(' ')}`.toLowerCase();
          const matches = searchTokens.every((token) => searchText.includes(token));

          if (matches) {
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
            });
          }
        }
      }

      // Filter and Map Blog Posts (Priority 2)
      const matchedBlogPosts: GlobalSearchResultItem[] = [];
      if (blogRes.success) {
        for (const post of blogRes.data.items) {
          if (post.status !== 'published' || post.deletedAt) continue;

          const searchText = `${post.title} ${post.slug} ${post.excerpt || ''} ${post.content} ${post.category} ${(post.tags || []).join(' ')}`.toLowerCase();
          const matches = searchTokens.every((token) => searchText.includes(token));

          if (matches) {
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
            });
          }
        }
      }

      // Filter and Map Help Articles (Priority 3)
      const matchedHelpArticles: GlobalSearchResultItem[] = [];
      if (helpRes.success) {
        for (const article of helpRes.data.items) {
          if (article.status !== 'published' || article.deletedAt) continue;

          const searchText = `${article.title} ${article.slug} ${article.excerpt || ''} ${article.content} ${article.categoryId}`.toLowerCase();
          const matches = searchTokens.every((token) => searchText.includes(token));

          if (matches) {
            matchedHelpArticles.push({
              id: article.id,
              type: 'help_article',
              title: article.title,
              description: article.excerpt || article.content.substring(0, 140),
              destination: `/help/${article.categoryId}/${article.slug}`,
              category: article.categoryId,
              badges: [],
              publishedAt: article.publishedAt || article.createdAt,
            });
          }
        }
      }

      // Respect limit per section or total
      const apps = matchedApps.slice(0, limit);
      const blogPosts = matchedBlogPosts.slice(0, limit);
      const helpArticles = matchedHelpArticles.slice(0, limit);
      const totalCount = apps.length + blogPosts.length + helpArticles.length;

      return ok({
        query: validation.data.query,
        apps,
        blogPosts,
        helpArticles,
        totalCount,
      });
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
    const query = (rawQuery || '').trim().toLowerCase();
    if (!query || query.length < 2) {
      return ok([]);
    }

    const searchRes = await this.search({ query, limit });
    if (!searchRes.success) {
      return err(searchRes.error);
    }

    const { apps, blogPosts, helpArticles } = searchRes.data;
    // Suggested priority: Apps first, then blog, then help
    const suggestions = [...apps, ...blogPosts, ...helpArticles].slice(0, limit);
    return ok(suggestions);
  }
}

export const searchRepository = new FirestoreSearchRepository();
