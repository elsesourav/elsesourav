import { describe, it, expect, beforeEach, vi } from 'vitest';
import { isOk, isErr } from '@/lib/result';
import {
  validateFirebaseConfig,
  getFirebaseConfig,
  getEmulatorConfig,
  isFirebaseConfigured,
} from '../config';
import {
  initFirebase,
  getFirebaseServices,
  getFirebaseApp,
  getFirebaseAuth,
  getFirebaseFirestore,
  resetFirebaseServicesForTesting,
} from '../client';
import type { FirebaseClientConfig } from '../types';

const mockValidEnv: Record<string, string> = {
  VITE_FIREBASE_API_KEY: 'AIzaSyFakeApiKey123456789',
  VITE_FIREBASE_AUTH_DOMAIN: 'elsesourav-dev.firebaseapp.com',
  VITE_FIREBASE_PROJECT_ID: 'elsesourav-dev',
  VITE_FIREBASE_APP_ID: '1:123456789012:web:abcdef1234567890abcdef',
  VITE_FIREBASE_MESSAGING_SENDER_ID: '123456789012',
  VITE_FIREBASE_MEASUREMENT_ID: 'G-XXXXXXXXXX',
};

const mockValidConfig: FirebaseClientConfig = {
  apiKey: 'AIzaSyFakeApiKey123456789',
  authDomain: 'elsesourav-dev.firebaseapp.com',
  projectId: 'elsesourav-dev',
  appId: '1:123456789012:web:abcdef1234567890abcdef',
  messagingSenderId: '123456789012',
  measurementId: 'G-XXXXXXXXXX',
};

describe('Firebase Configuration & Schema Validation', () => {
  it('validates a complete and correct environment configuration', () => {
    const result = validateFirebaseConfig(mockValidEnv);
    expect(isOk(result)).toBe(true);

    if (isOk(result)) {
      expect(result.data.apiKey).toBe('AIzaSyFakeApiKey123456789');
      expect(result.data.projectId).toBe('elsesourav-dev');
      expect(result.data.appId).toBe('1:123456789012:web:abcdef1234567890abcdef');
    }
  });

  it('fails with a descriptive error when required variables are missing', () => {
    const invalidEnv: Record<string, string> = {
      VITE_FIREBASE_API_KEY: '',
      // missing auth domain, project ID, app ID
    };

    const result = validateFirebaseConfig(invalidEnv);
    expect(isErr(result)).toBe(true);

    if (isErr(result)) {
      expect(result.error.code).toBe('CONFIGURATION_ERROR');
      expect(result.error.message).toContain('Firebase client configuration is invalid');
      expect(result.error.message).toContain('apiKey');
    }
  });

  it('throws descriptive AppError on getFirebaseConfig when invalid', () => {
    const emptyEnv = {};
    expect(() => getFirebaseConfig(emptyEnv)).toThrowError(
      /Firebase client configuration is invalid/
    );
  });

  it('returns true for isFirebaseConfigured only when valid config is present', () => {
    expect(isFirebaseConfigured(mockValidEnv)).toBe(true);
    expect(isFirebaseConfigured({})).toBe(false);
  });

  it('correctly parses emulator configurations', () => {
    const emulatorEnv = {
      VITE_USE_FIREBASE_EMULATORS: 'true',
      VITE_FIREBASE_AUTH_EMULATOR_URL: 'http://localhost:9099',
      VITE_FIRESTORE_EMULATOR_HOST: 'localhost',
      VITE_FIRESTORE_EMULATOR_PORT: '8080',
    };

    const emulators = getEmulatorConfig(emulatorEnv);
    expect(emulators.enabled).toBe(true);
    expect(emulators.authUrl).toBe('http://localhost:9099');
    expect(emulators.firestoreHost).toBe('localhost');
    expect(emulators.firestorePort).toBe(8080);
  });

  it('defaults emulators to disabled when not set', () => {
    const emulators = getEmulatorConfig({});
    expect(emulators.enabled).toBe(false);
  });
});

describe('Firebase Client Initialization & Singleton', () => {
  beforeEach(() => {
    resetFirebaseServicesForTesting();
    vi.restoreAllMocks();
  });

  it('initializes Firebase client singleton and returns app, auth, and firestore', () => {
    const services = initFirebase(mockValidConfig);

    expect(services).toBeDefined();
    expect(services.app).toBeDefined();
    expect(services.auth).toBeDefined();
    expect(services.firestore).toBeDefined();
    expect(services.app.options.projectId).toBe('elsesourav-dev');
  });

  it('returns cached singleton instances across multiple getFirebaseServices calls', () => {
    const firstServices = initFirebase(mockValidConfig);
    const secondServices = getFirebaseServices();

    expect(firstServices).toBe(secondServices);
    expect(getFirebaseApp()).toBe(firstServices.app);
    expect(getFirebaseAuth()).toBe(firstServices.auth);
    expect(getFirebaseFirestore()).toBe(firstServices.firestore);
  });
});
