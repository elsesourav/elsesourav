import type { ID, Timestamp } from './common.types';
import type { User, UserRole } from './user.types';
import type { Result } from './result.types';
import type { AppError } from '@/lib/errors';

/**
 * Firebase Authentication Identity (Public representation of Firebase User)
 */
export interface AuthUser {
  readonly uid: ID;
  readonly email: string | null;
  readonly emailVerified: boolean;
  readonly displayName: string | null;
  readonly photoURL: string | null;
  readonly isAnonymous: boolean;
  readonly providerId: string;
  readonly createdAt?: Timestamp;
  readonly lastLoginAt?: Timestamp;
}

/**
 * Credentials for email/password sign-in
 */
export interface SignInCredentials {
  readonly email: string;
  readonly password: string;
}

/**
 * Credentials for email/password sign-up
 */
export interface SignUpCredentials {
  readonly email: string;
  readonly password: string;
  readonly displayName?: string;
}

/**
 * Password reset request payload
 */
export interface PasswordResetPayload {
  readonly email: string;
}

/**
 * Global Authentication State
 */
export interface AuthState {
  readonly authUser: AuthUser | null;
  readonly user: User | null;
  readonly role: UserRole;
  readonly isAuthenticated: boolean;
  readonly isAdmin: boolean;
  readonly isLoading: boolean;
  readonly error: AppError | null;
}

/**
 * Public Authentication Context Value with Actions
 */
export interface AuthContextValue extends AuthState {
  readonly signIn: (credentials: SignInCredentials) => Promise<Result<AuthUser, AppError>>;
  readonly signUp: (credentials: SignUpCredentials) => Promise<Result<AuthUser, AppError>>;
  readonly signInWithGoogle: () => Promise<Result<AuthUser, AppError>>;
  readonly signOut: () => Promise<Result<void, AppError>>;
  readonly sendPasswordReset: (payload: PasswordResetPayload) => Promise<Result<void, AppError>>;
  readonly sendVerificationEmail: () => Promise<Result<void, AppError>>;
  readonly changePassword: (
    currentPassword: string,
    newPassword: string
  ) => Promise<Result<void, AppError>>;
  readonly deleteAccount: (password?: string) => Promise<Result<void, AppError>>;
  readonly clearError: () => void;
}
