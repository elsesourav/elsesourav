import { BlogRepository, BlogService } from '@elsesourav/database';
import type { Category, BlogTag, BlogQueryInput, BlogQueryResult } from '@elsesourav/types';

const blogRepo = new BlogRepository();
const blogService = new BlogService(blogRepo);

export async function getPublicBlogListing(options: BlogQueryInput = {}): Promise<BlogQueryResult> {
  return blogService.listPublicPosts(options);
}

export async function getUpdateCategories(): Promise<Category[]> {
  return blogService.listCategories();
}

export const getBlogCategories = getUpdateCategories;

export async function getBlogTags(): Promise<BlogTag[]> {
  return blogService.listTags();
}
