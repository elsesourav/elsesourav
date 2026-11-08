import { BlogRepository, BlogService } from '@elsesourav/database';
import { requireAdmin } from '../../guards/require-admin';
import type { BlogPost, BlogCategory, BlogTag } from '@elsesourav/types';

const blogRepo = new BlogRepository();
const blogService = new BlogService(blogRepo);

export interface AdminUpdatesListData {
  posts: BlogPost[];
  categories: BlogCategory[];
  tags: BlogTag[];
}

export type AdminBlogListData = AdminUpdatesListData;

export async function getAdminUpdatesList(
  options: {
    status?: 'draft' | 'published' | 'archived';
    categorySlug?: string;
    search?: string;
  } = {}
): Promise<AdminUpdatesListData> {
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

export const getAdminBlogList = getAdminUpdatesList;

export interface AdminUpdateEditData {
  post: BlogPost;
  categories: BlogCategory[];
  tags: BlogTag[];
}

export type AdminBlogEditData = AdminUpdateEditData;

export async function getAdminPostForEdit(postId: string): Promise<AdminUpdateEditData> {
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
