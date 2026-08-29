'use server';

import { UserRepository, UserService } from '@elsesourav/database';
import { requireAdmin } from '../../guards/require-admin';
import {
  AdminUpdateUserRoleSchema,
} from '@elsesourav/validation';
import type { UserRole } from '@elsesourav/types';
import { revalidatePath } from 'next/cache';

const userRepo = new UserRepository();
const userService = new UserService(userRepo);

export async function adminUpdateUserRoleAction(targetUserId: string, role: UserRole) {
  const context = await requireAdmin();

  const parsed = AdminUpdateUserRoleSchema.safeParse({
    userId: targetUserId,
    role,
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || 'Invalid role payload',
    };
  }

  try {
    const updated = await userService.updateUserRoleAdmin(
      context.id,
      context.role,
      parsed.data.userId,
      parsed.data.role
    );

    revalidatePath('/admin/users');
    revalidatePath(`/admin/users/${targetUserId}`);
    revalidatePath('/admin');

    return {
      success: true,
      user: updated,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update user role',
    };
  }
}

export async function adminDeleteUserAction(targetUserId: string, reason?: string) {
  const context = await requireAdmin();

  try {
    await userService.deleteUserAccountAdmin(
      context.id,
      context.role,
      targetUserId,
      reason
    );

    revalidatePath('/admin/users');
    revalidatePath(`/admin/users/${targetUserId}`);
    revalidatePath('/admin');

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete user account',
    };
  }
}
