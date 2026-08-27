import { useState, useEffect, useCallback } from 'react';
import { blogService } from '@/services/blog.service';
import type { BlogPost } from '@/types/blog.types';

export interface UseLatestBlogPostsResult {
  readonly posts: readonly BlogPost[];
  readonly isLoading: boolean;
  readonly error: string | null;
  readonly refetch: () => Promise<void>;
}

export function useLatestBlogPosts(limit = 3): UseLatestBlogPostsResult {
  const [posts, setPosts] = useState<readonly BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const result = await blogService.listLatestPosts(limit);
    if (result.success) {
      setPosts(result.data.items);
    } else {
      setError(result.error.message);
    }
    setIsLoading(false);
  }, [limit]);

  useEffect(() => {
    void fetchPosts();
  }, [fetchPosts]);

  return {
    posts,
    isLoading,
    error,
    refetch: fetchPosts,
  };
}
