import { describe, it, expect, vi } from 'vitest';
import { sanitizeRedirectUrl, requireRole, AuthError } from '@elsesourav/auth';
import { AppError } from '@elsesourav/types';

describe('Auth UX & Security Guard Tests', () => {
  it('protects against open redirect attacks across multiple candidate vectors', () => {
    // Malicious vectors
    expect(sanitizeRedirectUrl('https://evil-site.com/steal-token')).toBe('/');
    expect(sanitizeRedirectUrl('http://192.168.1.1/admin')).toBe('/');
    expect(sanitizeRedirectUrl('//evil-host.com/phishing')).toBe('/');
    expect(sanitizeRedirectUrl('javascript:alert(document.cookie)')).toBe('/');
    expect(sanitizeRedirectUrl('data:text/html,<script>alert(1)</script>')).toBe('/');

    // Safe valid internal routes
    expect(sanitizeRedirectUrl('/settings')).toBe('/settings');
    expect(sanitizeRedirectUrl('/admin/apps')).toBe('/admin/apps');
    expect(sanitizeRedirectUrl('/library?filter=favorites')).toBe('/library?filter=favorites');
  });

  it('rejects unauthorized role access in requireRole', async () => {
    const mockCookieStore = {
      getAll: vi.fn().mockReturnValue([]),
    };

    // Anonymous caller
    await expect(
      requireRole(mockCookieStore, ['ADMIN'], 'https://test.supabase.co', 'anon-key')
    ).rejects.toThrowError(AppError);
  });

  it('translates network or timeout failures into clean messages', () => {
    const error = AuthError.fromSupabase({ message: 'Failed to fetch' });
    expect(error.message).toBe('Authentication failed. Please check your credentials and try again.');
    expect(error.status).toBe(401);
  });
});
