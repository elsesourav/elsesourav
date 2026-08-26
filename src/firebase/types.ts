import type { FirebaseApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';

/**
 * Firebase Client Configuration (Public Web Credentials)
 */
export interface FirebaseClientConfig {
  readonly apiKey: string;
  readonly authDomain: string;
  readonly projectId: string;
  readonly appId: string;
  readonly messagingSenderId?: string;
  readonly measurementId?: string;
}

/**
 * Firebase Local Emulators Configuration
 */
export interface FirebaseEmulatorConfig {
  readonly enabled: boolean;
  readonly authUrl?: string;
  readonly firestoreHost?: string;
  readonly firestorePort?: number;
}

/**
 * Initialized Firebase Client Services Bundle
 */
export interface FirebaseServices {
  readonly app: FirebaseApp;
  readonly auth: Auth;
  readonly firestore: Firestore;
}

export type FirebaseInitStatus = 'uninitialized' | 'initializing' | 'initialized' | 'error';
