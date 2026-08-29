import { AppError } from '@elsesourav/types';
import type { AdminRepository } from '../repositories/admin.repository';
import type { AdminContext, AdminDashboardStats, AdminActivityItem } from '@elsesourav/types';

export class AdminService {
  constructor(private readonly adminRepo: AdminRepository) {}

  private verifyAdminAccess(adminContext: AdminContext): void {
    if (!adminContext || !adminContext.id) {
      throw AppError.unauthorized('Authentication required to access admin control portal');
    }

    if (adminContext.role !== 'ADMIN' && adminContext.role !== 'STAFF') {
      throw AppError.forbidden('Administrative privileges required');
    }
  }

  async getDashboardStats(adminContext: AdminContext): Promise<AdminDashboardStats> {
    this.verifyAdminAccess(adminContext);
    return this.adminRepo.getDashboardMetrics();
  }

  async getRecentActivities(
    adminContext: AdminContext,
    limit: number = 10
  ): Promise<AdminActivityItem[]> {
    this.verifyAdminAccess(adminContext);
    return this.adminRepo.getRecentActivity(limit);
  }
}
