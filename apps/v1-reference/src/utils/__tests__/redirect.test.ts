import { describe, it, expect } from 'vitest';
import { getSafeRedirectUrl } from '../redirect';
import { ROUTES } from '@/constants/routes';

describe('getSafeRedirectUrl Security Utility', () => {
  it('returns valid internal relative paths unchanged', () => {
    expect(getSafeRedirectUrl('/library')).toBe('/library');
    expect(getSafeRedirectUrl('/support/tickets')).toBe('/support/tickets');
    expect(getSafeRedirectUrl('/help/cli-tools/installing-cli')).toBe(
      '/help/cli-tools/installing-cli'
    );
    expect(getSafeRedirectUrl('/apps/terminal-pro?ref=featured')).toBe(
      '/apps/terminal-pro?ref=featured'
    );
  });

  it('falls back to default for null, undefined, or empty targets', () => {
    expect(getSafeRedirectUrl(null)).toBe(ROUTES.LIBRARY);
    expect(getSafeRedirectUrl(undefined)).toBe(ROUTES.LIBRARY);
    expect(getSafeRedirectUrl('')).toBe(ROUTES.LIBRARY);
    expect(getSafeRedirectUrl('   ')).toBe(ROUTES.LIBRARY);
  });

  it('blocks absolute URLs with http/https schemes', () => {
    expect(getSafeRedirectUrl('https://evil.com/phishing')).toBe(ROUTES.LIBRARY);
    expect(getSafeRedirectUrl('http://attacker.org')).toBe(ROUTES.LIBRARY);
  });

  it('blocks protocol-relative URLs (//evil.com)', () => {
    expect(getSafeRedirectUrl('//evil.com')).toBe(ROUTES.LIBRARY);
    expect(getSafeRedirectUrl('//evil.com/login')).toBe(ROUTES.LIBRARY);
  });

  it('blocks backslash bypass attempts (/\\evil.com or \\\\evil.com)', () => {
    expect(getSafeRedirectUrl('/\\evil.com')).toBe(ROUTES.LIBRARY);
    expect(getSafeRedirectUrl('\\\\evil.com')).toBe(ROUTES.LIBRARY);
    expect(getSafeRedirectUrl('/path\\evil')).toBe(ROUTES.LIBRARY);
  });

  it('blocks javascript: and data: URI schemes', () => {
    expect(getSafeRedirectUrl('javascript:alert(1)')).toBe(ROUTES.LIBRARY);
    expect(getSafeRedirectUrl('/path?ref=javascript:alert(1)')).toBe(ROUTES.LIBRARY);
    expect(getSafeRedirectUrl('data:text/html,<script>alert(1)</script>')).toBe(ROUTES.LIBRARY);
  });

  it('allows custom fallback path', () => {
    expect(getSafeRedirectUrl('https://evil.com', '/custom-home')).toBe('/custom-home');
  });
});
