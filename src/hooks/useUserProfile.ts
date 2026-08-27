import { useState, useCallback } from 'react';
import { useAuth } from './useAuth';
import { userService, type UpdateUserProfileDto, type UpdateUserPreferencesDto } from '@/services';
import type { User } from '@/types/user.types';
import type { Result } from '@/types/result.types';
import type { AppError } from '@/lib/errors';
import { err } from '@/lib/result';
import { AppError as ErrorFactory } from '@/lib/errors';

export interface UseUserProfileReturn {
  readonly user: User | null;
  readonly isLoading: boolean;
  readonly error: string | null;
  readonly updateProfile: (data: UpdateUserProfileDto) => Promise<Result<User, AppError>>;
  readonly updatePreferences: (
    preferences: UpdateUserPreferencesDto
  ) => Promise<Result<User, AppError>>;
  readonly softDeleteAccount: () => Promise<Result<User, AppError>>;
  readonly clearError: () => void;
}

export const useUserProfile = (): UseUserProfileReturn => {
  const { user, authUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const updateProfile = useCallback(
    async (data: UpdateUserProfileDto): Promise<Result<User, AppError>> => {
      const uid = authUser?.uid || user?.id;
      if (!uid) {
        const unauthError = ErrorFactory.unauthorized('No authenticated user session found');
        setError(unauthError.message);
        return err(unauthError);
      }

      setIsLoading(true);
      setError(null);

      try {
        const result = await userService.updateUserProfile(uid, data);
        if (!result.success) {
          setError(result.error.message);
          return result;
        }
        return result;
      } finally {
        setIsLoading(false);
      }
    },
    [authUser?.uid, user?.id]
  );

  const updatePreferences = useCallback(
    async (preferences: UpdateUserPreferencesDto): Promise<Result<User, AppError>> => {
      const uid = authUser?.uid || user?.id;
      if (!uid) {
        const unauthError = ErrorFactory.unauthorized('No authenticated user session found');
        setError(unauthError.message);
        return err(unauthError);
      }

      setIsLoading(true);
      setError(null);

      try {
        const result = await userService.updateUserPreferences(uid, preferences);
        if (!result.success) {
          setError(result.error.message);
          return result;
        }
        return result;
      } finally {
        setIsLoading(false);
      }
    },
    [authUser?.uid, user?.id]
  );

  const softDeleteAccount = useCallback(async (): Promise<Result<User, AppError>> => {
    const uid = authUser?.uid || user?.id;
    if (!uid) {
      const unauthError = ErrorFactory.unauthorized('No authenticated user session found');
      setError(unauthError.message);
      return err(unauthError);
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await userService.softDeleteUser(uid);
      if (!result.success) {
        setError(result.error.message);
        return result;
      }
      return result;
    } finally {
      setIsLoading(false);
    }
  }, [authUser?.uid, user?.id]);

  return {
    user,
    isLoading,
    error,
    updateProfile,
    updatePreferences,
    softDeleteAccount,
    clearError,
  };
};
