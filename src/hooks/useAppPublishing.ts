import { useState, useCallback } from 'react';
import { appService } from '@/services/app.service';
import type { App, AppStatus } from '@/types/app.types';
import type { AppError } from '@/lib/errors';
import type { Result } from '@/types/result.types';
import { isErr } from '@/lib/result';

export interface UseAppPublishingReturn {
  isProcessing: boolean;
  error: AppError | null;
  publishApp: (id: string) => Promise<Result<App, AppError>>;
  unpublishApp: (id: string) => Promise<Result<App, AppError>>;
  archiveApp: (id: string) => Promise<Result<App, AppError>>;
  restoreApp: (id: string, targetStatus?: AppStatus) => Promise<Result<App, AppError>>;
  validateAppForPublish: (app: App) => Result<void, AppError>;
}

export function useAppPublishing(): UseAppPublishingReturn {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<AppError | null>(null);

  const validateAppForPublish = useCallback((app: App): Result<void, AppError> => {
    return appService.validateForPublish(app);
  }, []);

  const publishApp = useCallback(async (id: string): Promise<Result<App, AppError>> => {
    setIsProcessing(true);
    setError(null);
    try {
      const result = await appService.publishApp(id);
      if (isErr(result)) {
        setError(result.error);
      }
      return result;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const unpublishApp = useCallback(async (id: string): Promise<Result<App, AppError>> => {
    setIsProcessing(true);
    setError(null);
    try {
      const result = await appService.unpublishApp(id);
      if (isErr(result)) {
        setError(result.error);
      }
      return result;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const archiveApp = useCallback(async (id: string): Promise<Result<App, AppError>> => {
    setIsProcessing(true);
    setError(null);
    try {
      const result = await appService.archiveApp(id);
      if (isErr(result)) {
        setError(result.error);
      }
      return result;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const restoreApp = useCallback(
    async (id: string, targetStatus: AppStatus = 'draft'): Promise<Result<App, AppError>> => {
      setIsProcessing(true);
      setError(null);
      try {
        const result = await appService.restoreApp(id, targetStatus);
        if (isErr(result)) {
          setError(result.error);
        }
        return result;
      } finally {
        setIsProcessing(false);
      }
    },
    []
  );

  return {
    isProcessing,
    error,
    publishApp,
    unpublishApp,
    archiveApp,
    restoreApp,
    validateAppForPublish,
  };
}
