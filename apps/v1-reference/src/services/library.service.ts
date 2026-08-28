import type { UserLibraryItem } from '@/types/user.types';
import type { App } from '@/types/app.types';
import type { Result } from '@/types/result.types';
import type { AppError } from '@/lib/errors';
import type { PaginatedResult, QueryOptions } from '@/repositories/types';
import {
  userRepository,
  appRepository,
  type IUserRepository,
  type IAppRepository,
} from '@/repositories';
import { analyticsService } from '@/services/analytics.service';
import { isErr, ok, err } from '@/lib/result';
import { AppError as ErrorFactory } from '@/lib/errors';
import { saveToLibrarySchema } from '@/schemas/user.schema';

export interface SaveAppOptions {
  isFavorite?: boolean;
  isPinned?: boolean;
  customNotes?: string;
}

export interface EnrichedLibraryItem {
  readonly libraryItem: UserLibraryItem;
  readonly app: App | null;
  readonly isUnavailable: boolean;
}

export interface IUserLibraryService {
  saveApp(
    userId: string,
    appId: string,
    options?: SaveAppOptions
  ): Promise<Result<UserLibraryItem, AppError>>;
  removeApp(userId: string, appId: string): Promise<Result<void, AppError>>;
  isAppSaved(userId: string, appId: string): Promise<Result<boolean, AppError>>;
  getUserLibrary(
    userId: string,
    options?: QueryOptions
  ): Promise<Result<PaginatedResult<UserLibraryItem>, AppError>>;
  getLibraryCount(userId: string): Promise<Result<number, AppError>>;
  toggleSave(
    userId: string,
    appId: string
  ): Promise<Result<{ isSaved: boolean; item?: UserLibraryItem }, AppError>>;
  getEnrichedLibrary(
    userId: string,
    options?: QueryOptions
  ): Promise<Result<PaginatedResult<EnrichedLibraryItem>, AppError>>;
}

export class UserLibraryService implements IUserLibraryService {
  constructor(
    private readonly userRepo: IUserRepository = userRepository,
    private readonly appRepo: IAppRepository = appRepository
  ) {}

  public async saveApp(
    userId: string,
    appId: string,
    options?: SaveAppOptions
  ): Promise<Result<UserLibraryItem, AppError>> {
    if (!userId) {
      return err(ErrorFactory.unauthorized('You must be signed in to save apps to your library'));
    }

    const validation = saveToLibrarySchema.safeParse({
      appId,
      ...options,
    });

    if (!validation.success) {
      return err(
        ErrorFactory.badRequest(
          'Validation failed for library bookmark',
          validation.error.issues[0]?.path.join('.')
        )
      );
    }

    const result = await this.userRepo.addToLibrary(userId, validation.data);
    if (isErr(result)) {
      return result;
    }

    // Trigger non-blocking telemetry event
    void analyticsService.trackLibraryAdd(appId, userId);

    return result;
  }

  public async removeApp(userId: string, appId: string): Promise<Result<void, AppError>> {
    if (!userId) {
      return err(
        ErrorFactory.unauthorized('You must be signed in to remove apps from your library')
      );
    }

    const result = await this.userRepo.removeFromLibrary(userId, appId);
    if (isErr(result)) {
      return result;
    }

    // Trigger non-blocking telemetry event
    void analyticsService.trackLibraryRemove(appId, userId);

    return result;
  }

  public async isAppSaved(userId: string, appId: string): Promise<Result<boolean, AppError>> {
    if (!userId || !appId) {
      return ok(false);
    }
    return this.userRepo.isInLibrary(userId, appId);
  }

  public async getUserLibrary(
    userId: string,
    options?: QueryOptions
  ): Promise<Result<PaginatedResult<UserLibraryItem>, AppError>> {
    if (!userId) {
      return err(ErrorFactory.unauthorized('You must be signed in to view your library'));
    }
    return this.userRepo.getUserLibrary(userId, options);
  }

  public async getLibraryCount(userId: string): Promise<Result<number, AppError>> {
    if (!userId) {
      return ok(0);
    }
    return this.userRepo.getLibraryCount(userId);
  }

  public async toggleSave(
    userId: string,
    appId: string
  ): Promise<Result<{ isSaved: boolean; item?: UserLibraryItem }, AppError>> {
    if (!userId) {
      return err(ErrorFactory.unauthorized('You must be signed in to modify your library'));
    }

    const checkResult = await this.userRepo.isInLibrary(userId, appId);
    if (isErr(checkResult)) {
      return checkResult;
    }

    if (checkResult.data) {
      const removeResult = await this.removeApp(userId, appId);
      if (isErr(removeResult)) {
        return removeResult;
      }
      return ok({ isSaved: false });
    } else {
      const saveResult = await this.saveApp(userId, appId);
      if (isErr(saveResult)) {
        return saveResult;
      }
      return ok({ isSaved: true, item: saveResult.data });
    }
  }

  public async getEnrichedLibrary(
    userId: string,
    options?: QueryOptions
  ): Promise<Result<PaginatedResult<EnrichedLibraryItem>, AppError>> {
    const libraryResult = await this.getUserLibrary(userId, options);
    if (isErr(libraryResult)) {
      return libraryResult;
    }

    const enrichedItems: EnrichedLibraryItem[] = [];

    for (const item of libraryResult.data.items) {
      const appResult = await this.appRepo.findById(item.appId);
      const app = appResult.success ? appResult.data : null;

      // An app is considered unavailable if it does not exist, is in draft, or is archived
      const isUnavailable = !app || app.status !== 'published';

      enrichedItems.push({
        libraryItem: item,
        app,
        isUnavailable,
      });
    }

    return ok({
      items: enrichedItems,
      hasMore: libraryResult.data.hasMore,
      nextCursor: libraryResult.data.nextCursor,
    });
  }
}

export const userLibraryService = new UserLibraryService();
