import { AppRepository } from '../repositories/app.repository';
import { AppError } from '@elsesourav/types';
import { AppListQuerySchema, AppSearchSchema } from '@elsesourav/validation';
import type {
  AppListItem,
  PublicApp,
  AppQueryOptions,
  AppSearchInput,
  AppSearchResult,
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
   * Executes a bounded, safe search across public applications.
   */
  async searchPublicApps(input: AppSearchInput = {}): Promise<AppSearchResult> {
    const validated = AppSearchSchema.safeParse(input);
    if (!validated.success) {
      throw AppError.validation(validated.error.issues[0]?.message || 'Invalid search input');
    }

    return this.appRepo.searchPublic(input);
  }
}
