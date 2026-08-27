import { useState, useEffect, useCallback } from 'react';
import { appService } from '@/services/app.service';
import type { App } from '@/types/app.types';
import type { AppError } from '@/lib/errors';
import type { QueryOptions, PaginatedResult } from '@/repositories/types';
import { isErr } from '@/lib/result';

export interface UseAppsReturn {
  apps: App[];
  hasMore: boolean;
  nextCursor?: string;
  isLoading: boolean;
  error: AppError | null;
  refetch: () => Promise<void>;
}

export function useApps(options?: QueryOptions): UseAppsReturn {
  const [data, setData] = useState<PaginatedResult<App>>({ items: [], hasMore: false });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<AppError | null>(null);

  const fetchApps = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await appService.listPublishedApps(options);
      if (isErr(result)) {
        setError(result.error);
      } else {
        setData({
          items: [...result.data.items],
          hasMore: result.data.hasMore,
          nextCursor: result.data.nextCursor,
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [options]);

  useEffect(() => {
    void fetchApps();
  }, [fetchApps]);

  return {
    apps: [...data.items],
    hasMore: data.hasMore,
    nextCursor: data.nextCursor,
    isLoading,
    error,
    refetch: fetchApps,
  };
}

export function useFeaturedApps(limit = 6): UseAppsReturn {
  const [data, setData] = useState<PaginatedResult<App>>({ items: [], hasMore: false });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<AppError | null>(null);

  const fetchFeatured = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await appService.listFeaturedApps(limit);
      if (isErr(result)) {
        setError(result.error);
      } else {
        setData({
          items: [...result.data.items],
          hasMore: result.data.hasMore,
          nextCursor: result.data.nextCursor,
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    void fetchFeatured();
  }, [fetchFeatured]);

  return {
    apps: [...data.items],
    hasMore: data.hasMore,
    nextCursor: data.nextCursor,
    isLoading,
    error,
    refetch: fetchFeatured,
  };
}

export function useLatestApps(limit = 10): UseAppsReturn {
  const [data, setData] = useState<PaginatedResult<App>>({ items: [], hasMore: false });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<AppError | null>(null);

  const fetchLatest = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await appService.listLatestApps(limit);
      if (isErr(result)) {
        setError(result.error);
      } else {
        setData({
          items: [...result.data.items],
          hasMore: result.data.hasMore,
          nextCursor: result.data.nextCursor,
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    void fetchLatest();
  }, [fetchLatest]);

  return {
    apps: [...data.items],
    hasMore: data.hasMore,
    nextCursor: data.nextCursor,
    isLoading,
    error,
    refetch: fetchLatest,
  };
}

export function useAppsByCategory(category: string, options?: QueryOptions): UseAppsReturn {
  const [data, setData] = useState<PaginatedResult<App>>({ items: [], hasMore: false });
  const [isLoading, setIsLoading] = useState<boolean>(Boolean(category));
  const [error, setError] = useState<AppError | null>(null);

  const fetchByCategory = useCallback(async () => {
    if (!category) {
      setData({ items: [], hasMore: false });
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const result = await appService.listAppsByCategory(category, options);
      if (isErr(result)) {
        setError(result.error);
      } else {
        setData({
          items: [...result.data.items],
          hasMore: result.data.hasMore,
          nextCursor: result.data.nextCursor,
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [category, options]);

  useEffect(() => {
    void fetchByCategory();
  }, [fetchByCategory]);

  return {
    apps: [...data.items],
    hasMore: data.hasMore,
    nextCursor: data.nextCursor,
    isLoading,
    error,
    refetch: fetchByCategory,
  };
}

export function useAppsByTag(tag: string, options?: QueryOptions): UseAppsReturn {
  const [data, setData] = useState<PaginatedResult<App>>({ items: [], hasMore: false });
  const [isLoading, setIsLoading] = useState<boolean>(Boolean(tag));
  const [error, setError] = useState<AppError | null>(null);

  const fetchByTag = useCallback(async () => {
    if (!tag) {
      setData({ items: [], hasMore: false });
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const result = await appService.listAppsByTag(tag, options);
      if (isErr(result)) {
        setError(result.error);
      } else {
        setData({
          items: [...result.data.items],
          hasMore: result.data.hasMore,
          nextCursor: result.data.nextCursor,
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [tag, options]);

  useEffect(() => {
    void fetchByTag();
  }, [fetchByTag]);

  return {
    apps: [...data.items],
    hasMore: data.hasMore,
    nextCursor: data.nextCursor,
    isLoading,
    error,
    refetch: fetchByTag,
  };
}
