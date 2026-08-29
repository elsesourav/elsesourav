import { describe, it, expect } from 'vitest';
import {
  validateClientEnv,
  validateServerEnv,
  initializeEnvironment,
  sanitizeEnvForDisplay,
  SITE_CONFIG,
  ROUTES,
} from '../index';

describe('Environment Validation Configuration', () => {
  it('validates client environment variables with valid inputs', () => {
    const validEnv = {
      NEXT_PUBLIC_SITE_URL: 'https://elsesourav.com',
      NEXT_PUBLIC_SUPABASE_URL: 'https://project.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'mock-anon-key',
      NEXT_PUBLIC_ENABLE_ANALYTICS: 'true',
      NEXT_PUBLIC_ENABLE_ADMIN_PORTAL: 'true',
    };

    const parsed = validateClientEnv(validEnv);
    expect(parsed.NEXT_PUBLIC_SITE_URL).toBe('https://elsesourav.com');
    expect(parsed.NEXT_PUBLIC_ENABLE_ANALYTICS).toBe(true);
    expect(parsed.NEXT_PUBLIC_ENABLE_ADMIN_PORTAL).toBe(true);
  });

  it('fails gracefully when client environment variable has invalid URL', () => {
    const invalidEnv = {
      NEXT_PUBLIC_SITE_URL: 'not-a-valid-url',
    };

    expect(() => validateClientEnv(invalidEnv)).toThrowError(/NEXT_PUBLIC_SITE_URL must be a valid absolute URL/);
  });

  it('validates server environment variables with valid inputs', () => {
    const validServerEnv = {
      DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
      DIRECT_URL: 'postgresql://user:pass@localhost:5432/db',
      SUPABASE_SERVICE_ROLE_KEY: 'mock-service-role-key',
      NODE_ENV: 'production',
    };

    const parsed = validateServerEnv(validServerEnv);
    expect(parsed.NODE_ENV).toBe('production');
    expect(parsed.DATABASE_URL).toBe('postgresql://user:pass@localhost:5432/db');
  });

  it('fails gracefully when server environment has invalid NODE_ENV', () => {
    const invalidServerEnv = {
      NODE_ENV: 'invalid_mode',
    };

    expect(() => validateServerEnv(invalidServerEnv)).toThrowError(/Invalid server environment configuration/);
  });

  it('bootstraps application environment flags accurately', () => {
    const env = initializeEnvironment(
      {
        NODE_ENV: 'test',
        NEXT_PUBLIC_SITE_URL: 'https://elsesourav.com',
      },
      true
    );

    expect(env.isTest).toBe(true);
    expect(env.isProduction).toBe(false);
    expect(env.isDevelopment).toBe(false);
    expect(env.client.NEXT_PUBLIC_SITE_URL).toBe('https://elsesourav.com');
  });

  it('redacts sensitive credentials in display logs', () => {
    const raw = {
      DATABASE_URL: 'postgresql://postgres:secretpassword@localhost:5432/db',
      SUPABASE_SERVICE_ROLE_KEY: 'ey1234567890supersecret',
      CLOUDINARY_API_SECRET: 'mysecret',
      NEXT_PUBLIC_SITE_URL: 'https://elsesourav.com',
      JWT_TOKEN: 'header.payload.signature',
      ADMIN_PASSWORD: 'SuperSecretPassword123!',
    };

    const sanitized = sanitizeEnvForDisplay(raw);
    expect(sanitized.DATABASE_URL).toBe('[REDACTED]');
    expect(sanitized.SUPABASE_SERVICE_ROLE_KEY).toBe('[REDACTED]');
    expect(sanitized.CLOUDINARY_API_SECRET).toBe('[REDACTED]');
    expect(sanitized.JWT_TOKEN).toBe('[REDACTED]');
    expect(sanitized.ADMIN_PASSWORD).toBe('[REDACTED]');
    expect(sanitized.NEXT_PUBLIC_SITE_URL).toBe('https://elsesourav.com');
  });

  it('guarantees client environment schema does not accept or leak server secrets', () => {
    const clientEnv = validateClientEnv({
      NEXT_PUBLIC_SITE_URL: 'https://elsesourav.com',
      DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
      SUPABASE_SERVICE_ROLE_KEY: 'secret-key',
    });

    // ClientEnv type and object must not contain server secret properties
    expect((clientEnv as unknown as Record<string, unknown>).DATABASE_URL).toBeUndefined();
    expect((clientEnv as unknown as Record<string, unknown>).SUPABASE_SERVICE_ROLE_KEY).toBeUndefined();
    expect(clientEnv.NEXT_PUBLIC_SITE_URL).toBe('https://elsesourav.com');
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
    expect(ROUTES.ADMIN.MEDIA).toBe('/admin/media');
    expect(ROUTES.ADMIN.USERS).toBe('/admin/users');
    expect(ROUTES.ADMIN.AUDIT).toBe('/admin/audit');
  });
});
