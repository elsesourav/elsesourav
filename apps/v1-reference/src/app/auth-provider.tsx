import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AuthContext } from './auth-context';
import { authService, deriveUserProfile } from '@/services/auth.service';
import { userService } from '@/services/user.service';
import { isOk, isErr } from '@/lib/result';
import { isFirebaseConfigured } from '@/firebase';
import type {
  AuthUser,
  SignInCredentials,
  SignUpCredentials,
  PasswordResetPayload,
  AuthContextValue,
} from '@/types/auth.types';
import type { User, UserRole } from '@/types/user.types';
import type { AppError } from '@/lib/errors';
import type { Result } from '@/types/result.types';

export interface AuthProviderProps {
  readonly children: React.ReactNode;
  readonly defaultRole?: UserRole;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children, defaultRole }) => {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<AppError | null>(null);

  useEffect(() => {
    if (!isFirebaseConfigured()) {
      setIsLoading(false);
      return undefined;
    }

    try {
      const unsubscribe = authService.onAuthStateChanged((nextAuthUser) => {
        setAuthUser(nextAuthUser);
        if (nextAuthUser) {
          setUser(deriveUserProfile(nextAuthUser, defaultRole));
          setIsLoading(false);

          // Asynchronously ensure and hydrate the full Firestore profile
          userService
            .ensureUserProfile(nextAuthUser)
            .then((profileResult) => {
              if (profileResult.success) {
                setUser(profileResult.data);
              }
            })
            .catch(() => {
              // Retain derived fallback
            });
        } else {
          setUser(null);
          setIsLoading(false);
        }
      });

      return () => {
        unsubscribe();
      };
    } catch {
      setIsLoading(false);
      return undefined;
    }
  }, [defaultRole]);

  const clearError = useCallback((): void => {
    setError(null);
  }, []);

  const signIn = useCallback(
    async (credentials: SignInCredentials): Promise<Result<AuthUser, AppError>> => {
      setIsLoading(true);
      setError(null);
      const result = await authService.signIn(credentials);

      if (isOk(result)) {
        setAuthUser(result.data);
        setUser(deriveUserProfile(result.data, defaultRole));
        try {
          const profileResult = await userService.ensureUserProfile(result.data);
          if (profileResult.success) {
            setUser(profileResult.data);
          }
        } catch {
          // Keep derived profile
        }
      } else if (isErr(result)) {
        setError(result.error);
      }

      setIsLoading(false);
      return result;
    },
    [defaultRole]
  );

  const signUp = useCallback(
    async (credentials: SignUpCredentials): Promise<Result<AuthUser, AppError>> => {
      setIsLoading(true);
      setError(null);
      const result = await authService.signUp(credentials);

      if (isOk(result)) {
        setAuthUser(result.data);
        setUser(deriveUserProfile(result.data, defaultRole));
        try {
          const profileResult = await userService.ensureUserProfile(result.data);
          if (profileResult.success) {
            setUser(profileResult.data);
          }
        } catch {
          // Keep derived profile
        }
      } else if (isErr(result)) {
        setError(result.error);
      }

      setIsLoading(false);
      return result;
    },
    [defaultRole]
  );

  const signInWithGoogle = useCallback(async (): Promise<Result<AuthUser, AppError>> => {
    setIsLoading(true);
    setError(null);
    const result = await authService.signInWithGoogle();

    if (isOk(result)) {
      setAuthUser(result.data);
      setUser(deriveUserProfile(result.data, defaultRole));
      try {
        const profileResult = await userService.ensureUserProfile(result.data);
        if (profileResult.success) {
          setUser(profileResult.data);
        }
      } catch {
        // Keep derived profile
      }
    } else if (isErr(result)) {
      setError(result.error);
    }

    setIsLoading(false);
    return result;
  }, [defaultRole]);

  const signOut = useCallback(async (): Promise<Result<void, AppError>> => {
    setIsLoading(true);
    setError(null);
    const result = await authService.signOut();

    if (isOk(result)) {
      setAuthUser(null);
      setUser(null);
    } else if (isErr(result)) {
      setError(result.error);
    }

    setIsLoading(false);
    return result;
  }, []);

  const sendPasswordReset = useCallback(
    async (payload: PasswordResetPayload): Promise<Result<void, AppError>> => {
      setError(null);
      const result = await authService.sendPasswordReset(payload);
      if (isErr(result)) {
        setError(result.error);
      }
      return result;
    },
    []
  );

  const sendVerificationEmail = useCallback(async (): Promise<Result<void, AppError>> => {
    setError(null);
    const result = await authService.sendVerificationEmail();
    if (isErr(result)) {
      setError(result.error);
    }
    return result;
  }, []);

  const changePassword = useCallback(
    async (currentPassword: string, newPassword: string): Promise<Result<void, AppError>> => {
      setError(null);
      const result = await authService.changePassword(currentPassword, newPassword);
      if (isErr(result)) {
        setError(result.error);
      }
      return result;
    },
    []
  );

  const deleteAccount = useCallback(async (password?: string): Promise<Result<void, AppError>> => {
    setError(null);
    const result = await authService.deleteAccount(password);
    if (isOk(result)) {
      setAuthUser(null);
      setUser(null);
    } else if (isErr(result)) {
      setError(result.error);
    }
    return result;
  }, []);

  const isAuthenticated = Boolean(authUser);
  const role: UserRole = user?.role || 'user';
  const isAdmin = role === 'admin';

  const contextValue = useMemo<AuthContextValue>(
    () => ({
      authUser,
      user,
      role,
      isAuthenticated,
      isAdmin,
      isLoading,
      error,
      signIn,
      signUp,
      signInWithGoogle,
      signOut,
      sendPasswordReset,
      sendVerificationEmail,
      changePassword,
      deleteAccount,
      clearError,
    }),
    [
      authUser,
      user,
      role,
      isAuthenticated,
      isAdmin,
      isLoading,
      error,
      signIn,
      signUp,
      signInWithGoogle,
      signOut,
      sendPasswordReset,
      sendVerificationEmail,
      changePassword,
      deleteAccount,
      clearError,
    ]
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};
