'use server';

import { UserRepository, UserService } from '@elsesourav/database';
import { getServerSession } from '@elsesourav/auth';
import { cookies } from 'next/headers';
import { UpdateProfileSchema, UpdatePreferencesSchema } from '@elsesourav/validation';
import { revalidatePath } from 'next/cache';
import { createAuthServerClient } from '@elsesourav/auth';

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

/**
 * Send a 6-digit OTP to the currently authenticated user's email address.
 * Uses Supabase's built-in signInWithOtp (email OTP mode).
 */
export async function sendEmailOtpAction() {
  const user = await getSessionUser();
  if (!user?.email) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const cookieStore = await cookies();
    const supabase = createAuthServerClient({
      getAll: () => cookieStore.getAll(),
      setAll: () => {},
    });

    const { error } = await supabase.auth.signInWithOtp({
      email: user.email,
      options: {
        shouldCreateUser: false,
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send OTP',
    };
  }
}

/**
 * Verify the 6-digit OTP entered by the user. On success, also marks
 * the email as verified in our database.
 */
export async function verifyEmailOtpAction(otp: string) {
  const user = await getSessionUser();
  if (!user?.email || !user?.id) {
    return { success: false, error: 'Unauthorized' };
  }

  if (!otp || otp.length !== 6 || !/^\d{6}$/.test(otp)) {
    return { success: false, error: 'Please enter a valid 6-digit OTP' };
  }

  try {
    const cookieStore = await cookies();
    const supabase = createAuthServerClient({
      getAll: () => cookieStore.getAll(),
      setAll: () => {},
    });

    const { error } = await supabase.auth.verifyOtp({
      email: user.email,
      token: otp,
      type: 'email',
    });

    if (error) {
      return { success: false, error: 'Invalid or expired OTP. Please try again.' };
    }

    // Mark email as verified in our DB
    await userService.markEmailVerified(user.id, user.id);
    revalidatePath('/settings');

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'OTP verification failed',
    };
  }
}

/**
 * Schedule a 30-day grace period account deletion.
 * The account is NOT immediately deleted. The user can cancel by logging in
 * during the 30-day window.
 */
export async function scheduleAccountDeletionAction(reason?: string) {
  const user = await getSessionUser();
  if (!user?.id) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    await userService.requestAccountDeletion(user.id, user.id, '', reason);
    revalidatePath('/settings');
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to schedule account deletion',
    };
  }
}

/**
 * Cancel a previously scheduled account deletion within the 30-day grace period.
 */
export async function cancelAccountDeletionAction() {
  const user = await getSessionUser();
  if (!user?.id) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    await userService.cancelScheduledDeletion(user.id, user.id);
    revalidatePath('/settings');
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to cancel account deletion',
    };
  }
}

/**
 * Legacy: kept for backwards compatibility but now delegates to scheduleAccountDeletionAction.
 * @deprecated Use scheduleAccountDeletionAction instead.
 */
export async function deleteAccountAction(data: { confirmation: string; reason?: string }) {
  return scheduleAccountDeletionAction(data.reason);
}
