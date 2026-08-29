'use server';

import { AdminRepository } from '@elsesourav/database';
import { parseKnownSettings } from '@elsesourav/validation';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '../../guards/require-admin';

const adminRepo = new AdminRepository();

export async function updateSiteSettingsAction(settings: Record<string, string>) {
  const context = await requireAdmin();

  let parsed: Record<string, string>;
  try {
    parsed = parseKnownSettings(settings) as Record<string, string>;
  } catch {
    return { success: false, error: 'One or more setting values are invalid.' };
  }

  try {
    for (const [key, value] of Object.entries(parsed)) {
      if (typeof key === 'string' && typeof value === 'string') {
        await adminRepo.upsertSetting(
          key,
          value,
          `Configured via Admin Portal by ${context.displayName}`,
          context.id
        );
      }
    }

    revalidatePath('/admin/settings');
    revalidatePath('/admin');
    revalidatePath('/');
    revalidatePath('/about');
    revalidatePath('/apps');
    revalidatePath('/blog');
    revalidatePath('/help');

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update site settings',
    };
  }
}
