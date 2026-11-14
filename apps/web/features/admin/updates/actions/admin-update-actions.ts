'use server';

import { BlogRepository, BlogService } from '@elsesourav/database';
import { requireAdmin } from '../../guards/require-admin';
import { AdminSaveBlogSchema, type AdminSaveBlogSchemaInput, generateBlogSlug, z } from '@elsesourav/validation';
import { revalidatePath } from 'next/cache';

function formatValidationError(error: z.ZodError): string {
  const firstIssue = error.issues[0];
  if (!firstIssue) return 'Invalid update post payload';
  const field = firstIssue.path.join('.');
  if (field && !firstIssue.message.toLowerCase().includes(field.toLowerCase())) {
    return `${field}: ${firstIssue.message}`;
  }
  return firstIssue.message;
}

const blogRepo = new BlogRepository();
const blogService = new BlogService(blogRepo);

export async function createBlogPostAction(data: AdminSaveBlogSchemaInput) {
  const context = await requireAdmin();

  const parsed = AdminSaveBlogSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: formatValidationError(parsed.error),
    };
  }

  // Pre-check for slug collision to provide immediate feedback and link to existing post
  const targetSlug = parsed.data.slug || generateBlogSlug(parsed.data.title);
  const existingRecord = await blogRepo.findPostRecordBySlug(targetSlug);
  if (existingRecord) {
    return {
      success: false,
      error: `An update post with slug "${targetSlug}" already exists.`,
      existingPostId: existingRecord.id,
    };
  }

  try {
    const post = await blogService.createBlogPost(context.id, context.role, {
      title: parsed.data.title,
      slug: parsed.data.slug,
      excerpt: parsed.data.excerpt,
      content: parsed.data.content,
      coverImageUrl: parsed.data.coverImageUrl || undefined,
      authorName: parsed.data.authorName || undefined,
      authorImageUrl: parsed.data.authorImageUrl || undefined,
      authorUrl: parsed.data.authorUrl || undefined,
      authorRole: parsed.data.authorRole || undefined,
      categoryId: parsed.data.categoryId,
      seoTitle: parsed.data.seoTitle || undefined,
      seoDescription: parsed.data.seoDescription || undefined,
    });

    revalidatePath('/admin/updates');
    revalidatePath('/admin');
    revalidatePath('/updates');
    revalidatePath('/');

    return {
      success: true,
      postId: post.id,
      slug: post.slug,
    };
  } catch (error) {
    console.error('createBlogPostAction failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create update post',
    };
  }
}

export async function updateBlogPostAction(postId: string, data: AdminSaveBlogSchemaInput) {
  const context = await requireAdmin();

  const parsed = AdminSaveBlogSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: formatValidationError(parsed.error),
    };
  }

  // Pre-check for slug collision on other posts
  if (parsed.data.slug) {
    const existingRecord = await blogRepo.findPostRecordBySlug(parsed.data.slug);
    if (existingRecord && existingRecord.id !== postId) {
      return {
        success: false,
        error: `Another update post already uses the slug "${parsed.data.slug}".`,
        existingPostId: existingRecord.id,
      };
    }
  }

  try {
    const updated = await blogService.updateBlogPost(context.role, postId, {
      title: parsed.data.title,
      slug: parsed.data.slug,
      excerpt: parsed.data.excerpt,
      content: parsed.data.content,
      coverImageUrl: parsed.data.coverImageUrl || undefined,
      authorName: parsed.data.authorName || undefined,
      authorImageUrl: parsed.data.authorImageUrl || undefined,
      authorUrl: parsed.data.authorUrl || undefined,
      authorRole: parsed.data.authorRole || undefined,
      categoryId: parsed.data.categoryId,
      seoTitle: parsed.data.seoTitle || undefined,
      seoDescription: parsed.data.seoDescription || undefined,
      status: parsed.data.status.toLowerCase() as 'draft' | 'published' | 'archived',
    });

    revalidatePath('/admin/updates');
    revalidatePath(`/admin/updates/${postId}`);
    revalidatePath('/admin');
    revalidatePath('/updates');
    revalidatePath(`/updates/${updated.slug}`);
    revalidatePath('/');

    return {
      success: true,
      postId: updated.id,
      slug: updated.slug,
    };
  } catch (error) {
    console.error('updateBlogPostAction failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update post',
    };
  }
}

export async function publishBlogPostAction(postId: string) {
  const context = await requireAdmin();

  try {
    const published = await blogService.publishBlogPost(context.role, postId);

    revalidatePath('/admin/updates');
    revalidatePath(`/admin/updates/${postId}`);
    revalidatePath('/admin');
    revalidatePath('/updates');
    revalidatePath(`/updates/${published.slug}`);
    revalidatePath('/');

    return { success: true, post: published };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to publish post',
    };
  }
}

export async function archiveBlogPostAction(postId: string) {
  const context = await requireAdmin();

  try {
    await blogService.archiveBlogPost(context.role, postId);

    revalidatePath('/admin/updates');
    revalidatePath(`/admin/updates/${postId}`);
    revalidatePath('/admin');
    revalidatePath('/updates');
    revalidatePath('/');

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to archive post',
    };
  }
}

export async function deleteBlogPostAction(postId: string) {
  const context = await requireAdmin();

  try {
    await blogService.deleteBlogPost(context.role, postId);

    revalidatePath('/admin/updates');
    revalidatePath('/admin');
    revalidatePath('/updates');
    revalidatePath('/');

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete post',
    };
  }
}
