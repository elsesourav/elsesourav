import { BlogRepository, BlogService } from '@elsesourav/database';
import type {
  BlogCategory,
  BlogTag,
  BlogQueryInput,
  BlogQueryResult,
} from '@elsesourav/types';

const blogRepo = new BlogRepository();
const blogService = new BlogService(blogRepo);

export async function getPublicBlogListing(options: BlogQueryInput = {}): Promise<BlogQueryResult> {
  return blogService.listPublicPosts(options);
}

export async function getBlogCategories(): Promise<BlogCategory[]> {
  return blogService.listCategories();
}

export async function getBlogTags(): Promise<BlogTag[]> {
  return blogService.listTags();
}
