import { describe, it, expect } from 'vitest';
import { parseClientEnv, getClientEnv, clientEnvSchema } from '../env.config';

describe('Clean Production Configuration System (Prompt 68)', () => {
  const validMockEnv = {
    VITE_APP_ENV: 'production',
    VITE_SITE_ORIGIN: 'https://elsesourav.com',
    VITE_FIREBASE_API_KEY: 'test-api-key-12345',
    VITE_FIREBASE_AUTH_DOMAIN: 'elsesourav.firebaseapp.com',
    VITE_FIREBASE_PROJECT_ID: 'elsesourav-prod',
    VITE_FIREBASE_APP_ID: '1:123456789012:web:abcdef123456',
    VITE_FIREBASE_MESSAGING_SENDER_ID: '123456789012',
    VITE_FIREBASE_MEASUREMENT_ID: 'G-TEST1234',
    VITE_USE_FIREBASE_EMULATORS: 'false',
    VITE_ENABLE_ANALYTICS: 'true',
    VITE_ENABLE_PWA: 'true',
    VITE_ENABLE_DEBUG_LOGGING: 'false',
    VITE_ENABLE_ADMIN_PORTAL: 'true',
  };

  describe('parseClientEnv & Schema Validation', () => {
    it('successfully parses valid production client environment configuration', () => {
      const parsed = parseClientEnv(validMockEnv);
      expect(parsed.success).toBe(true);

      if (parsed.success) {
        expect(parsed.data.appEnv).toBe('production');
        expect(parsed.data.siteOrigin).toBe('https://elsesourav.com');
        expect(parsed.data.firebase.apiKey).toBe('test-api-key-12345');
        expect(parsed.data.firebase.projectId).toBe('elsesourav-prod');
        expect(parsed.data.featureFlags.enableAnalytics).toBe(true);
        expect(parsed.data.featureFlags.enableDebugLogging).toBe(false);
      }
    });

    it('strips trailing slashes from siteOrigin canonical URL', () => {
      const parsed = parseClientEnv({
        ...validMockEnv,
        VITE_SITE_ORIGIN: 'https://elsesourav.com///',
      });
      expect(parsed.success).toBe(true);
      if (parsed.success) {
        expect(parsed.data.siteOrigin).toBe('https://elsesourav.com');
      }
    });

    it('parses Firebase emulator configuration correctly when enabled', () => {
      const parsed = parseClientEnv({
        ...validMockEnv,
        VITE_USE_FIREBASE_EMULATORS: 'true',
        VITE_FIREBASE_AUTH_EMULATOR_URL: 'http://127.0.0.1:9099',
        VITE_FIRESTORE_EMULATOR_HOST: '127.0.0.1',
        VITE_FIRESTORE_EMULATOR_PORT: '8080',
      });
      expect(parsed.success).toBe(true);
      if (parsed.success) {
        expect(parsed.data.emulators.enabled).toBe(true);
        expect(parsed.data.emulators.firestorePort).toBe(8080);
      }
    });

    it('fails clearly when required public Firebase credentials are empty in non-test mode', () => {
      const badEnv = {
        ...validMockEnv,
        VITE_FIREBASE_API_KEY: '',
        VITE_APP_ENV: 'production',
        PROD: 'true',
      };
      const parsed = parseClientEnv(badEnv);
      expect(parsed.success).toBe(false);
    });

    it('throws informative diagnostic error when getClientEnv fails on invalid env', () => {
      const invalidEnv = {
        VITE_APP_ENV: 'production',
        PROD: 'true',
        VITE_FIREBASE_API_KEY: '',
      };

      expect(() => getClientEnv(invalidEnv)).toThrowError(
        /\[ElseSourav Environment Error\]/
      );
    });

    it('provides safe isolated fallbacks in test environment mode without leaking credentials', () => {
      const testEnv = {
        MODE: 'test',
      };
      const parsed = parseClientEnv(testEnv);
      expect(parsed.success).toBe(true);
      if (parsed.success) {
        expect(parsed.data.appEnv).toBe('test');
        expect(parsed.data.firebase.apiKey).toBe('test-api-key');
      }
    });
  });

  describe('clientEnvSchema Invariants', () => {
    it('validates feature flags defaults when omitted', () => {
      const minimalValid = {
        appEnv: 'development' as const,
        siteOrigin: 'https://elsesourav.com',
        firebase: {
          apiKey: 'key-123',
          authDomain: 'app.firebaseapp.com',
          projectId: 'app-id',
          appId: '1:123:web:456',
        },
        emulators: {
          enabled: false,
          authUrl: 'http://127.0.0.1:9099',
          firestoreHost: '127.0.0.1',
          firestorePort: 8080,
        },
        featureFlags: {},
      };

      const result = clientEnvSchema.safeParse(minimalValid);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.featureFlags.enableAnalytics).toBe(true);
        expect(result.data.featureFlags.enablePwa).toBe(true);
      }
    });
  });
});
