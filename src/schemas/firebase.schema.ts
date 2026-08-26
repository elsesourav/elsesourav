import { z } from 'zod';

/**
 * Schema for validating Firebase client Web SDK configuration
 */
export const firebaseClientConfigSchema = z.object({
  apiKey: z
    .string()
    .min(1, 'Firebase API Key (VITE_FIREBASE_API_KEY) is required and cannot be empty'),
  authDomain: z
    .string()
    .min(1, 'Firebase Auth Domain (VITE_FIREBASE_AUTH_DOMAIN) is required and cannot be empty'),
  projectId: z
    .string()
    .min(1, 'Firebase Project ID (VITE_FIREBASE_PROJECT_ID) is required and cannot be empty'),
  appId: z
    .string()
    .min(1, 'Firebase App ID (VITE_FIREBASE_APP_ID) is required and cannot be empty'),
  messagingSenderId: z.string().optional(),
  measurementId: z.string().optional(),
});

export type ValidatedFirebaseClientConfig = z.infer<typeof firebaseClientConfigSchema>;

/**
 * Schema for validating Firebase local emulators configuration
 */
export const firebaseEmulatorConfigSchema = z.object({
  enabled: z.boolean().default(false),
  authUrl: z.string().optional().default('http://127.0.0.1:9099'),
  firestoreHost: z.string().optional().default('127.0.0.1'),
  firestorePort: z.number().int().positive().optional().default(8080),
});

export type ValidatedFirebaseEmulatorConfig = z.infer<typeof firebaseEmulatorConfigSchema>;
