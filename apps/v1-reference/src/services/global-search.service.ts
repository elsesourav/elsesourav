import { searchRepository, type ISearchRepository } from '@/repositories/search.repository';
import type {
  GlobalSearchFilters,
  GlobalSearchResult,
  GlobalSearchResultItem,
} from '@/types/search.types';
import type { Result } from '@/types/result.types';
import { AppError } from '@/lib/errors';

export interface IGlobalSearchService {
  search(filters: GlobalSearchFilters): Promise<Result<GlobalSearchResult, AppError>>;
  getSuggestions(
    query: string,
    limit?: number
  ): Promise<Result<readonly GlobalSearchResultItem[], AppError>>;
}

export class GlobalSearchService implements IGlobalSearchService {
  constructor(private readonly searchRepo: ISearchRepository = searchRepository) {}

  public async search(filters: GlobalSearchFilters): Promise<Result<GlobalSearchResult, AppError>> {
    return this.searchRepo.search(filters);
  }

  public async getSuggestions(
    query: string,
    limit = 6
  ): Promise<Result<readonly GlobalSearchResultItem[], AppError>> {
    return this.searchRepo.getSuggestions(query, limit);
  }
}

export const globalSearchService = new GlobalSearchService();
