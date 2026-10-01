/* eslint-disable no-console */
'use server';

import { sendOtpEmail } from '@/lib/mailer';
import { getServerSession } from '@elsesourav/auth';
import { OtpRepository, UserRepository, UserService } from '@elsesourav/database';
import { UpdatePreferencesSchema, UpdateProfileSchema } from '@elsesourav/validation';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import crypto from 'node:crypto';

const userRepo = new UserRepository();
const userService = new UserService(userRepo);
const otpRepo = new OtpRepository();

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
 * Send a genuine 6-digit numeric OTP to the currently authenticated user's email address.
 * Dispatches via Resend API or Gmail SMTP with full terminal logging.
 */
export async function sendEmailOtpAction(
  purpose: 'EMAIL_VERIFY' | 'PASSWORD_RESET' = 'EMAIL_VERIFY'
) {
  console.log(`[OTP ACTION] 📧 sendEmailOtpAction requested for purpose: ${purpose}`);
  const user = await getSessionUser();
  if (!user?.email) {
    console.warn(`[OTP ACTION] ❌ Unauthorized: No authenticated session found.`);
    return { success: false, error: 'Unauthorized' };
  }

  console.log(`[OTP ACTION] Authenticated recipient: ${user.email} (userId: ${user.id})`);

  try {
    // Generate secure 6-digit numeric OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    console.log(
      `[OTP ACTION] Generated 6-digit OTP code for ${user.email}: >>> ${otp} <<< (purpose: ${purpose})`
    );

    // Store in database with 10-min expiration
    await otpRepo.createOtp(user.email, otp, purpose, 10);
    console.log(
      `[OTP ACTION] ✅ OTP record persisted in database for ${user.email} with 10-minute validity.`
    );

    // Dispatch email with 6-digit code box
    console.log(`[OTP ACTION] Dispatching email via mailer...`);
    const sendResult = await sendOtpEmail({
      to: user.email,
      otp,
      purpose,
      displayName: user.displayName || undefined,
    });

    if (!sendResult.success) {
      console.error(`[OTP ACTION] ❌ Failed to dispatch email to ${user.email}:`, sendResult.error);
      return { success: false, error: sendResult.error || 'Failed to send verification email' };
    }

    console.log(`[OTP ACTION] ✅ Successfully delivered OTP email to ${user.email}!`);
    return { success: true };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Failed to send verification code';
    console.error(`[OTP ACTION] ❌ Exception in sendEmailOtpAction for ${user.email}:`, error);
    return {
      success: false,
      error: errorMsg,
    };
  }
}

/**
 * Verify the entered 6-digit OTP against the database.
 * If valid and purpose is EMAIL_VERIFY, marks the email as verified.
 */
export async function verifyEmailOtpAction(
  otp: string,
  purpose: 'EMAIL_VERIFY' | 'PASSWORD_RESET' = 'EMAIL_VERIFY'
) {
  console.log(
    `[OTP ACTION] 🔍 verifyEmailOtpAction received code: "${otp}" for purpose: ${purpose}`
  );
  const user = await getSessionUser();
  if (!user?.email || !user?.id) {
    console.warn(`[OTP ACTION] ❌ Unauthorized verification attempt.`);
    return { success: false, error: 'Unauthorized' };
  }

  if (!otp || otp.length !== 6 || !/^\d{6}$/.test(otp)) {
    console.warn(`[OTP ACTION] ⚠️ Invalid code format received: "${otp}"`);
    return { success: false, error: 'Please enter a valid 6-digit verification code' };
  }

  try {
    const result = await otpRepo.verifyOtp(user.email, otp, purpose);
    console.log(`[OTP ACTION] OtpRepo verification result for ${user.email}:`, result);
    if (!result.valid) {
      return { success: false, error: result.error || 'Invalid or expired verification code' };
    }

    // If verifying email identity, update DB flag
    if (purpose === 'EMAIL_VERIFY') {
      await userService.markEmailVerified(user.id, user.id);
      console.log(
        `[OTP ACTION] ✅ User ${user.id} (${user.email}) email marked as verified in database!`
      );
      revalidatePath('/settings');
    }

    return { success: true };
  } catch (error) {
    console.error(`[OTP ACTION] ❌ Exception in verifyEmailOtpAction for ${user.email}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Verification failed',
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
