import { AppRepository } from '../repositories/app.repository';
import { AppError } from '@elsesourav/types';
import { AppListQuerySchema, AppSearchSchema } from '@elsesourav/validation';
import type {
  AppListItem,
  PublicApp,
  AppQueryOptions,
  AppSearchInput,
  AppSearchResult,
  CategorySummary,
  TagSummary,
} from '@elsesourav/types';

export class AppQueryService {
  constructor(private readonly appRepo: AppRepository) {}

  /**
   * Queries published applications with selective projection and bounded pagination.
   */
  async listPublicApps(options: AppQueryOptions = {}): Promise<AppListItem[]> {
    const validated = AppListQuerySchema.safeParse(options);
    if (!validated.success) {
      throw AppError.validation(validated.error.issues[0]?.message || 'Invalid application query parameters');
    }

    return this.appRepo.listPublic(options);
  }

  /**
   * Retrieves complete public application details by slug.
   * Shields unpublished/draft content from non-privileged public callers.
   */
  async getPublicAppDetail(slug: string): Promise<PublicApp> {
    const normalizedSlug = slug.trim().toLowerCase();
    if (!/^[a-z0-9-]+$/.test(normalizedSlug)) {
      throw AppError.notFound(`Application '${slug}'`);
    }

    const app = await this.appRepo.getPublicDetailBySlug(normalizedSlug);
    if (!app) {
      throw AppError.notFound(`Application '${slug}'`);
    }

    return app;
  }

  /**
   * High-level discovery & search query combining keyword search, category, tag, and sort.
   */
  async discoverApps(input: AppSearchInput = {}): Promise<AppSearchResult> {
    const validated = AppSearchSchema.safeParse(input);
    if (!validated.success) {
      throw AppError.validation(validated.error.issues[0]?.message || 'Invalid search input');
    }

    const normalizedInput: AppSearchInput = {
      ...input,
      query: (input.query || (input as { q?: string }).q || '').trim().replace(/\s+/g, ' '),
    };

    return this.appRepo.searchPublic(normalizedInput);
  }

  /**
   * Executes a bounded, safe search across public applications.
   */
  async searchPublicApps(input: AppSearchInput = {}): Promise<AppSearchResult> {
    return this.discoverApps(input);
  }

  /**
   * Fetches active public categories with publication counts.
   */
  async listPublicCategories(): Promise<CategorySummary[]> {
    return this.appRepo.listPublicCategories();
  }

  /**
   * Fetches active public tags with published application counts.
   */
  async listPublicTags(): Promise<TagSummary[]> {
    return this.appRepo.listPublicTags();
  }
}
