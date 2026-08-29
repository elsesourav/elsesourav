'use server';

import { BlogRepository, BlogService } from '@elsesourav/database';
import { requireAdmin } from '../../guards/require-admin';
import { AdminSaveBlogSchema, type AdminSaveBlogSchemaInput } from '@elsesourav/validation';
import { revalidatePath } from 'next/cache';

const blogRepo = new BlogRepository();
const blogService = new BlogService(blogRepo);

export async function createBlogPostAction(data: AdminSaveBlogSchemaInput) {
  const context = await requireAdmin();

  const parsed = AdminSaveBlogSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || 'Invalid blog post payload',
    };
  }

  try {
    const post = await blogService.createBlogPost(context.id, context.role, {
      title: parsed.data.title,
      slug: parsed.data.slug,
      excerpt: parsed.data.excerpt,
      content: parsed.data.content,
      coverImageUrl: parsed.data.coverImageUrl || undefined,
      categoryId: parsed.data.categoryId,
      seoTitle: parsed.data.seoTitle || undefined,
      seoDescription: parsed.data.seoDescription || undefined,
    });

    revalidatePath('/admin/blog');
    revalidatePath('/admin');
    revalidatePath('/blog');
    revalidatePath('/');

    return {
      success: true,
      postId: post.id,
      slug: post.slug,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create blog post',
    };
  }
}

export async function updateBlogPostAction(postId: string, data: AdminSaveBlogSchemaInput) {
  const context = await requireAdmin();

  const parsed = AdminSaveBlogSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || 'Invalid blog post payload',
    };
  }

  try {
    const updated = await blogService.updateBlogPost(context.role, postId, {
      title: parsed.data.title,
      slug: parsed.data.slug,
      excerpt: parsed.data.excerpt,
      content: parsed.data.content,
      coverImageUrl: parsed.data.coverImageUrl || undefined,
      categoryId: parsed.data.categoryId,
      seoTitle: parsed.data.seoTitle || undefined,
      seoDescription: parsed.data.seoDescription || undefined,
      status: parsed.data.status.toLowerCase() as 'draft' | 'published' | 'archived',
    });

    revalidatePath('/admin/blog');
    revalidatePath(`/admin/blog/${postId}`);
    revalidatePath('/admin');
    revalidatePath('/blog');
    revalidatePath(`/blog/${updated.slug}`);
    revalidatePath('/');

    return {
      success: true,
      postId: updated.id,
      slug: updated.slug,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update blog post',
    };
  }
}

export async function publishBlogPostAction(postId: string) {
  const context = await requireAdmin();

  try {
    const published = await blogService.publishBlogPost(context.role, postId);

    revalidatePath('/admin/blog');
    revalidatePath(`/admin/blog/${postId}`);
    revalidatePath('/admin');
    revalidatePath('/blog');
    revalidatePath(`/blog/${published.slug}`);
    revalidatePath('/');

    return { success: true, post: published };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to publish blog post',
    };
  }
}

export async function archiveBlogPostAction(postId: string) {
  const context = await requireAdmin();

  try {
    await blogService.archiveBlogPost(context.role, postId);

    revalidatePath('/admin/blog');
    revalidatePath(`/admin/blog/${postId}`);
    revalidatePath('/admin');
    revalidatePath('/blog');
    revalidatePath('/');

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to archive blog post',
    };
  }
}

export async function deleteBlogPostAction(postId: string) {
  const context = await requireAdmin();

  try {
    await blogService.deleteBlogPost(context.role, postId);

    revalidatePath('/admin/blog');
    revalidatePath('/admin');
    revalidatePath('/blog');
    revalidatePath('/');

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete blog post',
    };
  }
}
