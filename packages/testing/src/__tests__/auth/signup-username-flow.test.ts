import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SignUpSchema, ForgotPasswordSchema } from '@elsesourav/validation';
import { UserService, UserRepository } from '@elsesourav/database';
import { RateLimiter } from '@elsesourav/utils';
import type { PrismaClient } from '@prisma/client';

describe('Signup Username & Live Validation Suite', () => {
  let mockPrisma: {
    user: {
      findUnique: ReturnType<typeof vi.fn>;
      upsert: ReturnType<typeof vi.fn>;
    };
  };
  let userRepo: UserRepository;
  let userService: UserService;

  beforeEach(() => {
    mockPrisma = {
      user: {
        findUnique: vi.fn(),
        upsert: vi.fn(),
      },
    };
    userRepo = new UserRepository(mockPrisma as unknown as PrismaClient);
    userService = new UserService(userRepo);
  });

  describe('1. SignUpSchema Regex & Security Constraints', () => {
    it('accepts valid credentials with proper regex formats', () => {
      const valid = {
        email: 'developer@elsesourav.com',
        password: 'Password123!',
        displayName: 'Sourav Barui',
        username: 'sourav_dev-99',
      };
      const result = SignUpSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('rejects invalid full names with HTML tags or malicious symbols', () => {
      const invalidNames = [
        '<script>alert(1)</script>',
        'Sourav @ Barui',
        'User #1',
        'A', // too short (<2)
        'a'.repeat(65), // too long (>60)
      ];

      for (const name of invalidNames) {
        const result = SignUpSchema.safeParse({
          email: 'user@example.com',
          password: 'Password123!',
          displayName: name,
          username: 'valid_user',
        });
        expect(result.success).toBe(false);
      }
    });

    it('rejects invalid email formats', () => {
      const invalidEmails = [
        'plainaddress',
        '@missinguser.com',
        'user@.com',
        'user@domain..com',
        'user@domain',
      ];

      for (const email of invalidEmails) {
        const result = SignUpSchema.safeParse({
          email,
          password: 'Password123!',
          displayName: 'Valid Name',
          username: 'valid_user',
        });
        expect(result.success).toBe(false);
      }
    });

    it('accepts any password with at least 8 characters (e.g. 11111111, simple passwords)', () => {
      const allowedPasswords = [
        '11111111',
        'password',
        'onlyletters',
        '12345678',
        'Complex@2026!',
      ];

      for (const password of allowedPasswords) {
        const result = SignUpSchema.safeParse({
          email: 'valid@example.com',
          password,
          displayName: 'Valid Name',
          username: 'valid_user',
        });
        expect(result.success).toBe(true);
      }
    });

    it('rejects passwords under 8 characters', () => {
      const tooShortPasswords = ['short', '12345', '1234567', 'a'];

      for (const password of tooShortPasswords) {
        const result = SignUpSchema.safeParse({
          email: 'valid@example.com',
          password,
          displayName: 'Valid Name',
          username: 'valid_user',
        });
        expect(result.success).toBe(false);
      }
    });

    it('rejects usernames under 4 characters or with consecutive symbols', () => {
      const invalidUsernames = [
        'dev', // too short
        '_invalid', // starts with underscore
        'invalid_', // ends with underscore
        'user__name', // consecutive underscores
        'user--name', // consecutive hyphens
        'alex smith', // spaces
      ];

      for (const username of invalidUsernames) {
        const result = SignUpSchema.safeParse({
          email: 'developer@elsesourav.com',
          password: 'Password123!',
          displayName: 'Developer',
          username,
        });
        expect(result.success).toBe(false);
      }
    });

    it('rejects reserved system usernames', () => {
      const reservedNames = ['admin', 'administrator', 'api', 'auth', 'support', 'system'];
      for (const name of reservedNames) {
        const payload = {
          email: 'test@elsesourav.com',
          password: 'Password123!',
          displayName: 'Test User',
          username: name,
        };
        const result = SignUpSchema.safeParse(payload);
        expect(result.success).toBe(false);
      }
    });
  });

  describe('2. Live Backend Username Availability Checks', () => {
    it('returns available for non-existent valid username', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const check = await userService.checkUsernameAvailability('unique_handle');
      expect(check.available).toBe(true);
      expect(check.error).toBeUndefined();
    });

    it('returns unavailable when username is already taken by another user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-existing-1',
        supabaseAuthId: 'sb-1',
        email: 'taken@elsesourav.com',
        displayName: 'Taken User',
        username: 'taken_handle',
        photoUrl: null,
        bio: null,
        role: 'USER',
        preferences: {},
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });

      const check = await userService.checkUsernameAvailability('taken_handle', 'current-user-2');
      expect(check.available).toBe(false);
      expect(check.error).toMatch(/already taken/i);
    });

    it('returns available if the username belongs to the current user (self-edit)', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-me-1',
        supabaseAuthId: 'sb-me',
        email: 'me@elsesourav.com',
        displayName: 'My Name',
        username: 'my_current_handle',
        photoUrl: null,
        bio: null,
        role: 'USER',
        preferences: {},
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });

      const check = await userService.checkUsernameAvailability('my_current_handle', 'user-me-1');
      expect(check.available).toBe(true);
    });

    it('rejects reserved words in backend check', async () => {
      const check = await userService.checkUsernameAvailability('admin');
      expect(check.available).toBe(false);
      expect(check.error).toMatch(/reserved/i);
    });
  });

  describe('3. Spam Protection & Request Throttling', () => {
    it('enforces sliding window rate limit tokens', () => {
      const limiter = new RateLimiter({ max: 3, windowMs: 10000 });
      const testIp = '192.168.1.100';

      expect(limiter.consume(testIp).success).toBe(true);
      expect(limiter.consume(testIp).success).toBe(true);
      expect(limiter.consume(testIp).success).toBe(true);

      const exceeded = limiter.consume(testIp);
      expect(exceeded.success).toBe(false);
      expect(exceeded.retryAfterSeconds).toBeGreaterThan(0);
    });

    it('allows different clients independent rate limit quotas', () => {
      const limiter = new RateLimiter({ max: 2, windowMs: 10000 });
      const ip1 = '10.0.0.1';
      const ip2 = '10.0.0.2';

      expect(limiter.consume(ip1).success).toBe(true);
      expect(limiter.consume(ip1).success).toBe(true);
      expect(limiter.consume(ip1).success).toBe(false);

      expect(limiter.consume(ip2).success).toBe(true);
      expect(limiter.consume(ip2).success).toBe(true);
    });
  });

  describe('4. Email Validation Differentiation (Forgot Password vs Login/Signup)', () => {
    it('requires valid email for Forgot Password flow', () => {
      const valid = { email: 'recovery@elsesourav.com' };
      expect(ForgotPasswordSchema.safeParse(valid).success).toBe(true);

      const invalid = { email: 'not-an-email' };
      expect(ForgotPasswordSchema.safeParse(invalid).success).toBe(false);
    });

    it('synchronizes user with username in database upon signup', async () => {
      mockPrisma.user.upsert.mockResolvedValue({
        id: 'usr-new-1',
        supabaseAuthId: 'sb-auth-99',
        email: 'creator@elsesourav.com',
        displayName: 'Creator',
        username: 'creator_99',
        photoUrl: null,
        bio: null,
        role: 'USER',
        preferences: {},
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });

      const synced = await userRepo.syncUserAuth({
        supabaseAuthId: 'sb-auth-99',
        email: 'creator@elsesourav.com',
        displayName: 'Creator',
        username: 'creator_99',
      });

      expect(synced.username).toBe('creator_99');
      expect(synced.email).toBe('creator@elsesourav.com');
      expect(mockPrisma.user.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          create: expect.objectContaining({
            username: 'creator_99',
          }),
        })
      );
    });
  });

  describe('5. Verified Username Suggestions (2 Available Suggestions)', () => {
    it('generates 2 available suggestions from full name', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const suggestions = await userService.suggestAvailableUsernames('Sourav Barui', 2);
      expect(suggestions).toHaveLength(2);
      expect(suggestions[0]).toBe('sourav_barui');
      expect(suggestions[1]).toBe('souravbarui');
    });

    it('skips taken usernames and falls back to next available candidates', async () => {
      // sourav_barui is taken, but next candidates are available
      mockPrisma.user.findUnique.mockImplementation(({ where }: { where: { username?: string } }) => {
        if (where.username === 'sourav_barui') {
          return Promise.resolve({
            id: 'taken-1',
            supabaseAuthId: 'sb-taken',
            email: 'taken@example.com',
            displayName: 'Taken',
            username: 'sourav_barui',
            photoUrl: null,
            bio: null,
            role: 'USER',
            preferences: {},
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
          });
        }
        return Promise.resolve(null);
      });

      const suggestions = await userService.suggestAvailableUsernames('Sourav Barui', 2);
      expect(suggestions).toHaveLength(2);
      expect(suggestions).not.toContain('sourav_barui');
      expect(suggestions[0]).toBe('souravbarui');
    });
  });
});

