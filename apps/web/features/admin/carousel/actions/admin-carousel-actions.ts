'use server';

import { CarouselRepository, CarouselService, AuditRepository } from '@elsesourav/database';
import { requireAdmin } from '../../guards/require-admin';
import {
  AdminSaveCarouselSlideSchema,
  type AdminSaveCarouselSlideInput,
} from '@elsesourav/validation';
import { revalidatePath } from 'next/cache';

const carouselRepo = new CarouselRepository();
const carouselService = new CarouselService(carouselRepo);
const auditRepo = new AuditRepository();

export async function createCarouselSlideAction(data: AdminSaveCarouselSlideInput) {
  const context = await requireAdmin();

  const parsed = AdminSaveCarouselSlideSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || 'Invalid carousel slide data',
    };
  }

  try {
    const created = await carouselService.createSlide(context.role, {
      title: parsed.data.title,
      subtitle: parsed.data.subtitle || null,
      desktopImageUrl: parsed.data.desktopImageUrl,
      mobileImageUrl: parsed.data.mobileImageUrl || null,
      targetUrl: parsed.data.targetUrl,
      badgeText: parsed.data.badgeText || null,
      sortOrder: parsed.data.sortOrder,
      isActive: parsed.data.isActive,
    });

    await auditRepo
      .logAction({
        userId: context.id,
        action: 'CAROUSEL_CREATE',
        entityType: 'CAROUSEL_SLIDE',
        entityId: created.id,
        details: { title: created.title, targetUrl: created.targetUrl },
      })
      .catch((err) => console.error('Failed to log carousel audit:', err));

    revalidatePath('/admin/carousel');
    revalidatePath('/apps');
    revalidatePath('/');

    return { success: true, slide: created };
  } catch (error) {
    console.error('createCarouselSlideAction failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create carousel slide',
    };
  }
}

export async function updateCarouselSlideAction(
  id: string,
  data: AdminSaveCarouselSlideInput
) {
  const context = await requireAdmin();

  const parsed = AdminSaveCarouselSlideSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || 'Invalid carousel slide data',
    };
  }

  try {
    const updated = await carouselService.updateSlide(context.role, id, {
      title: parsed.data.title,
      subtitle: parsed.data.subtitle || null,
      desktopImageUrl: parsed.data.desktopImageUrl,
      mobileImageUrl: parsed.data.mobileImageUrl || null,
      targetUrl: parsed.data.targetUrl,
      badgeText: parsed.data.badgeText || null,
      sortOrder: parsed.data.sortOrder,
      isActive: parsed.data.isActive,
    });

    await auditRepo
      .logAction({
        userId: context.id,
        action: 'CAROUSEL_UPDATE',
        entityType: 'CAROUSEL_SLIDE',
        entityId: updated.id,
        details: { title: updated.title, targetUrl: updated.targetUrl },
      })
      .catch((err) => console.error('Failed to log carousel audit:', err));

    revalidatePath('/admin/carousel');
    revalidatePath(`/admin/carousel/${id}`);
    revalidatePath('/apps');
    revalidatePath('/');

    return { success: true, slide: updated };
  } catch (error) {
    console.error('updateCarouselSlideAction failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update carousel slide',
    };
  }
}

export async function deleteCarouselSlideAction(id: string) {
  const context = await requireAdmin();

  try {
    await carouselService.deleteSlide(context.role, id);

    await auditRepo
      .logAction({
        userId: context.id,
        action: 'CAROUSEL_DELETE',
        entityType: 'CAROUSEL_SLIDE',
        entityId: id,
        details: { deletedAt: new Date().toISOString() },
      })
      .catch((err) => console.error('Failed to log carousel audit:', err));

    revalidatePath('/admin/carousel');
    revalidatePath('/apps');
    revalidatePath('/');

    return { success: true };
  } catch (error) {
    console.error('deleteCarouselSlideAction failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete carousel slide',
    };
  }
}

export async function toggleCarouselSlideActiveAction(id: string) {
  const context = await requireAdmin();

  try {
    const updated = await carouselService.toggleActive(context.role, id);

    await auditRepo
      .logAction({
        userId: context.id,
        action: 'CAROUSEL_TOGGLE_ACTIVE',
        entityType: 'CAROUSEL_SLIDE',
        entityId: id,
        details: { isActive: updated.isActive },
      })
      .catch((err) => console.error('Failed to log carousel audit:', err));

    revalidatePath('/admin/carousel');
    revalidatePath('/apps');
    revalidatePath('/');

    return { success: true, slide: updated };
  } catch (error) {
    console.error('toggleCarouselSlideActiveAction failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to toggle slide status',
    };
  }
}

export async function reorderCarouselSlidesAction(orderedIds: string[]) {
  const context = await requireAdmin();

  try {
    await carouselService.reorderSlides(context.role, orderedIds);

    revalidatePath('/admin/carousel');
    revalidatePath('/apps');
    revalidatePath('/');

    return { success: true };
  } catch (error) {
    console.error('reorderCarouselSlidesAction failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to reorder slides',
    };
  }
}
