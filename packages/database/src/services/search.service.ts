import { PrismaClient, PublishStatus } from '@prisma/client';
import { prisma as defaultPrisma } from '../client';
import type {
  GlobalSearchResult,
  GlobalSearchResultType,
  GlobalSearchResponse,
} from '@elsesourav/types';

/** Maximum query length allowed */
const MAX_QUERY_LENGTH = 80;
/** Maximum total results returned */
const MAX_RESULTS = 25;
/** Maximum results per content type group */
const RESULTS_PER_GROUP = 5;

/**
 * Static pages available for search matching.
 * These are hardcoded because there are only a handful of public pages.
 */
const STATIC_PAGES: GlobalSearchResult[] = [
  { type: 'page', title: 'Apps', description: 'Browse all published applications and software.', url: '/apps' },
  { type: 'page', title: 'Notes', description: 'Engineering field notes, technical writing, and ideas.', url: '/notes' },
  { type: 'page', title: 'About', description: 'About Sourav — independent software creator.', url: '/about' },
  { type: 'page', title: 'Help', description: 'Help center and documentation.', url: '/help' },
  { type: 'page', title: 'Archive', description: 'Historical and archived projects.', url: '/archive' },
];

/**
 * Unified public search service.
 * Searches across projects/apps, blog posts, and static pages.
 * Only returns published, non-deleted content.
 */
export class SearchService {
  constructor(private readonly prisma: PrismaClient = defaultPrisma) {}

  /**
   * Execute a global search across all public content types.
   */
  async search(rawQuery: string): Promise<GlobalSearchResponse> {
    const query = this.sanitizeQuery(rawQuery);

    if (query.length === 0) {
      return { query: rawQuery, results: [], grouped: {}, totalCount: 0 };
    }

    // Run app and blog searches in parallel
    const [appResults, blogResults] = await Promise.all([
      this.searchApps(query),
      this.searchBlogPosts(query),
    ]);

    // Search static pages (synchronous, just string matching)
    const pageResults = this.searchStaticPages(query);

    // Combine, score, and sort all results
    const allResults = [...appResults, ...blogResults, ...pageResults];
    const scored = allResults.map((result) => ({
      result,
      score: this.scoreResult(result, query),
    }));
    scored.sort((a, b) => b.score - a.score);

    const results = scored.slice(0, MAX_RESULTS).map((s) => s.result);

    // Group by type with per-group limits
    const grouped: Partial<Record<GlobalSearchResultType, GlobalSearchResult[]>> = {};
    for (const result of results) {
      if (!grouped[result.type]) {
        grouped[result.type] = [];
      }
      if (grouped[result.type]!.length < RESULTS_PER_GROUP) {
        grouped[result.type]!.push(result);
      }
    }

    return {
      query: rawQuery,
      results,
      grouped,
      totalCount: results.length,
    };
  }

  /**
   * Search published apps and projects.
   */
  private async searchApps(query: string): Promise<GlobalSearchResult[]> {
    try {
      const records = await this.prisma.app.findMany({
        where: {
          status: PublishStatus.PUBLISHED,
          deletedAt: null,
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { shortDescription: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            { slug: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: MAX_RESULTS,
        orderBy: [{ isFeatured: 'desc' }, { sortOrder: 'asc' }],
        include: {
          category: true,
          tags: { include: { tag: true } },
        },
      });

      return records.map((record) => {
        return {
          type: 'project' as const,
          title: record.name,
          description: record.shortDescription || '',
          url: `/apps/${record.slug}`,
          category: record.category?.name,
          metadata: {
            ...(record.iconUrl ? { icon: record.iconUrl } : {}),
            ...(record.tags?.length
              ? { tags: record.tags.map((t: { tag: { name: string } }) => t.tag.name).join(', ') }
              : {}),
          },
        };
      });
    } catch {
      return [];
    }
  }

  /**
   * Search published blog posts / notes.
   */
  private async searchBlogPosts(query: string): Promise<GlobalSearchResult[]> {
    try {
      const records = await this.prisma.blogPost.findMany({
        where: {
          status: PublishStatus.PUBLISHED,
          deletedAt: null,
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { excerpt: { contains: query, mode: 'insensitive' } },
            { content: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: MAX_RESULTS,
        orderBy: { publishedAt: 'desc' },
        include: {
          category: true,
          tags: { include: { tag: true } },
        },
      });

      return records.map((record) => ({
        type: 'note' as const,
        title: record.title,
        description: record.excerpt || '',
        url: `/notes/${record.slug}`,
        category: record.category?.name,
        metadata: {
          ...(record.readingTime ? { readingTime: `${record.readingTime} min read` } : {}),
          ...(record.tags?.length
            ? { tags: record.tags.map((t: { tag: { name: string } }) => t.tag.name).join(', ') }
            : {}),
        },
      }));
    } catch {
      return [];
    }
  }

  /**
   * Match query against static page names and descriptions.
   */
  private searchStaticPages(query: string): GlobalSearchResult[] {
    const lower = query.toLowerCase();
    return STATIC_PAGES.filter(
      (page) =>
        page.title.toLowerCase().includes(lower) ||
        page.description.toLowerCase().includes(lower)
    );
  }

  /**
   * Simple deterministic relevance scoring.
   */
  private scoreResult(result: GlobalSearchResult, query: string): number {
    const lower = query.toLowerCase();
    const titleLower = result.title.toLowerCase();
    const descLower = result.description.toLowerCase();
    const catLower = (result.category || '').toLowerCase();
    const tagsLower = (result.metadata?.tags || '').toLowerCase();

    let score = 0;

    // Exact title match
    if (titleLower === lower) {
      score += 100;
    }
    // Title starts with query
    else if (titleLower.startsWith(lower)) {
      score += 90;
    }
    // Title contains query
    else if (titleLower.includes(lower)) {
      score += 80;
    }

    // Category match
    if (catLower.includes(lower)) {
      score += 60;
    }

    // Tag match
    if (tagsLower.includes(lower)) {
      score += 55;
    }

    // Description/summary match
    if (descLower.includes(lower)) {
      score += 40;
    }

    // Boost projects and notes over static pages
    if (result.type === 'project') {
      score += 5;
    } else if (result.type === 'note') {
      score += 3;
    }

    return score;
  }

  /**
   * Sanitize and normalize a search query string.
   */
  private sanitizeQuery(raw: string): string {
    if (!raw || typeof raw !== 'string') return '';
    return raw.trim().replace(/\s+/g, ' ').slice(0, MAX_QUERY_LENGTH);
  }
}
