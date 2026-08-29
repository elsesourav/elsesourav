'use server';

import { UserRepository, UserService } from '@elsesourav/database';
import { getServerSession } from '@elsesourav/auth';
import { cookies } from 'next/headers';
import {
  UpdateProfileSchema,
  UpdatePreferencesSchema,
  DeleteAccountSchema,
} from '@elsesourav/validation';
import { revalidatePath } from 'next/cache';

const userRepo = new UserRepository();
const userService = new UserService(userRepo);

async function getSessionUser() {
  const cookieStore = await cookies();
  const session = await getServerSession({
    getAll: () => cookieStore.getAll(),
  });
  return session?.user ?? null;
}

export async function updateProfileFormAction(data: {
  displayName?: string;
  username?: string;
  bio?: string;
  photoUrl?: string;
}) {
  const user = await getSessionUser();
  if (!user?.id) {
    return { success: false, error: 'Unauthorized' };
  }

  const parsed = UpdateProfileSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || 'Invalid profile input',
    };
  }

  try {
    const updated = await userService.updateProfile(user.id, user.id, parsed.data);
    revalidatePath('/settings');
    revalidatePath('/profile');
    revalidatePath('/dashboard');

    return {
      success: true,
      user: {
        id: updated.id,
        displayName: updated.displayName,
        username: updated.username,
        photoUrl: updated.photoUrl,
        bio: updated.bio,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update profile',
    };
  }
}

export async function updatePreferencesAction(data: {
  theme?: 'light' | 'dark' | 'system';
  emailNotifications?: boolean;
  reduceMotion?: boolean;
  compactView?: boolean;
}) {
  const user = await getSessionUser();
  if (!user?.id) {
    return { success: false, error: 'Unauthorized' };
  }

  const parsed = UpdatePreferencesSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || 'Invalid preferences input',
    };
  }

  try {
    const updated = await userService.updatePreferences(user.id, user.id, parsed.data);
    revalidatePath('/settings');
    revalidatePath('/profile');

    return {
      success: true,
      preferences: updated.preferences,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update preferences',
    };
  }
}

export async function deleteAccountAction(data: {
  confirmation: string;
  reason?: string;
}) {
  const user = await getSessionUser();
  if (!user?.id) {
    return { success: false, error: 'Unauthorized' };
  }

  const parsed = DeleteAccountSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || 'Invalid confirmation phrase',
    };
  }

  try {
    await userService.requestAccountDeletion(
      user.id,
      user.id,
      parsed.data.confirmation,
      parsed.data.reason
    );

    revalidatePath('/');
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete account',
    };
  }
}
