import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, connectAuthEmulator, type Auth } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator, type Firestore } from 'firebase/firestore';
import { getFirebaseConfig, getEmulatorConfig } from './config';
import type { FirebaseClientConfig, FirebaseServices } from './types';

let cachedServices: FirebaseServices | null = null;
let emulatorsConnected = false;

/**
 * Initializes Firebase Web SDK services (App, Auth, Firestore).
 * Safe against duplicate initialization during Vite HMR.
 */
export function initFirebase(customConfig?: FirebaseClientConfig): FirebaseServices {
  if (cachedServices) {
    return cachedServices;
  }

  const existingApps = getApps();
  let app: FirebaseApp;

  if (existingApps.length > 0) {
    app = getApp();
  } else {
    const config = customConfig || getFirebaseConfig();
    app = initializeApp(config);
  }

  const auth = getAuth(app);
  const firestore = getFirestore(app);

  // Connect local development emulators if enabled in environment
  const emulatorConfig = getEmulatorConfig();
  if (emulatorConfig.enabled && !emulatorsConnected) {
    try {
      if (emulatorConfig.authUrl) {
        connectAuthEmulator(auth, emulatorConfig.authUrl, { disableWarnings: true });
      }
      if (emulatorConfig.firestoreHost && emulatorConfig.firestorePort) {
        connectFirestoreEmulator(
          firestore,
          emulatorConfig.firestoreHost,
          emulatorConfig.firestorePort
        );
      }
      emulatorsConnected = true;
    } catch {
      // Ignore re-connection errors during fast reload
    }
  }

  cachedServices = { app, auth, firestore };
  return cachedServices;
}

/**
 * Retrieves the initialized Firebase services bundle.
 * Initializes services automatically if not already created.
 */
export function getFirebaseServices(): FirebaseServices {
  if (!cachedServices) {
    return initFirebase();
  }
  return cachedServices;
}

/**
 * Retrieves the initialized FirebaseApp instance.
 */
export function getFirebaseApp(): FirebaseApp {
  return getFirebaseServices().app;
}

/**
 * Retrieves the initialized FirebaseAuth instance.
 */
export function getFirebaseAuth(): Auth {
  return getFirebaseServices().auth;
}

/**
 * Retrieves the initialized Firestore instance.
 */
export function getFirebaseFirestore(): Firestore {
  return getFirebaseServices().firestore;
}

/**
 * Resets cached services (primarily for testing and mock reset)
 */
export function resetFirebaseServicesForTesting(): void {
  cachedServices = null;
  emulatorsConnected = false;
}
