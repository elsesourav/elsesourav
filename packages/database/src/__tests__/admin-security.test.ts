import { describe, it, expect, vi } from 'vitest';
import { AdminService, AdminRepository } from '../index';
import { AppError } from '@elsesourav/types';
import type { AdminContext, AdminDashboardStats, AdminActivityItem } from '@elsesourav/types';

describe('Admin Security Boundary, Role Authorization & Telemetry Service', () => {
  const mockAdminContext: AdminContext = {
    id: 'usr-admin-1',
    email: 'admin@elsesourav.com',
    role: 'ADMIN',
    displayName: 'Lead Administrator',
  };

  const mockStaffContext: AdminContext = {
    id: 'usr-staff-1',
    email: 'staff@elsesourav.com',
    role: 'STAFF',
    displayName: 'Support Specialist',
  };

  const mockNormalUserContext: AdminContext = {
    id: 'usr-regular-1',
    email: 'member@elsesourav.com',
    role: 'USER',
    displayName: 'Regular Community User',
  };

  const mockDashboardStats: AdminDashboardStats = {
    totalApps: 12,
    publishedApps: 10,
    draftApps: 2,
    totalBlogPosts: 8,
    publishedBlogPosts: 7,
    totalHelpArticles: 15,
    totalTickets: 25,
    openTickets: 3,
    totalUsers: 140,
  };

  const mockRecentActivities: AdminActivityItem[] = [
    {
      id: 'ticket-1',
      type: 'support',
      title: 'Ticket TICK-101: Account Issue',
      subtitle: 'Priority: HIGH • Status: OPEN',
      timestamp: 1704067000000,
      link: '/admin/support',
      status: 'open',
      badgeVariant: 'warning',
    },
  ];

  // ==========================================
  // Authorization Boundary Tests
  // ==========================================

  it('allows ADMIN role to access dashboard metrics and activities', async () => {
    const mockRepo = {
      getDashboardMetrics: vi.fn().mockResolvedValue(mockDashboardStats),
      getRecentActivity: vi.fn().mockResolvedValue(mockRecentActivities),
    } as unknown as AdminRepository;

    const service = new AdminService(mockRepo);
    const stats = await service.getDashboardStats(mockAdminContext);
    const activities = await service.getRecentActivities(mockAdminContext, 5);

    expect(stats.totalApps).toBe(12);
    expect(stats.openTickets).toBe(3);
    expect(activities).toHaveLength(1);
    expect(mockRepo.getDashboardMetrics).toHaveBeenCalled();
    expect(mockRepo.getRecentActivity).toHaveBeenCalledWith(5);
  });

  it('allows STAFF role to access dashboard metrics and activities', async () => {
    const mockRepo = {
      getDashboardMetrics: vi.fn().mockResolvedValue(mockDashboardStats),
      getRecentActivity: vi.fn().mockResolvedValue(mockRecentActivities),
    } as unknown as AdminRepository;

    const service = new AdminService(mockRepo);
    const stats = await service.getDashboardStats(mockStaffContext);

    expect(stats.totalApps).toBe(12);
    expect(mockRepo.getDashboardMetrics).toHaveBeenCalled();
  });

  it('strictly blocks USER role from accessing admin metrics (Throws 403 Forbidden)', async () => {
    const mockRepo = {
      getDashboardMetrics: vi.fn(),
      getRecentActivity: vi.fn(),
    } as unknown as AdminRepository;

    const service = new AdminService(mockRepo);

    await expect(
      service.getDashboardStats(mockNormalUserContext)
    ).rejects.toThrowError(AppError);

    await expect(
      service.getRecentActivities(mockNormalUserContext)
    ).rejects.toThrowError(AppError);

    expect(mockRepo.getDashboardMetrics).not.toHaveBeenCalled();
    expect(mockRepo.getRecentActivity).not.toHaveBeenCalled();
  });

  it('strictly blocks anonymous / missing session from accessing admin service (Throws 401 Unauthorized)', async () => {
    const mockRepo = {} as AdminRepository;
    const service = new AdminService(mockRepo);

    const invalidContext = { id: '', email: '', role: 'USER' } as AdminContext;

    await expect(
      service.getDashboardStats(invalidContext)
    ).rejects.toThrowError(AppError);
  });

  // ==========================================
  // Site Configuration & Dynamic Settings Tests
  // ==========================================
  describe('Site Settings Management', () => {
    it('allows reading and writing dynamic site configuration key-values', async () => {
      const mockPrisma = {
        siteSetting: {
          findUnique: vi.fn().mockResolvedValue({ key: 'announcement_banner', value: 'Welcome to ElseSourav' }),
          upsert: vi.fn().mockResolvedValue({ key: 'announcement_banner', value: 'New release is live' }),
          findMany: vi.fn().mockResolvedValue([
            { key: 'announcement_banner', value: 'Welcome to ElseSourav' },
            { key: 'maintenance_mode', value: 'false' },
          ]),
        },
      } as unknown as import('@prisma/client').PrismaClient;

      const repo = new AdminRepository(mockPrisma);

      const val = await repo.getSetting('announcement_banner');
      expect(val).toBe('Welcome to ElseSourav');

      await repo.upsertSetting('announcement_banner', 'New release is live', 'Hero banner message', 'admin-1');
      expect(mockPrisma.siteSetting.upsert).toHaveBeenCalledWith({
        where: { key: 'announcement_banner' },
        update: { value: 'New release is live', description: 'Hero banner message', updatedBy: 'admin-1' },
        create: { key: 'announcement_banner', value: 'New release is live', description: 'Hero banner message', updatedBy: 'admin-1' },
      });

      const all = await repo.getAllSettings();
      expect(all['announcement_banner']).toBe('Welcome to ElseSourav');
      expect(all['maintenance_mode']).toBe('false');
    });
  });
});
