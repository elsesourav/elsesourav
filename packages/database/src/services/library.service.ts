import { LibraryRepository } from '../repositories/library.repository';
import { AppError } from '@elsesourav/types';
import { SaveAppSchema, LibraryQuerySchema } from '@elsesourav/validation';
import type {
  SaveAppInput,
  SaveAppResult,
  UserLibraryResult,
} from '@elsesourav/types';

export class LibraryService {
  constructor(private readonly libraryRepo: LibraryRepository) {}

  private verifyAuthenticatedUser(callerUserId?: string): string {
    if (!callerUserId || typeof callerUserId !== 'string' || callerUserId.trim().length === 0) {
      throw AppError.unauthorized('Authentication required to access user library');
    }
    return callerUserId.trim();
  }

  async saveApp(callerUserId: string | undefined, input: SaveAppInput): Promise<SaveAppResult> {
    const userId = this.verifyAuthenticatedUser(callerUserId);
    const validated = SaveAppSchema.safeParse(input);
    if (!validated.success) {
      throw AppError.validation(validated.error.issues[0]?.message || 'Invalid library save parameters');
    }

    const item = await this.libraryRepo.saveApp(userId, input);
    return {
      isSaved: true,
      appId: input.appId,
      item,
    };
  }

  async unsaveApp(callerUserId: string | undefined, appId: string): Promise<SaveAppResult> {
    const userId = this.verifyAuthenticatedUser(callerUserId);
    if (!appId || typeof appId !== 'string' || appId.trim().length === 0) {
      throw AppError.validation('A valid appId is required');
    }

    await this.libraryRepo.unsaveApp(userId, appId.trim());
    return {
      isSaved: false,
      appId: appId.trim(),
    };
  }

  async isAppSaved(callerUserId: string | undefined, appId: string): Promise<boolean> {
    if (!callerUserId) return false;
    if (!appId) return false;
    return this.libraryRepo.isAppSaved(callerUserId.trim(), appId.trim());
  }

  async getUserSavedAppIds(callerUserId: string | undefined): Promise<string[]> {
    if (!callerUserId) return [];
    return this.libraryRepo.getUserSavedAppIds(callerUserId.trim());
  }

  async getUserLibrary(
    callerUserId: string | undefined,
    options: { page?: number; limit?: number; isFavorite?: boolean } = {}
  ): Promise<UserLibraryResult> {
    const userId = this.verifyAuthenticatedUser(callerUserId);
    const validated = LibraryQuerySchema.safeParse(options);
    if (!validated.success) {
      throw AppError.validation(validated.error.issues[0]?.message || 'Invalid library query parameters');
    }

    return this.libraryRepo.getUserLibrary(userId, options);
  }
}
