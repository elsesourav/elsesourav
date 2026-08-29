import { describe, it, expect, vi } from 'vitest';
import { UserRepository, UserService } from '@elsesourav/database';
import { AppError } from '@elsesourav/types';
import { PrismaClient, UserRole } from '@elsesourav/database';

describe('User Identity & Profile Architecture', () => {
  const mockPrismaUser = {
    id: 'usr-123',
    supabaseAuthId: 'sb-auth-123',
    email: 'developer@elsesourav.com',
    displayName: 'Sourav',
    username: 'elsesourav',
    photoUrl: 'https://elsesourav.com/avatar.png',
    bio: 'Software engineer & indie hacker',
    role: UserRole.USER,
    preferences: {
      theme: 'dark',
      emailNotifications: true,
      reduceMotion: false,
      compactView: false,
    },
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
    deletedAt: null,
  };

  it('synchronizes authenticated Supabase identity idempotently', async () => {
    const mockPrisma = {
      user: {
        upsert: vi.fn().mockResolvedValue(mockPrismaUser),
      },
    };

    const repo = new UserRepository(mockPrisma as unknown as PrismaClient);
    const synced = await repo.syncUserAuth({
      supabaseAuthId: 'sb-auth-123',
      email: 'developer@elsesourav.com',
      displayName: 'Sourav',
    });

    expect(mockPrisma.user.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { supabaseAuthId: 'sb-auth-123' },
      })
    );
    expect(synced.id).toBe('usr-123');
    expect(synced.email).toBe('developer@elsesourav.com');
  });

  it('returns safe public profile without sensitive internal fields', async () => {
    const mockPrisma = {
      user: {
        findUnique: vi.fn().mockResolvedValue(mockPrismaUser),
      },
    };

    const repo = new UserRepository(mockPrisma as unknown as PrismaClient);
    const service = new UserService(repo);

    const publicProfile = await service.getPublicProfile('elsesourav');

    expect(publicProfile.id).toBe('usr-123');
    expect(publicProfile.displayName).toBe('Sourav');
    expect(publicProfile.username).toBe('elsesourav');
    expect(publicProfile.bio).toBe('Software engineer & indie hacker');
    // Ensure sensitive fields are not on public profile
    expect((publicProfile as unknown as Record<string, unknown>)['email']).toBeUndefined();
    expect((publicProfile as unknown as Record<string, unknown>)['preferences']).toBeUndefined();
  });

  it('rejects reserved usernames in UserService', async () => {
    const mockRepo = {
      updateProfile: vi.fn(),
    } as unknown as UserRepository;

    const service = new UserService(mockRepo);

    await expect(
      service.updateProfile('usr-123', 'usr-123', { username: 'admin' })
    ).rejects.toThrowError(AppError);

    await expect(
      service.updateProfile('usr-123', 'usr-123', { username: 'support' })
    ).rejects.toThrowError(AppError);
  });

  it('rejects unauthorized profile updates when caller is not the owner', async () => {
    const mockRepo = {
      updateProfile: vi.fn(),
    } as unknown as UserRepository;

    const service = new UserService(mockRepo);

    // User A ('usr-attacker') attempts to modify User B ('usr-victim')
    await expect(
      service.updateProfile('usr-attacker', 'usr-victim', { displayName: 'Hacked Name' })
    ).rejects.toThrowError(AppError);

    try {
      await service.updateProfile('usr-attacker', 'usr-victim', { displayName: 'Hacked Name' });
    } catch (err: unknown) {
      expect(err).toBeInstanceOf(AppError);
      expect((err as AppError).code).toBe('AUTHORIZATION_ERROR');
    }
  });

  it('rejects unauthorized preference updates when caller is not the owner', async () => {
    const mockRepo = {
      updatePreferences: vi.fn(),
    } as unknown as UserRepository;

    const service = new UserService(mockRepo);

    await expect(
      service.updatePreferences('usr-attacker', 'usr-victim', { theme: 'light' })
    ).rejects.toThrowError(AppError);
  });

  it('enforces exact confirmation phrase for account deletion', async () => {
    const mockRepo = {
      softDeleteUserTransaction: vi.fn().mockResolvedValue(undefined),
    } as unknown as UserRepository;

    const service = new UserService(mockRepo);

    // Invalid confirmation
    await expect(
      service.requestAccountDeletion('usr-123', 'usr-123', 'delete please')
    ).rejects.toThrowError(AppError);

    // Valid confirmation
    await service.requestAccountDeletion(
      'usr-123',
      'usr-123',
      'DELETE MY ACCOUNT',
      'Leaving service'
    );
    expect(mockRepo.softDeleteUserTransaction).toHaveBeenCalledWith('usr-123', 'Leaving service');
  });
});
