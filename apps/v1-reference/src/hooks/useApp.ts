import { useState, useEffect, useCallback } from 'react';
import { appService } from '@/services/app.service';
import type { App } from '@/types/app.types';
import type { AppError } from '@/lib/errors';
import { isErr } from '@/lib/result';

export interface UseAppReturn {
  app: App | null;
  isLoading: boolean;
  error: AppError | null;
  refetch: () => Promise<void>;
}

export function useApp(slugOrId?: string): UseAppReturn {
  const [app, setApp] = useState<App | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(Boolean(slugOrId));
  const [error, setError] = useState<AppError | null>(null);

  const fetchApp = useCallback(async () => {
    if (!slugOrId) {
      setApp(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Attempt lookup by slug first, then fallback to ID lookup
      let result = await appService.getAppBySlug(slugOrId);
      if (isErr(result) || !result.data) {
        result = await appService.getAppById(slugOrId);
      }

      if (isErr(result)) {
        setError(result.error);
        setApp(null);
      } else {
        setApp(result.data);
      }
    } finally {
      setIsLoading(false);
    }
  }, [slugOrId]);

  useEffect(() => {
    void fetchApp();
  }, [fetchApp]);

  return {
    app,
    isLoading,
    error,
    refetch: fetchApp,
  };
}
