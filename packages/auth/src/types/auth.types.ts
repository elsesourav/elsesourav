import type { UserRole } from '@elsesourav/types';

export type AuthProvider = 'email' | 'google' | 'github';

export interface AuthenticatedUser {
  readonly id: string;
  readonly supabaseAuthId: string;
  readonly email: string;
  readonly displayName: string;
  readonly username?: string;
  readonly photoUrl?: string;
  readonly bio?: string;
  readonly role: UserRole;
  readonly isEmailVerified: boolean;
  readonly provider: AuthProvider;
  readonly createdAt: number;
}

export interface AuthSession {
  readonly accessToken: string;
  readonly refreshToken?: string;
  readonly expiresAt?: number;
  readonly user: AuthenticatedUser;
}

export interface AuthResult<T = AuthenticatedUser> {
  readonly success: boolean;
  readonly data?: T;
  readonly error?: string;
}

export interface OAuthSignInOptions {
  readonly provider: 'google' | 'github';
  readonly redirectTo?: string;
  readonly scopes?: string;
}
