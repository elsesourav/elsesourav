import {
  firebaseClientConfigSchema,
  firebaseEmulatorConfigSchema,
} from '@/schemas/firebase.schema';
import { ok, err, isOk, isErr } from '@/lib/result';
import { AppError } from '@/lib/errors';
import type { Result } from '@/types/result.types';
import type { FirebaseClientConfig, FirebaseEmulatorConfig } from './types';

/**
 * Extracts raw Firebase client configuration from an environment map (defaults to import.meta.env)
 */
export function extractRawFirebaseConfig(
  env: Record<string, string | undefined> = import.meta.env
): Record<string, string | undefined> {
  return {
    apiKey: env.VITE_FIREBASE_API_KEY,
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: env.VITE_FIREBASE_PROJECT_ID,
    appId: env.VITE_FIREBASE_APP_ID,
    messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || undefined,
    measurementId: env.VITE_FIREBASE_MEASUREMENT_ID || undefined,
  };
}

/**
 * Validates Firebase client configuration against the schema
 */
export function validateFirebaseConfig(
  env: Record<string, string | undefined> = import.meta.env
): Result<FirebaseClientConfig, AppError> {
  const rawConfig = extractRawFirebaseConfig(env);
  const parsed = firebaseClientConfigSchema.safeParse(rawConfig);

  if (!parsed.success) {
    const errorDetails = parsed.error.issues
      .map((issue) => `• ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');

    return err(
      AppError.configuration(
        `Firebase client configuration is invalid or missing required variables. Please check your .env file against .env.example:\n${errorDetails}`,
        { issues: parsed.error.issues }
      )
    );
  }

  return ok(parsed.data);
}

/**
 * Loads validated Firebase client configuration or throws a descriptive AppError
 */
export function getFirebaseConfig(
  env: Record<string, string | undefined> = import.meta.env
): FirebaseClientConfig {
  const validationResult = validateFirebaseConfig(env);

  if (isErr(validationResult)) {
    throw validationResult.error;
  }

  return validationResult.data;
}

/**
 * Loads Firebase local emulator settings from environment variables
 */
export function getEmulatorConfig(
  env: Record<string, string | undefined> = import.meta.env
): FirebaseEmulatorConfig {
  const isEnabled = env.VITE_USE_FIREBASE_EMULATORS === 'true';
  const port = env.VITE_FIRESTORE_EMULATOR_PORT
    ? parseInt(env.VITE_FIRESTORE_EMULATOR_PORT, 10)
    : 8080;

  const parsed = firebaseEmulatorConfigSchema.safeParse({
    enabled: isEnabled,
    authUrl: env.VITE_FIREBASE_AUTH_EMULATOR_URL,
    firestoreHost: env.VITE_FIRESTORE_EMULATOR_HOST,
    firestorePort: Number.isNaN(port) ? 8080 : port,
  });

  if (!parsed.success) {
    return { enabled: false };
  }

  return parsed.data;
}

/**
 * Non-throwing check to determine if valid Firebase credentials are provided
 */
export function isFirebaseConfigured(
  env: Record<string, string | undefined> = import.meta.env
): boolean {
  const result = validateFirebaseConfig(env);
  return isOk(result);
}
