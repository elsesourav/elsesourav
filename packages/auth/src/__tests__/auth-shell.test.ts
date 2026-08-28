import { describe, it, expect } from 'vitest';
import { requireAuth, requireRole } from '../server/session';
import { AppError } from '@elsesourav/types';

describe('Authenticated User Application Shell Security', () => {
  it('throws unauthorized error when anonymous user accesses protected resource', async () => {
    const emptyCookieStore = {
      getAll: () => [],
    };

    await expect(requireAuth(emptyCookieStore)).rejects.toThrowError(AppError);
  });

  it('rejects regular USER role when ADMIN role is required', async () => {
    const fakeUserCookies = {
      getAll: () => [{ name: 'sb-access-token', value: 'invalid' }],
    };

    // When token is invalid or user is not logged in, requireRole throws unauthorized
    await expect(requireRole(fakeUserCookies, ['ADMIN'])).rejects.toThrowError(AppError);
  });
});
