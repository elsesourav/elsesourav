import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  type User as FirebaseUser,
  type Auth,
} from 'firebase/auth';
import { getFirebaseAuth } from '@/firebase';
import { ok, err } from '@/lib/result';
import { AppError } from '@/lib/errors';
import { mapFirebaseAuthError } from '@/lib/auth-errors';
import type { Result } from '@/types/result.types';
import type {
  AuthUser,
  SignInCredentials,
  SignUpCredentials,
  PasswordResetPayload,
} from '@/types/auth.types';
import type { User, UserRole } from '@/types/user.types';

/**
 * Transforms a raw FirebaseUser into our strongly-typed domain AuthUser model
 */
export function mapFirebaseUser(user: FirebaseUser | null): AuthUser | null {
  if (!user) return null;

  return {
    uid: user.uid,
    email: user.email,
    emailVerified: user.emailVerified,
    displayName: user.displayName,
    photoURL: user.photoURL,
    isAnonymous: user.isAnonymous,
    providerId: user.providerData[0]?.providerId || 'password',
    createdAt: user.metadata.creationTime
      ? new Date(user.metadata.creationTime).getTime()
      : Date.now(),
    lastLoginAt: user.metadata.lastSignInTime
      ? new Date(user.metadata.lastSignInTime).getTime()
      : Date.now(),
  };
}

/**
 * Derives a baseline application user profile from AuthUser identity
 * (Used prior to Firestore profile sync in later phases)
 */
export function deriveUserProfile(authUser: AuthUser, explicitRole?: UserRole): User {
  const role: UserRole = explicitRole || 'user';

  return {
    id: authUser.uid,
    email: authUser.email || '',
    displayName: authUser.displayName || authUser.email?.split('@')[0] || 'Developer',
    photoUrl: authUser.photoURL || undefined,
    role,
    status: 'active',
    preferences: {
      theme: 'system',
      emailNotifications: true,
      reduceMotion: false,
      compactView: false,
    },
    lastLoginAt: authUser.lastLoginAt,
    createdAt: authUser.createdAt || Date.now(),
    updatedAt: Date.now(),
  };
}

/**
 * Authentication Service Interface
 */
export interface IAuthService {
  signIn(credentials: SignInCredentials): Promise<Result<AuthUser, AppError>>;
  signUp(credentials: SignUpCredentials): Promise<Result<AuthUser, AppError>>;
  signInWithGoogle(): Promise<Result<AuthUser, AppError>>;
  signOut(): Promise<Result<void, AppError>>;
  sendPasswordReset(payload: PasswordResetPayload): Promise<Result<void, AppError>>;
  sendVerificationEmail(): Promise<Result<void, AppError>>;
  getCurrentUser(): AuthUser | null;
  onAuthStateChanged(callback: (user: AuthUser | null) => void): () => void;
}

/**
 * Production Firebase Authentication Service Implementation
 */
export class FirebaseAuthService implements IAuthService {
  private readonly getAuthInstance: () => Auth;

  constructor(authAccessor: () => Auth = getFirebaseAuth) {
    this.getAuthInstance = authAccessor;
  }

  private get auth(): Auth {
    return this.getAuthInstance();
  }

  public async signIn(credentials: SignInCredentials): Promise<Result<AuthUser, AppError>> {
    try {
      const userCredential = await signInWithEmailAndPassword(
        this.auth,
        credentials.email,
        credentials.password
      );
      const mapped = mapFirebaseUser(userCredential.user);
      if (!mapped) {
        return err(AppError.internal('Failed to parse authenticated user profile.'));
      }
      return ok(mapped);
    } catch (error) {
      return err(mapFirebaseAuthError(error));
    }
  }

  public async signUp(credentials: SignUpCredentials): Promise<Result<AuthUser, AppError>> {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        this.auth,
        credentials.email,
        credentials.password
      );

      if (credentials.displayName && userCredential.user) {
        await updateProfile(userCredential.user, { displayName: credentials.displayName });
      }

      const mapped = mapFirebaseUser(userCredential.user);
      if (!mapped) {
        return err(AppError.internal('Failed to parse signed-up user profile.'));
      }
      return ok(mapped);
    } catch (error) {
      return err(mapFirebaseAuthError(error));
    }
  }

  public async signInWithGoogle(): Promise<Result<AuthUser, AppError>> {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const userCredential = await signInWithPopup(this.auth, provider);
      const mapped = mapFirebaseUser(userCredential.user);
      if (!mapped) {
        return err(AppError.internal('Failed to parse Google authenticated user profile.'));
      }
      return ok(mapped);
    } catch (error) {
      return err(mapFirebaseAuthError(error));
    }
  }

  public async signOut(): Promise<Result<void, AppError>> {
    try {
      await firebaseSignOut(this.auth);
      return ok(undefined);
    } catch (error) {
      return err(mapFirebaseAuthError(error));
    }
  }

  public async sendPasswordReset(payload: PasswordResetPayload): Promise<Result<void, AppError>> {
    try {
      await sendPasswordResetEmail(this.auth, payload.email);
      return ok(undefined);
    } catch (error) {
      return err(mapFirebaseAuthError(error));
    }
  }

  public async sendVerificationEmail(): Promise<Result<void, AppError>> {
    try {
      const currentUser = this.auth.currentUser;
      if (!currentUser) {
        return err(
          AppError.unauthorized('No authenticated user session found to send verification.')
        );
      }
      await sendEmailVerification(currentUser);
      return ok(undefined);
    } catch (error) {
      return err(mapFirebaseAuthError(error));
    }
  }

  public getCurrentUser(): AuthUser | null {
    return mapFirebaseUser(this.auth.currentUser);
  }

  public onAuthStateChanged(callback: (user: AuthUser | null) => void): () => void {
    return firebaseOnAuthStateChanged(this.auth, (firebaseUser) => {
      callback(mapFirebaseUser(firebaseUser));
    });
  }
}

/**
 * Singleton instance of FirebaseAuthService
 */
export const authService = new FirebaseAuthService();
