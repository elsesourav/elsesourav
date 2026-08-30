import { describe, it, expect, vi } from 'vitest';
import { sanitizeRedirectUrl, AuthError, requireRole, requireAuth } from '@elsesourav/auth';
import { LoginSchema, SignUpSchema, ForgotPasswordSchema } from '@elsesourav/validation';
import { AppError } from '@elsesourav/types';

describe('Auth Redirect Sanitizer (Open Redirect Protection)', () => {
  it('permits valid relative internal application paths', () => {
    expect(sanitizeRedirectUrl('/dashboard')).toBe('/dashboard');
    expect(sanitizeRedirectUrl('/settings/profile')).toBe('/settings/profile');
    expect(sanitizeRedirectUrl('/admin?tab=logs')).toBe('/admin?tab=logs');
  });

  it('rejects external URL targets and falls back to safe default', () => {
    expect(sanitizeRedirectUrl('https://evil-site.com')).toBe('/');
    expect(sanitizeRedirectUrl('http://attacker.org/phishing')).toBe('/');
    expect(sanitizeRedirectUrl('//malicious-domain.com')).toBe('/');
    expect(sanitizeRedirectUrl('javascript:alert(1)')).toBe('/');
  });

  it('handles null, undefined, or empty candidates gracefully', () => {
    expect(sanitizeRedirectUrl(null, '/default')).toBe('/default');
    expect(sanitizeRedirectUrl(undefined, '/default')).toBe('/default');
    expect(sanitizeRedirectUrl('', '/fallback')).toBe('/fallback');
  });
});

describe('Auth Error Translation', () => {
  it('translates invalid credentials error into user-friendly message', () => {
    const error = AuthError.fromSupabase({ message: 'Invalid login credentials' });
    expect(error.message).toBe('Invalid email or password. Please try again.');
    expect(error.code).toBe('AUTHENTICATION_ERROR');
    expect(error.status).toBe(401);
  });

  it('translates unconfirmed email error', () => {
    const error = AuthError.fromSupabase({ message: 'Email not confirmed' });
    expect(error.message).toBe('Please verify your email address before signing in.');
  });

  it('translates duplicate user registration error', () => {
    const error = AuthError.fromSupabase({ message: 'User already registered' });
    expect(error.message).toBe('An account with this email address already exists.');
  });

  it('translates session expiration error', () => {
    const error = AuthError.fromSupabase({ message: 'JWT expired' });
    expect(error.message).toBe('Your session has expired. Please sign in again.');
  });
});

describe('Auth Validation Schemas', () => {
  it('validates correct login credentials', () => {
    const valid = { email: 'developer@elsesourav.com', password: 'SuperSecret123!' };
    const parsed = LoginSchema.safeParse(valid);
    expect(parsed.success).toBe(true);
  });

  it('rejects invalid email in login', () => {
    const invalid = { email: 'not-an-email', password: 'password123' };
    const parsed = LoginSchema.safeParse(invalid);
    expect(parsed.success).toBe(false);
  });

  it('validates signup with valid username and credentials', () => {
    const valid = {
      email: 'newuser@elsesourav.com',
      password: 'StrongPassword123',
      displayName: 'New Developer',
      username: 'developer_pro',
    };
    const parsed = SignUpSchema.safeParse(valid);
    expect(parsed.success).toBe(true);
  });

  it('rejects signup with reserved or invalid username', () => {
    const reserved = {
      email: 'newuser@elsesourav.com',
      password: 'StrongPassword123',
      displayName: 'New Developer',
      username: 'admin',
    };
    expect(SignUpSchema.safeParse(reserved).success).toBe(false);

    const invalidChars = {
      email: 'newuser@elsesourav.com',
      password: 'StrongPassword123',
      displayName: 'New Developer',
      username: 'user@name!',
    };
    expect(SignUpSchema.safeParse(invalidChars).success).toBe(false);
  });

  it('validates forgot password email payload', () => {
    const valid = { email: 'reset@elsesourav.com' };
    const parsed = ForgotPasswordSchema.safeParse(valid);
    expect(parsed.success).toBe(true);
  });
});

describe('Server Session Guards & Authorization', () => {
  it('rejects unauthenticated caller in requireAuth', async () => {
    const emptyCookieStore = {
      getAll: vi.fn().mockReturnValue([]),
    };

    await expect(
      requireAuth(emptyCookieStore, 'https://test.supabase.co', 'anon-key')
    ).rejects.toThrowError(AppError);
  });

  it('rejects caller in requireRole when user is not authenticated', async () => {
    const emptyCookieStore = {
      getAll: vi.fn().mockReturnValue([]),
    };

    await expect(
      requireRole(emptyCookieStore, ['ADMIN'], 'https://test.supabase.co', 'anon-key')
    ).rejects.toThrowError(AppError);
  });
});
