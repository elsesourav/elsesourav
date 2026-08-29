import { UserRepository, UserService } from '@elsesourav/database';
import { requireAdmin } from '../../guards/require-admin';
import type { AdminUserListItem, AdminUserDetail, UserRole } from '@elsesourav/types';

const userRepo = new UserRepository();
const userService = new UserService(userRepo);

export interface AdminUsersListData {
  users: AdminUserListItem[];
  total: number;
  totalPages: number;
}

export async function getAdminUsersList(
  options: {
    role?: UserRole | 'all';
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  } = {}
): Promise<AdminUsersListData> {
  const context = await requireAdmin();
  return userService.listUsersAdmin(context.role, options);
}

export async function getAdminUserDetail(userId: string): Promise<AdminUserDetail> {
  const context = await requireAdmin();
  return userService.getUserDetailAdmin(context.role, userId);
}
