import { useState, useCallback, useEffect } from 'react';
import { useAuth } from './useAuth';
import {
  userLibraryService,
  type SaveAppOptions,
  type EnrichedLibraryItem,
} from '@/services/library.service';
import type { UserLibraryItem } from '@/types/user.types';
import type { Result } from '@/types/result.types';
import { isErr, ok, err } from '@/lib/result';
import { AppError } from '@/lib/errors';

export interface UseUserLibraryReturn {
  savedAppIds: Set<string>;
  isSaved: (appId: string) => boolean;
  saveApp: (appId: string, options?: SaveAppOptions) => Promise<Result<UserLibraryItem, AppError>>;
  removeApp: (appId: string) => Promise<Result<void, AppError>>;
  toggleSave: (
    appId: string,
    options?: SaveAppOptions
  ) => Promise<Result<{ isSaved: boolean }, AppError>>;
  libraryItems: EnrichedLibraryItem[];
  libraryCount: number;
  isLoading: boolean;
  refreshLibrary: () => Promise<void>;
}

export function useUserLibrary(): UseUserLibraryReturn {
  const { user, authUser, isAuthenticated } = useAuth();
  const userId = user?.id || authUser?.uid;

  const [savedAppIds, setSavedAppIds] = useState<Set<string>>(new Set());
  const [libraryItems, setLibraryItems] = useState<EnrichedLibraryItem[]>([]);
  const [libraryCount, setLibraryCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const refreshLibrary = useCallback(async () => {
    if (!isAuthenticated || !userId) {
      setSavedAppIds(new Set());
      setLibraryItems([]);
      setLibraryCount(0);
      return;
    }

    setIsLoading(true);
    try {
      const [enrichedResult, countResult] = await Promise.all([
        userLibraryService.getEnrichedLibrary(userId),
        userLibraryService.getLibraryCount(userId),
      ]);

      if (!isErr(enrichedResult)) {
        setLibraryItems([...enrichedResult.data.items]);
        setSavedAppIds(new Set(enrichedResult.data.items.map((i) => i.libraryItem.appId)));
      }

      if (!isErr(countResult)) {
        setLibraryCount(countResult.data);
      }
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, userId]);

  useEffect(() => {
    void refreshLibrary();
  }, [refreshLibrary]);

  const isSaved = useCallback(
    (appId: string): boolean => {
      return savedAppIds.has(appId);
    },
    [savedAppIds]
  );

  const saveApp = useCallback(
    async (appId: string, options?: SaveAppOptions): Promise<Result<UserLibraryItem, AppError>> => {
      if (!userId) {
        return err(AppError.unauthorized('Must be authenticated to save apps'));
      }

      // Optimistic addition
      setSavedAppIds((prev) => new Set([...prev, appId]));
      setLibraryCount((prev) => prev + 1);

      const result = await userLibraryService.saveApp(userId, appId, options);
      if (isErr(result)) {
        // Rollback on failure
        setSavedAppIds((prev) => {
          const next = new Set(prev);
          next.delete(appId);
          return next;
        });
        setLibraryCount((prev) => Math.max(0, prev - 1));
      }
      return result;
    },
    [userId]
  );

  const removeApp = useCallback(
    async (appId: string): Promise<Result<void, AppError>> => {
      if (!userId) {
        return err(AppError.unauthorized('Must be authenticated to remove apps'));
      }

      // Optimistic removal
      setSavedAppIds((prev) => {
        const next = new Set(prev);
        next.delete(appId);
        return next;
      });
      setLibraryCount((prev) => Math.max(0, prev - 1));

      const result = await userLibraryService.removeApp(userId, appId);
      if (isErr(result)) {
        // Rollback on failure
        setSavedAppIds((prev) => new Set([...prev, appId]));
        setLibraryCount((prev) => prev + 1);
      }
      return result;
    },
    [userId]
  );

  const toggleSave = useCallback(
    async (
      appId: string,
      options?: SaveAppOptions
    ): Promise<Result<{ isSaved: boolean }, AppError>> => {
      if (savedAppIds.has(appId)) {
        const result = await removeApp(appId);
        if (isErr(result)) return result;
        return ok({ isSaved: false });
      } else {
        const result = await saveApp(appId, options);
        if (isErr(result)) return result;
        return ok({ isSaved: true });
      }
    },
    [savedAppIds, saveApp, removeApp]
  );

  return {
    savedAppIds,
    isSaved,
    saveApp,
    removeApp,
    toggleSave,
    libraryItems,
    libraryCount,
    isLoading,
    refreshLibrary,
  };
}
