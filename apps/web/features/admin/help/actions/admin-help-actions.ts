'use server';

import { HelpRepository, HelpService } from '@elsesourav/database';
import { requireAdmin } from '../../guards/require-admin';
import { AdminSaveHelpSchema, type AdminSaveHelpSchemaInput } from '@elsesourav/validation';
import { revalidatePath } from 'next/cache';

const helpRepo = new HelpRepository();
const helpService = new HelpService(helpRepo);

export async function createHelpArticleAction(data: AdminSaveHelpSchemaInput) {
  const context = await requireAdmin();

  const parsed = AdminSaveHelpSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || 'Invalid help article payload',
    };
  }

  try {
    const article = await helpService.createArticle(context.id, context.role, {
      categoryId: parsed.data.categoryId,
      title: parsed.data.title,
      slug: parsed.data.slug,
      excerpt: parsed.data.excerpt || undefined,
      content: parsed.data.content,
      orderIndex: parsed.data.orderIndex,
      seoTitle: parsed.data.seoTitle || undefined,
      seoDescription: parsed.data.seoDescription || undefined,
    });

    revalidatePath('/admin/help');
    revalidatePath('/admin');
    revalidatePath('/help');
    revalidatePath('/');

    return {
      success: true,
      articleId: article.id,
      slug: article.slug,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create help article',
    };
  }
}

export async function updateHelpArticleAction(articleId: string, data: AdminSaveHelpSchemaInput) {
  const context = await requireAdmin();

  const parsed = AdminSaveHelpSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || 'Invalid help article payload',
    };
  }

  try {
    const updated = await helpService.updateArticle(context.role, articleId, {
      categoryId: parsed.data.categoryId,
      title: parsed.data.title,
      slug: parsed.data.slug,
      excerpt: parsed.data.excerpt || undefined,
      content: parsed.data.content,
      orderIndex: parsed.data.orderIndex,
      seoTitle: parsed.data.seoTitle || undefined,
      seoDescription: parsed.data.seoDescription || undefined,
    });

    revalidatePath('/admin/help');
    revalidatePath(`/admin/help/${articleId}`);
    revalidatePath('/admin');
    revalidatePath('/help');
    revalidatePath('/');

    return {
      success: true,
      articleId: updated.id,
      slug: updated.slug,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update help article',
    };
  }
}

export async function publishHelpArticleAction(articleId: string) {
  const context = await requireAdmin();

  try {
    const published = await helpService.publishArticle(context.role, articleId);

    revalidatePath('/admin/help');
    revalidatePath(`/admin/help/${articleId}`);
    revalidatePath('/admin');
    revalidatePath('/help');
    revalidatePath('/');

    return { success: true, article: published };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to publish help article',
    };
  }
}

export async function archiveHelpArticleAction(articleId: string) {
  const context = await requireAdmin();

  try {
    await helpService.archiveArticle(context.role, articleId);

    revalidatePath('/admin/help');
    revalidatePath(`/admin/help/${articleId}`);
    revalidatePath('/admin');
    revalidatePath('/help');
    revalidatePath('/');

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to archive help article',
    };
  }
}

export async function deleteHelpArticleAction(articleId: string) {
  const context = await requireAdmin();

  try {
    await helpService.deleteArticle(context.role, articleId);

    revalidatePath('/admin/help');
    revalidatePath('/admin');
    revalidatePath('/help');
    revalidatePath('/');

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete help article',
    };
  }
}
