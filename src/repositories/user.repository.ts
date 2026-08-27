import {
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  deleteDoc,
  type Firestore,
} from 'firebase/firestore';
import { FirestoreRepository } from './firestore.repository';
import type { IUserRepository } from './interfaces';
import type { User, UserLibraryItem } from '@/types/user.types';
import type { AuthUser } from '@/types/auth.types';
import type { RepositoryResult, PaginatedRepositoryResult } from './types';
import {
  createUserProfileSchema,
  updateUserProfileSchema,
  updateUserPreferencesSchema,
} from '@/schemas/user.schema';
import { createFirestoreConverter } from './converters';
import { ok, err } from '@/lib/result';
import { AppError } from '@/lib/errors';
import { z } from 'zod';

export type CreateUserProfileDto = z.infer<typeof createUserProfileSchema>;
export type UpdateUserProfileDto = z.infer<typeof updateUserProfileSchema>;
export type UpdateUserPreferencesDto = z.infer<typeof updateUserPreferencesSchema>;

export class FirestoreUserRepository
  extends FirestoreRepository<User, CreateUserProfileDto, UpdateUserProfileDto>
  implements IUserRepository
{
  constructor(getFirestoreInstance?: () => Firestore) {
    super('users', {
      createSchema: createUserProfileSchema,
      updateSchema: updateUserProfileSchema,
      getFirestore: getFirestoreInstance,
    });
  }

  public async findByEmail(email: string): RepositoryResult<User | null> {
    if (!email || typeof email !== 'string') {
      return err(AppError.badRequest('Invalid email provided for user lookup', 'email'));
    }

    try {
      const result = await this.findMany({
        filters: [{ field: 'email', operator: '==', value: email.toLowerCase() }],
        limit: 1,
      });

      if (!result.success) {
        return err(result.error);
      }

      return ok(result.data.items[0] || null);
    } catch (error) {
      return err(this.handleFirestoreError(error, `query user by email "${email}"`));
    }
  }

  public async findByUsername(username: string): RepositoryResult<User | null> {
    if (!username || typeof username !== 'string') {
      return err(AppError.badRequest('Invalid username provided for user lookup', 'username'));
    }

    try {
      const result = await this.findMany({
        filters: [{ field: 'username', operator: '==', value: username.toLowerCase() }],
        limit: 1,
      });

      if (!result.success) {
        return err(result.error);
      }

      return ok(result.data.items[0] || null);
    } catch (error) {
      return err(this.handleFirestoreError(error, `query user by username "${username}"`));
    }
  }

  /**
   * Ensures a Firestore user profile document exists for an authenticated Firebase user.
   * If already existing, returns the existing document without overwriting.
   */
  public async ensureProfile(authUser: AuthUser): RepositoryResult<User> {
    if (!authUser || !authUser.uid) {
      return err(AppError.badRequest('Invalid authenticated user for profile sync', 'uid'));
    }

    try {
      const docRef = this.getDocRef(authUser.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const existingData = docSnap.data();
        return ok(existingData);
      }

      const now = Date.now();
      const resolvedDisplayName =
        authUser.displayName || (authUser.email ? authUser.email.split('@')[0] : '') || 'User';

      const newProfile: User = {
        id: authUser.uid,
        email: authUser.email ? authUser.email.toLowerCase() : '',
        displayName: resolvedDisplayName,
        photoUrl: authUser.photoURL || undefined,
        role: 'user',
        status: 'active',
        preferences: {
          theme: 'system',
          emailNotifications: true,
          reduceMotion: false,
          compactView: false,
        },
        createdAt: now,
        updatedAt: now,
        lastLoginAt: now,
      };

      await setDoc(docRef, newProfile);
      return ok(newProfile);
    } catch (error) {
      return err(this.handleFirestoreError(error, `ensure profile for user UID "${authUser.uid}"`));
    }
  }

  /**
   * Update allowed user-facing profile fields
   */
  public async updateProfile(uid: string, data: UpdateUserProfileDto): RepositoryResult<User> {
    if (!uid) {
      return err(AppError.badRequest('UID is required for updating profile', 'uid'));
    }

    const validation = updateUserProfileSchema.safeParse(data);
    if (!validation.success) {
      const field = validation.error.issues[0]?.path.join('.') || 'profile';
      const msg = validation.error.issues
        .map((e) => `${e.path.join('.')}: ${e.message}`)
        .join(', ');
      return err(AppError.validation(msg, field, validation.error.issues));
    }

    return this.update(uid, validation.data);
  }

  /**
   * Update user UI preferences
   */
  public async updatePreferences(
    uid: string,
    preferences: UpdateUserPreferencesDto
  ): RepositoryResult<User> {
    if (!uid) {
      return err(AppError.badRequest('UID is required for updating preferences', 'uid'));
    }

    const validation = updateUserPreferencesSchema.safeParse(preferences);
    if (!validation.success) {
      const field = validation.error.issues[0]?.path.join('.') || 'preferences';
      const msg = validation.error.issues
        .map((e) => `${e.path.join('.')}: ${e.message}`)
        .join(', ');
      return err(AppError.validation(msg, field, validation.error.issues));
    }

    const existingResult = await this.findById(uid);
    if (!existingResult.success) {
      return err(existingResult.error);
    }

    if (!existingResult.data) {
      return err(AppError.notFound(`User profile not found for ID: ${uid}`));
    }

    const mergedPreferences = {
      ...existingResult.data.preferences,
      ...validation.data,
    };

    const updateResult = await this.update(uid, {
      preferences: mergedPreferences,
    } as unknown as UpdateUserProfileDto);

    if (!updateResult.success) {
      return err(updateResult.error);
    }

    return ok({
      ...existingResult.data,
      preferences: mergedPreferences,
      updatedAt: Date.now(),
    });
  }

  /**
   * Soft-delete a user profile by setting status to 'deleted' and setting deletedAt timestamp
   */
  public async softDelete(uid: string): RepositoryResult<User> {
    if (!uid) {
      return err(AppError.badRequest('UID is required to soft-delete profile', 'uid'));
    }

    const now = Date.now();
    const docRef = this.getDocRef(uid);

    try {
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        return err(AppError.notFound(`User profile not found for ID: ${uid}`));
      }

      const existingData = docSnap.data();
      const updatedUser: User = {
        ...existingData,
        status: 'deleted',
        deletedAt: now,
        updatedAt: now,
      };

      await setDoc(docRef, updatedUser);
      return ok(updatedUser);
    } catch (error) {
      return err(this.handleFirestoreError(error, `soft-delete user profile "${uid}"`));
    }
  }

  /**
   * Subcollection: User Library
   */
  public async getLibrary(userId: string): PaginatedRepositoryResult<UserLibraryItem> {
    if (!userId) {
      return err(AppError.badRequest('User ID is required to fetch user library', 'userId'));
    }

    try {
      const libraryCol = collection(this.db, 'users', userId, 'userLibrary').withConverter(
        createFirestoreConverter<UserLibraryItem>()
      );
      const snapshot = await getDocs(libraryCol);
      const items = snapshot.docs.map((d) => d.data());

      return ok({
        items,
        hasMore: false,
      });
    } catch (error) {
      return err(this.handleFirestoreError(error, `fetch library for user "${userId}"`));
    }
  }

  public async addToLibrary(
    userId: string,
    item: Omit<UserLibraryItem, 'id' | 'addedAt'>
  ): RepositoryResult<UserLibraryItem> {
    if (!userId || !item.appId) {
      return err(AppError.badRequest('User ID and App ID are required', 'appId'));
    }

    try {
      const libraryDocRef = doc(this.db, 'users', userId, 'userLibrary', item.appId).withConverter(
        createFirestoreConverter<UserLibraryItem>()
      );

      const libraryItem: UserLibraryItem = {
        id: item.appId,
        userId,
        appId: item.appId,
        isFavorite: item.isFavorite || false,
        isPinned: item.isPinned || false,
        customNotes: item.customNotes,
        addedAt: Date.now(),
        lastOpenedAt: Date.now(),
      };

      await setDoc(libraryDocRef, libraryItem);
      return ok(libraryItem);
    } catch (error) {
      return err(this.handleFirestoreError(error, `add app "${item.appId}" to library`));
    }
  }

  public async removeFromLibrary(userId: string, appId: string): RepositoryResult<void> {
    if (!userId || !appId) {
      return err(AppError.badRequest('User ID and App ID are required', 'appId'));
    }

    try {
      const libraryDocRef = doc(this.db, 'users', userId, 'userLibrary', appId);
      await deleteDoc(libraryDocRef);
      return ok(undefined);
    } catch (error) {
      return err(this.handleFirestoreError(error, `remove app "${appId}" from library`));
    }
  }

  public async toggleFavorite(userId: string, appId: string): RepositoryResult<boolean> {
    if (!userId || !appId) {
      return err(AppError.badRequest('User ID and App ID are required', 'appId'));
    }

    try {
      const libraryDocRef = doc(this.db, 'users', userId, 'userLibrary', appId).withConverter(
        createFirestoreConverter<UserLibraryItem>()
      );
      const snap = await getDoc(libraryDocRef);

      if (!snap.exists()) {
        const newItem: UserLibraryItem = {
          id: appId,
          userId,
          appId,
          isFavorite: true,
          isPinned: false,
          addedAt: Date.now(),
        };
        await setDoc(libraryDocRef, newItem);
        return ok(true);
      }

      const existing = snap.data();
      const nextFavorite = !existing.isFavorite;
      await setDoc(libraryDocRef, { ...existing, isFavorite: nextFavorite });
      return ok(nextFavorite);
    } catch (error) {
      return err(this.handleFirestoreError(error, `toggle favorite for app "${appId}"`));
    }
  }
}

export const userRepository = new FirestoreUserRepository();
