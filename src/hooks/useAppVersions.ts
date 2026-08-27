import { useState, useEffect, useCallback } from 'react';
import { appVersionService } from '@/services/version.service';
import type { AppVersion } from '@/types/version.types';
import type { AppError } from '@/lib/errors';
import { isErr } from '@/lib/result';

export interface UseAppVersionsReturn {
  versions: AppVersion[];
  latestVersion: AppVersion | null;
  isLoading: boolean;
  error: AppError | null;
  refetch: () => Promise<void>;
}

export function useAppVersions(appId?: string): UseAppVersionsReturn {
  const [versions, setVersions] = useState<AppVersion[]>([]);
  const [latestVersion, setLatestVersion] = useState<AppVersion | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(Boolean(appId));
  const [error, setError] = useState<AppError | null>(null);

  const fetchVersions = useCallback(async () => {
    if (!appId) {
      setVersions([]);
      setLatestVersion(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const [listResult, latestResult] = await Promise.all([
        appVersionService.listVersions(appId),
        appVersionService.getLatestVersion(appId),
      ]);

      if (!isErr(listResult)) {
        setVersions([...listResult.data.items]);
      } else {
        setError(listResult.error);
      }

      if (!isErr(latestResult)) {
        setLatestVersion(latestResult.data);
      }
    } finally {
      setIsLoading(false);
    }
  }, [appId]);

  useEffect(() => {
    void fetchVersions();
  }, [fetchVersions]);

  return {
    versions,
    latestVersion,
    isLoading,
    error,
    refetch: fetchVersions,
  };
}
