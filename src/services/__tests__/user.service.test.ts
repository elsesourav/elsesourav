import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserService } from '../user.service';
import type { IUserRepository } from '@/repositories';
import type { User, UserLibraryItem } from '@/types/user.types';
import type { AuthUser } from '@/types/auth.types';
import { ok, err } from '@/lib/result';
import { AppError } from '@/lib/errors';
import { updateUserProfileSchema } from '@/schemas/user.schema';

describe('UserService & User Profile Architecture', () => {
  let mockUserRepo: IUserRepository;
  let userService: UserService;

  const mockAuthUser: AuthUser = {
    uid: 'auth-uid-123',
    email: 'sourav@elsesourav.com',
    emailVerified: true,
    displayName: 'Sourav Test',
    photoURL: 'https://elsesourav.com/avatar.jpg',
    isAnonymous: false,
    providerId: 'password',
    createdAt: 1700000000000,
    lastLoginAt: 1700000000000,
  };

  const mockUserProfile: User = {
    id: 'auth-uid-123',
    email: 'sourav@elsesourav.com',
    displayName: 'Sourav Test',
    username: 'elsesourav',
    photoUrl: 'https://elsesourav.com/avatar.jpg',
    bio: 'Software engineer building ElseSourav platform.',
    role: 'user',
    status: 'active',
    preferences: {
      theme: 'dark',
      emailNotifications: true,
      reduceMotion: false,
      compactView: false,
      language: 'en',
    },
    createdAt: 1700000000000,
    updatedAt: 1700000000000,
    lastLoginAt: 1700000000000,
  };

  beforeEach(() => {
    mockUserRepo = {
      findById: vi.fn(),
      findMany: vi.fn(),
      findByEmail: vi.fn(),
      findByUsername: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      ensureProfile: vi.fn(),
      updateProfile: vi.fn(),
      updatePreferences: vi.fn(),
      softDelete: vi.fn(),
      getLibrary: vi.fn(),
      addToLibrary: vi.fn(),
      removeFromLibrary: vi.fn(),
      toggleFavorite: vi.fn(),
    } as unknown as IUserRepository;

    userService = new UserService(mockUserRepo);
  });

  describe('1. Auto-provisioning and Ensuring Profiles', () => {
    it('creates a new Firestore profile for a new authenticated user', async () => {
      vi.mocked(mockUserRepo.ensureProfile).mockResolvedValue(ok(mockUserProfile));

      const result = await userService.ensureUserProfile(mockAuthUser);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.id).toBe(mockAuthUser.uid);
        expect(result.data.email).toBe(mockAuthUser.email);
        expect(result.data.role).toBe('user');
        expect(result.data.status).toBe('active');
      }
      expect(mockUserRepo.ensureProfile).toHaveBeenCalledWith(mockAuthUser);
    });

    it('does not duplicate profile if profile already exists in Firestore', async () => {
      vi.mocked(mockUserRepo.ensureProfile).mockResolvedValue(ok(mockUserProfile));

      const result = await userService.ensureUserProfile(mockAuthUser);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(mockUserProfile);
      }
      expect(mockUserRepo.ensureProfile).toHaveBeenCalledTimes(1);
    });

    it('guarantees Firebase Auth UID matches Firestore document ID', async () => {
      vi.mocked(mockUserRepo.ensureProfile).mockResolvedValue(ok(mockUserProfile));

      const result = await userService.ensureUserProfile(mockAuthUser);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.id).toBe(mockAuthUser.uid);
      }
    });
  });

  describe('2. Updating Allowed vs Protected Fields', () => {
    it('allows updating permitted fields: displayName, username, bio, and photoUrl', async () => {
      const updateData = {
        displayName: 'Sourav Updated',
        username: 'sourav_dev',
        bio: 'Updated bio information',
        photoUrl: 'https://elsesourav.com/new-avatar.png',
      };

      const updatedProfile: User = {
        ...mockUserProfile,
        ...updateData,
        updatedAt: 1700000050000,
      };

      vi.mocked(mockUserRepo.updateProfile).mockResolvedValue(ok(updatedProfile));

      const result = await userService.updateUserProfile('auth-uid-123', updateData);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.displayName).toBe('Sourav Updated');
        expect(result.data.username).toBe('sourav_dev');
        expect(result.data.bio).toBe('Updated bio information');
      }
      expect(mockUserRepo.updateProfile).toHaveBeenCalledWith('auth-uid-123', updateData);
    });

    it('rejects updates attempting to modify protected fields like role or status via schema', () => {
      const maliciousPayload = {
        displayName: 'Hacker User',
        role: 'admin',
        status: 'active',
        createdAt: 999999999999,
      };

      const parsed = updateUserProfileSchema.safeParse(maliciousPayload);
      expect(parsed.success).toBe(true);

      if (parsed.success) {
        // Schema strips unauthorized fields
        expect((parsed.data as Record<string, unknown>).role).toBeUndefined();
        expect((parsed.data as Record<string, unknown>).status).toBeUndefined();
        expect((parsed.data as Record<string, unknown>).createdAt).toBeUndefined();
        expect(parsed.data.displayName).toBe('Hacker User');
      }
    });

    it('rejects invalid profile inputs such as invalid usernames or malformed URLs', () => {
      const invalidPayload = {
        username: 'ab', // Min 3 chars
        photoUrl: 'not-a-valid-url',
      };

      const parsed = updateUserProfileSchema.safeParse(invalidPayload);
      expect(parsed.success).toBe(false);
      if (!parsed.success) {
        const errorFields = parsed.error.issues.map((e) => e.path[0]);
        expect(errorFields).toContain('username');
        expect(errorFields).toContain('photoUrl');
      }
    });
  });

  describe('3. Updating User Preferences', () => {
    it('updates user UI preferences properly', async () => {
      const newPrefs = {
        theme: 'light' as const,
        compactView: true,
        language: 'bn',
      };

      const updatedProfile: User = {
        ...mockUserProfile,
        preferences: {
          ...mockUserProfile.preferences,
          ...newPrefs,
        },
      };

      vi.mocked(mockUserRepo.updatePreferences).mockResolvedValue(ok(updatedProfile));

      const result = await userService.updateUserPreferences('auth-uid-123', newPrefs);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.preferences.theme).toBe('light');
        expect(result.data.preferences.compactView).toBe(true);
        expect(result.data.preferences.language).toBe('bn');
      }
      expect(mockUserRepo.updatePreferences).toHaveBeenCalledWith('auth-uid-123', newPrefs);
    });
  });

  describe('4. Soft Delete Operation', () => {
    it('soft deletes user profile by setting status to deleted and setting deletedAt timestamp', async () => {
      const now = Date.now();
      const deletedProfile: User = {
        ...mockUserProfile,
        status: 'deleted',
        deletedAt: now,
      };

      vi.mocked(mockUserRepo.softDelete).mockResolvedValue(ok(deletedProfile));

      const result = await userService.softDeleteUser('auth-uid-123');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.status).toBe('deleted');
        expect(result.data.deletedAt).toBe(now);
      }
      expect(mockUserRepo.softDelete).toHaveBeenCalledWith('auth-uid-123');
    });
  });

  describe('5. Error Handling & Missing Profiles', () => {
    it('safely returns null when user profile is not found', async () => {
      vi.mocked(mockUserRepo.findById).mockResolvedValue(ok(null));

      const result = await userService.getUserProfile('non-existent-uid');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBeNull();
      }
    });

    it('correctly propagates repository errors', async () => {
      const repoError = AppError.internal('Firestore network failure');
      vi.mocked(mockUserRepo.findById).mockResolvedValue(err(repoError));

      const result = await userService.getUserProfile('auth-uid-123');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toContain('Firestore network failure');
      }
    });
  });

  describe('6. User Library Operations', () => {
    it('adds and removes items from user library subcollection', async () => {
      const mockLibraryItem: UserLibraryItem = {
        id: 'app-calc-1',
        userId: 'auth-uid-123',
        appId: 'app-calc-1',
        isFavorite: true,
        isPinned: false,
        addedAt: Date.now(),
      };

      vi.mocked(mockUserRepo.addToLibrary).mockResolvedValue(ok(mockLibraryItem));
      vi.mocked(mockUserRepo.removeFromLibrary).mockResolvedValue(ok(undefined));

      const addResult = await userService.addToLibrary('auth-uid-123', 'app-calc-1', true);
      expect(addResult.success).toBe(true);

      const removeResult = await userService.removeFromLibrary('auth-uid-123', 'app-calc-1');
      expect(removeResult.success).toBe(true);
    });
  });
});
