import { useState, useEffect, useCallback } from 'react';
import { appMediaService } from '@/services/media.service';
import type { AppMedia } from '@/types/media.types';
import type { AppError } from '@/lib/errors';
import { isErr } from '@/lib/result';

export interface UseAppMediaReturn {
  icon: AppMedia | null;
  hero: AppMedia | null;
  screenshots: AppMedia[];
  social: AppMedia | null;
  allMedia: AppMedia[];
  isLoading: boolean;
  error: AppError | null;
  refetch: () => Promise<void>;
}

export function useAppMedia(appId?: string): UseAppMediaReturn {
  const [allMedia, setAllMedia] = useState<AppMedia[]>([]);
  const [icon, setIcon] = useState<AppMedia | null>(null);
  const [hero, setHero] = useState<AppMedia | null>(null);
  const [screenshots, setScreenshots] = useState<AppMedia[]>([]);
  const [social, setSocial] = useState<AppMedia | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(Boolean(appId));
  const [error, setError] = useState<AppError | null>(null);

  const fetchMedia = useCallback(async () => {
    if (!appId) {
      setAllMedia([]);
      setIcon(null);
      setHero(null);
      setScreenshots([]);
      setSocial(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await appMediaService.listMedia(appId);
      if (isErr(result)) {
        setError(result.error);
        return;
      }

      const items = [...result.data.items];
      setAllMedia(items);

      setIcon(items.find((m) => m.type === 'icon') || null);
      setHero(items.find((m) => m.type === 'hero') || null);
      setScreenshots(items.filter((m) => m.type === 'screenshot'));
      setSocial(items.find((m) => m.type === 'social') || null);
    } finally {
      setIsLoading(false);
    }
  }, [appId]);

  useEffect(() => {
    void fetchMedia();
  }, [fetchMedia]);

  return {
    icon,
    hero,
    screenshots,
    social,
    allMedia,
    isLoading,
    error,
    refetch: fetchMedia,
  };
}
