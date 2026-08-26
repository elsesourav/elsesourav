/**
 * Firebase Client Configuration Types
 */

export interface FirebaseClientConfig {
  readonly apiKey: string;
  readonly authDomain: string;
  readonly projectId: string;
  readonly storageBucket?: string;
  readonly messagingSenderId?: string;
  readonly appId?: string;
}

export type FirebaseInitStatus = 'uninitialized' | 'initializing' | 'initialized' | 'error';
