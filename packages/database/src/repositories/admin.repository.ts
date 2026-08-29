import { PrismaClient, PublishStatus, TicketStatus } from '@prisma/client';
import { prisma as defaultPrisma } from '../client';
import { AppError } from '@elsesourav/types';
import type { AdminDashboardStats, AdminActivityItem } from '@elsesourav/types';

export class AdminRepository {
  constructor(private readonly prisma: PrismaClient = defaultPrisma) {}

  async getDashboardMetrics(): Promise<AdminDashboardStats> {
    try {
      const [
        totalApps,
        publishedApps,
        draftApps,
        totalBlogPosts,
        publishedBlogPosts,
        totalHelpArticles,
        totalTickets,
        openTickets,
        totalUsers,
      ] = await Promise.all([
        this.prisma.app.count(),
        this.prisma.app.count({ where: { status: PublishStatus.PUBLISHED } }),
        this.prisma.app.count({ where: { status: PublishStatus.DRAFT } }),
        this.prisma.blogPost.count(),
        this.prisma.blogPost.count({ where: { status: PublishStatus.PUBLISHED } }),
        this.prisma.helpArticle.count(),
        this.prisma.supportTicket.count(),
        this.prisma.supportTicket.count({
          where: {
            status: {
              in: [
                TicketStatus.OPEN,
                TicketStatus.IN_PROGRESS,
                TicketStatus.WAITING_FOR_USER,
              ],
            },
          },
        }),
        this.prisma.user.count({ where: { deletedAt: null } }),
      ]);

      return {
        totalApps,
        publishedApps,
        draftApps,
        totalBlogPosts,
        publishedBlogPosts,
        totalHelpArticles,
        totalTickets,
        openTickets,
        totalUsers,
      };
    } catch (error) {
      throw AppError.database('Failed to fetch admin dashboard metrics', error);
    }
  }

  async getRecentActivity(limit: number = 10): Promise<AdminActivityItem[]> {
    try {
      const [recentTickets, recentApps, recentBlogs] = await Promise.all([
        this.prisma.supportTicket.findMany({
          take: limit,
          orderBy: { updatedAt: 'desc' },
          select: {
            id: true,
            ticketNumber: true,
            subject: true,
            status: true,
            priority: true,
            updatedAt: true,
          },
        }),
        this.prisma.app.findMany({
          take: limit,
          orderBy: { updatedAt: 'desc' },
          select: {
            id: true,
            name: true,
            slug: true,
            status: true,
            category: {
              select: { name: true },
            },
            updatedAt: true,
          },
        }),
        this.prisma.blogPost.findMany({
          take: limit,
          orderBy: { updatedAt: 'desc' },
          select: {
            id: true,
            title: true,
            slug: true,
            status: true,
            updatedAt: true,
          },
        }),
      ]);

      const items: AdminActivityItem[] = [
        ...recentTickets.map((t) => ({
          id: `ticket-${t.id}`,
          type: 'support' as const,
          title: `Ticket ${t.ticketNumber}: ${t.subject}`,
          subtitle: `Priority: ${t.priority} • Status: ${t.status}`,
          timestamp: t.updatedAt.getTime(),
          link: `/admin/support`,
          status: t.status,
          badgeVariant: (t.status === TicketStatus.RESOLVED ? 'success' : 'warning') as 'success' | 'warning',
        })),
        ...recentApps.map((a) => ({
          id: `app-${a.id}`,
          type: 'app' as const,
          title: `App: ${a.name}`,
          subtitle: `Category: ${a.category.name} • Status: ${a.status}`,
          timestamp: a.updatedAt.getTime(),
          link: `/admin/apps`,
          status: a.status,
          badgeVariant: (a.status === PublishStatus.PUBLISHED ? 'success' : 'info') as 'success' | 'info',
        })),
        ...recentBlogs.map((b) => ({
          id: `blog-${b.id}`,
          type: 'blog' as const,
          title: `Post: ${b.title}`,
          subtitle: `Status: ${b.status}`,
          timestamp: b.updatedAt.getTime(),
          link: `/admin/blog`,
          status: b.status,
          badgeVariant: (b.status === PublishStatus.PUBLISHED ? 'success' : 'outline') as 'success' | 'outline',
        })),
      ];

      return items
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, limit);
    } catch (error) {
      throw AppError.database('Failed to fetch admin recent activity', error);
    }
  }
}
