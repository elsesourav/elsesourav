import { useState, useEffect, useCallback } from 'react';
import { classificationService } from '@/services/classification.service';
import type { Category } from '@/types/category.types';
import type { AppError } from '@/lib/errors';
import { isErr } from '@/lib/result';

export interface UseCategoriesReturn {
  categories: Category[];
  isLoading: boolean;
  error: AppError | null;
  refetch: () => Promise<void>;
}

export function useCategories(): UseCategoriesReturn {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<AppError | null>(null);

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await classificationService.listActiveCategories();
      if (isErr(result)) {
        setError(result.error);
      } else {
        setCategories([...result.data.items]);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchCategories();
  }, [fetchCategories]);

  return {
    categories,
    isLoading,
    error,
    refetch: fetchCategories,
  };
}
