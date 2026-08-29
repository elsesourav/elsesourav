'use server';

import { AppRepository, AppService } from '@elsesourav/database';
import { requireAdmin } from '../../guards/require-admin';
import {
  AdminSaveAppSchema,
  PublishAppSchema,
  type AdminSaveAppSchemaInput,
  type PublishAppSchemaInput,
} from '@elsesourav/validation';
import { revalidatePath } from 'next/cache';

const appRepo = new AppRepository();
const appService = new AppService(appRepo);

export async function createAppAction(data: AdminSaveAppSchemaInput) {
  const context = await requireAdmin();

  const parsed = AdminSaveAppSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || 'Invalid application data',
    };
  }

  try {
    const created = await appService.createApp(context.role, {
      name: parsed.data.name,
      slug: parsed.data.slug,
      shortDescription: parsed.data.shortDescription,
      description: parsed.data.description,
      documentationMd: parsed.data.documentationMd || undefined,
      iconUrl: parsed.data.iconUrl,
      featuredImageUrl: parsed.data.featuredImageUrl || undefined,
      demoUrl: parsed.data.demoUrl || undefined,
      videoUrl: parsed.data.videoUrl || undefined,
      categoryId: parsed.data.categoryId,
      isFeatured: parsed.data.isFeatured,
      isPinned: parsed.data.isPinned,
      sortOrder: parsed.data.sortOrder,
      seoTitle: parsed.data.seoTitle || undefined,
      seoDescription: parsed.data.seoDescription || undefined,
    });

    revalidatePath('/admin/apps');
    revalidatePath('/admin');
    revalidatePath('/apps');
    revalidatePath('/');

    return {
      success: true,
      appId: created.id,
      slug: created.slug,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create application',
    };
  }
}

export async function updateAppAction(appId: string, data: AdminSaveAppSchemaInput) {
  const context = await requireAdmin();

  const parsed = AdminSaveAppSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || 'Invalid application data',
    };
  }

  try {
    const updated = await appService.updateApp(context.role, appId, {
      name: parsed.data.name,
      slug: parsed.data.slug,
      shortDescription: parsed.data.shortDescription,
      description: parsed.data.description,
      documentationMd: parsed.data.documentationMd || undefined,
      iconUrl: parsed.data.iconUrl,
      featuredImageUrl: parsed.data.featuredImageUrl || undefined,
      demoUrl: parsed.data.demoUrl || undefined,
      videoUrl: parsed.data.videoUrl || undefined,
      categoryId: parsed.data.categoryId,
      isFeatured: parsed.data.isFeatured,
      isPinned: parsed.data.isPinned,
      sortOrder: parsed.data.sortOrder,
      seoTitle: parsed.data.seoTitle || undefined,
      seoDescription: parsed.data.seoDescription || undefined,
    });

    revalidatePath('/admin/apps');
    revalidatePath(`/admin/apps/${appId}`);
    revalidatePath('/admin');
    revalidatePath('/apps');
    revalidatePath(`/apps/${updated.slug}`);
    revalidatePath('/');

    return {
      success: true,
      appId: updated.id,
      slug: updated.slug,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update application',
    };
  }
}

export async function publishAppAction(appId: string, data: PublishAppSchemaInput) {
  const context = await requireAdmin();

  const parsed = PublishAppSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || 'Invalid release version details',
    };
  }

  try {
    const published = await appService.publishApp(context.role, appId, {
      version: parsed.data.version,
      changelog: parsed.data.changelog,
      downloadUrl: parsed.data.downloadUrl || undefined,
    });

    revalidatePath('/admin/apps');
    revalidatePath(`/admin/apps/${appId}`);
    revalidatePath('/admin');
    revalidatePath('/apps');
    revalidatePath(`/apps/${published.slug}`);
    revalidatePath('/');

    return {
      success: true,
      app: published,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to publish application',
    };
  }
}

export async function archiveAppAction(appId: string) {
  const context = await requireAdmin();

  try {
    await appService.archiveApp(context.role, appId);

    revalidatePath('/admin/apps');
    revalidatePath(`/admin/apps/${appId}`);
    revalidatePath('/admin');
    revalidatePath('/apps');
    revalidatePath('/');

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to archive application',
    };
  }
}

export async function deleteAppAction(appId: string) {
  const context = await requireAdmin();

  try {
    await appService.deleteApp(context.role, appId);

    revalidatePath('/admin/apps');
    revalidatePath('/admin');
    revalidatePath('/apps');
    revalidatePath('/');

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete application',
    };
  }
}
