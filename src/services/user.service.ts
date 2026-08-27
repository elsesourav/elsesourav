import type { User, UserLibraryItem } from '@/types/user.types';
import type { AuthUser } from '@/types/auth.types';
import type { Result } from '@/types/result.types';
import type { AppError } from '@/lib/errors';
import type { PaginatedResult } from '@/repositories/types';
import {
  userRepository,
  type IUserRepository,
  type UpdateUserProfileDto,
  type UpdateUserPreferencesDto,
} from '@/repositories';

export type { UpdateUserProfileDto, UpdateUserPreferencesDto };

export interface IUserService {
  getUserProfile(uid: string): Promise<Result<User | null, AppError>>;
  ensureUserProfile(authUser: AuthUser): Promise<Result<User, AppError>>;
  updateUserProfile(uid: string, data: UpdateUserProfileDto): Promise<Result<User, AppError>>;
  updateUserPreferences(
    uid: string,
    preferences: UpdateUserPreferencesDto
  ): Promise<Result<User, AppError>>;
  softDeleteUser(uid: string): Promise<Result<User, AppError>>;
  getUserLibrary(uid: string): Promise<Result<PaginatedResult<UserLibraryItem>, AppError>>;
  addToLibrary(
    uid: string,
    appId: string,
    isFavorite?: boolean,
    notes?: string
  ): Promise<Result<UserLibraryItem, AppError>>;
  removeFromLibrary(uid: string, appId: string): Promise<Result<void, AppError>>;
  toggleFavorite(uid: string, appId: string): Promise<Result<boolean, AppError>>;
}

export class UserService implements IUserService {
  constructor(private readonly userRepo: IUserRepository = userRepository) {}

  public async getUserProfile(uid: string): Promise<Result<User | null, AppError>> {
    return this.userRepo.findById(uid);
  }

  public async ensureUserProfile(authUser: AuthUser): Promise<Result<User, AppError>> {
    return this.userRepo.ensureProfile(authUser);
  }

  public async updateUserProfile(
    uid: string,
    data: UpdateUserProfileDto
  ): Promise<Result<User, AppError>> {
    return this.userRepo.updateProfile(uid, data);
  }

  public async updateUserPreferences(
    uid: string,
    preferences: UpdateUserPreferencesDto
  ): Promise<Result<User, AppError>> {
    return this.userRepo.updatePreferences(uid, preferences);
  }

  public async softDeleteUser(uid: string): Promise<Result<User, AppError>> {
    return this.userRepo.softDelete(uid);
  }

  public async getUserLibrary(
    uid: string
  ): Promise<Result<PaginatedResult<UserLibraryItem>, AppError>> {
    return this.userRepo.getLibrary(uid);
  }

  public async addToLibrary(
    uid: string,
    appId: string,
    isFavorite = false,
    notes?: string
  ): Promise<Result<UserLibraryItem, AppError>> {
    return this.userRepo.addToLibrary(uid, {
      appId,
      isFavorite,
      isPinned: false,
      customNotes: notes,
    });
  }

  public async removeFromLibrary(uid: string, appId: string): Promise<Result<void, AppError>> {
    return this.userRepo.removeFromLibrary(uid, appId);
  }

  public async toggleFavorite(uid: string, appId: string): Promise<Result<boolean, AppError>> {
    return this.userRepo.toggleFavorite(uid, appId);
  }
}

export const userService = new UserService();
