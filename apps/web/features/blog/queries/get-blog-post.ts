import { BlogRepository, BlogService } from '@elsesourav/database';
import type { PublicBlogPost, BlogPostListItem } from '@elsesourav/types';

const blogRepo = new BlogRepository();
const blogService = new BlogService(blogRepo);

export async function getPublicBlogPostBySlug(slug: string): Promise<PublicBlogPost | null> {
  try {
    return await blogService.getPublicPostBySlug(slug);
  } catch {
    return null;
  }
}

export async function getRelatedBlogPosts(
  postId: string,
  categoryId?: string,
  limit: number = 3
): Promise<BlogPostListItem[]> {
  return blogService.getRelatedPosts(postId, categoryId, limit);
}
