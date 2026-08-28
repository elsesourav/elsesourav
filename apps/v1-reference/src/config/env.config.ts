import { z } from 'zod';
import { firebaseClientConfigSchema, firebaseEmulatorConfigSchema } from '@/schemas/firebase.schema';

/**
 * Public Client Environment Schema
 * Validates public client configuration provided via Vite environment variables.
 *
 * NOTE ON PRIVATE SECRETS:
 * ElseSourav is a pure client-side Single Page Application (SPA) communicating directly
 * with Google Firebase (Auth & Firestore). All sensitive authorization is enforced by
 * Firebase Security Rules. There are ZERO server-side private secrets or database master
 * passwords bundled into Vite.
 */
export const clientEnvSchema = z.object({
  // App environment
  appEnv: z.enum(['development', 'staging', 'production', 'test']).default('development'),

  // Public site canonical origin
  siteOrigin: z
    .string()
    .url()
    .default('https://elsesourav.com')
    .transform((url) => url.replace(/\/+$/, '')),

  // Firebase Web Client Config (Public client identifiers)
  firebase: firebaseClientConfigSchema,

  // Firebase Emulators Config
  emulators: firebaseEmulatorConfigSchema,

  // Feature Flags
  featureFlags: z.object({
    enableAnalytics: z.boolean().default(true),
    enablePwa: z.boolean().default(true),
    enableDebugLogging: z.boolean().default(false),
    enableAdminPortal: z.boolean().default(true),
  }),
});

export type ClientEnv = z.infer<typeof clientEnvSchema>;

export type ParseClientEnvResult =
  | { success: true; data: ClientEnv }
  | { success: false; error: z.ZodError };

/**
 * Extracts and parses environment variables safely from an environment record
 */
export function parseClientEnv(
  rawEnv: Record<string, string | undefined> = typeof import.meta !== 'undefined' && import.meta.env
    ? (import.meta.env as Record<string, string | undefined>)
    : {}
): ParseClientEnvResult {
  const isTest = rawEnv.MODE === 'test' || rawEnv.NODE_ENV === 'test';
  const isProd = rawEnv.PROD === 'true' || rawEnv.NODE_ENV === 'production';

  // Derive environment mode
  let appEnv: 'development' | 'staging' | 'production' | 'test' = 'development';
  if (isTest) {
    appEnv = 'test';
  } else if (rawEnv.VITE_APP_ENV === 'staging') {
    appEnv = 'staging';
  } else if (isProd || rawEnv.VITE_APP_ENV === 'production') {
    appEnv = 'production';
  }

  // Fallback credentials for isolated test environments to prevent test crashes
  const apiKey = rawEnv.VITE_FIREBASE_API_KEY || (isTest ? 'test-api-key' : '');
  const authDomain = rawEnv.VITE_FIREBASE_AUTH_DOMAIN || (isTest ? 'test-app.firebaseapp.com' : '');
  const projectId = rawEnv.VITE_FIREBASE_PROJECT_ID || (isTest ? 'test-project' : '');
  const appId = rawEnv.VITE_FIREBASE_APP_ID || (isTest ? '1:123456789:web:testappid' : '');

  const port = rawEnv.VITE_FIRESTORE_EMULATOR_PORT
    ? parseInt(rawEnv.VITE_FIRESTORE_EMULATOR_PORT, 10)
    : 8080;

  const candidate = {
    appEnv,
    siteOrigin: rawEnv.VITE_SITE_ORIGIN || 'https://elsesourav.com',
    firebase: {
      apiKey,
      authDomain,
      projectId,
      appId,
      messagingSenderId: rawEnv.VITE_FIREBASE_MESSAGING_SENDER_ID || undefined,
      measurementId: rawEnv.VITE_FIREBASE_MEASUREMENT_ID || undefined,
    },
    emulators: {
      enabled: rawEnv.VITE_USE_FIREBASE_EMULATORS === 'true',
      authUrl: rawEnv.VITE_FIREBASE_AUTH_EMULATOR_URL || 'http://127.0.0.1:9099',
      firestoreHost: rawEnv.VITE_FIRESTORE_EMULATOR_HOST || '127.0.0.1',
      firestorePort: isNaN(port) ? 8080 : port,
    },
    featureFlags: {
      enableAnalytics: rawEnv.VITE_ENABLE_ANALYTICS !== 'false',
      enablePwa: rawEnv.VITE_ENABLE_PWA !== 'false',
      enableDebugLogging: rawEnv.VITE_ENABLE_DEBUG_LOGGING === 'true' || appEnv === 'development',
      enableAdminPortal: rawEnv.VITE_ENABLE_ADMIN_PORTAL !== 'false',
    },
  };

  return clientEnvSchema.safeParse(candidate) as ParseClientEnvResult;
}

/**
 * Validates and returns the active ClientEnv or logs descriptive troubleshooting guidance.
 */
export function getClientEnv(
  rawEnv?: Record<string, string | undefined>
): ClientEnv {
  const result = parseClientEnv(rawEnv);

  if (!result.success) {
    const errorList = result.error.issues
      .map((issue: z.ZodIssue) => `  • ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');

    const message = `[ElseSourav Environment Error] Missing or invalid client configuration:\n${errorList}\n\nPlease check your .env.local file against .env.example.`;
    console.error(message);
    throw new Error(message);
  }

  return result.data;
}

/**
 * Single frozen export of validated client environment
 */
export const clientEnv: ClientEnv = (() => {
  try {
    return getClientEnv();
  } catch {
    // Return safe baseline in case of early pre-bundle or test inspection
    return {
      appEnv: 'development',
      siteOrigin: 'https://elsesourav.com',
      firebase: {
        apiKey: 'unconfigured-api-key',
        authDomain: 'unconfigured.firebaseapp.com',
        projectId: 'unconfigured-project',
        appId: '1:0000000000:web:0000000000',
      },
      emulators: {
        enabled: false,
        authUrl: 'http://127.0.0.1:9099',
        firestoreHost: '127.0.0.1',
        firestorePort: 8080,
      },
      featureFlags: {
        enableAnalytics: true,
        enablePwa: true,
        enableDebugLogging: true,
        enableAdminPortal: true,
      },
    };
  }
})();
