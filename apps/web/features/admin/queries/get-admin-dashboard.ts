import { AdminRepository, AdminService } from '@elsesourav/database';
import { requireAdmin } from '../guards/require-admin';
import type { AdminContext, AdminDashboardStats, AdminActivityItem } from '@elsesourav/types';

const adminRepo = new AdminRepository();
const adminService = new AdminService(adminRepo);

export interface AdminDashboardData {
  context: AdminContext;
  stats: AdminDashboardStats;
  recentActivities: AdminActivityItem[];
}

export async function getAdminDashboardData(): Promise<AdminDashboardData> {
  const context = await requireAdmin();

  const [stats, recentActivities] = await Promise.all([
    adminService.getDashboardStats(context),
    adminService.getRecentActivities(context, 10),
  ]);

  return {
    context,
    stats,
    recentActivities,
  };
}
