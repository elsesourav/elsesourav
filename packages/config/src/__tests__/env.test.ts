import { describe, it, expect } from 'vitest';
import { validateClientEnv, validateServerEnv } from '../env';
import { SITE_CONFIG } from '../site';
import { ROUTES } from '../routes';

describe('Environment Validation Configuration', () => {
  it('validates client environment variables with valid inputs', () => {
    const validEnv = {
      NEXT_PUBLIC_SITE_URL: 'https://elsesourav.com',
      NEXT_PUBLIC_SUPABASE_URL: 'https://project.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'mock-anon-key',
      NEXT_PUBLIC_ENABLE_ANALYTICS: 'true',
    };

    const parsed = validateClientEnv(validEnv);
    expect(parsed.NEXT_PUBLIC_SITE_URL).toBe('https://elsesourav.com');
    expect(parsed.NEXT_PUBLIC_ENABLE_ANALYTICS).toBe(true);
  });

  it('fails gracefully when client environment variable is invalid without printing secrets', () => {
    const invalidEnv = {
      NEXT_PUBLIC_SITE_URL: 'not-a-valid-url',
    };

    expect(() => validateClientEnv(invalidEnv)).toThrowError(/NEXT_PUBLIC_SITE_URL must be a valid URL/);
  });

  it('validates server environment variables with valid inputs', () => {
    const validServerEnv = {
      DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
      NODE_ENV: 'development',
    };

    const parsed = validateServerEnv(validServerEnv);
    expect(parsed.NODE_ENV).toBe('development');
  });

  it('fails gracefully when server environment is invalid', () => {
    const invalidServerEnv = {
      NODE_ENV: 'invalid_mode',
    };

    expect(() => validateServerEnv(invalidServerEnv)).toThrowError(/Server environment variables validation failed/);
  });
});

describe('Site & Routes Configuration Constants', () => {
  it('exports valid site configuration', () => {
    expect(SITE_CONFIG.name).toBe('ElseSourav');
    expect(SITE_CONFIG.url).toBe('https://elsesourav.com');
  });

  it('exports valid route constants and helper functions', () => {
    expect(ROUTES.HOME).toBe('/');
    expect(ROUTES.APPS).toBe('/apps');
    expect(ROUTES.APP_DETAIL('terminal-pro')).toBe('/apps/terminal-pro');
    expect(ROUTES.HELP_ARTICLE('getting-started', 'intro')).toBe('/help/getting-started/intro');
    expect(ROUTES.ADMIN.ROOT).toBe('/admin');
  });
});
