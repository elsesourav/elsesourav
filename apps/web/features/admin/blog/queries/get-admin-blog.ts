import { BlogRepository, BlogService } from '@elsesourav/database';
import { requireAdmin } from '../../guards/require-admin';
import type { BlogPost, BlogCategory, BlogTag } from '@elsesourav/types';

const blogRepo = new BlogRepository();
const blogService = new BlogService(blogRepo);

export interface AdminBlogListData {
  posts: BlogPost[];
  categories: BlogCategory[];
  tags: BlogTag[];
}

export async function getAdminBlogList(options: {
  status?: 'draft' | 'published' | 'archived';
  categorySlug?: string;
  search?: string;
} = {}): Promise<AdminBlogListData> {
  const context = await requireAdmin();

  const [posts, categories, tags] = await Promise.all([
    blogService.listAdminPosts(context.role, options),
    blogService.listCategories(),
    blogService.listTags(),
  ]);

  return {
    posts,
    categories,
    tags,
  };
}

export interface AdminBlogEditData {
  post: BlogPost;
  categories: BlogCategory[];
  tags: BlogTag[];
}

export async function getAdminPostForEdit(postId: string): Promise<AdminBlogEditData> {
  const context = await requireAdmin();

  const [post, categories, tags] = await Promise.all([
    blogService.getAdminPostById(context.role, postId),
    blogService.listCategories(),
    blogService.listTags(),
  ]);

  return {
    post,
    categories,
    tags,
  };
}
