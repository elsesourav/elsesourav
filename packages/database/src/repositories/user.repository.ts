import { PrismaClient, UserRole as PrismaRole, Prisma } from '@prisma/client';
import { prisma as defaultPrisma } from '../client';
import { mapPrismaUserToDomain } from '../mappers/user.mapper';
import { AppError } from '@elsesourav/types';
import type {
  User as DomainUser,
  PublicUserProfile,
  UserRole as DomainRole,
  AdminUserListItem,
  AdminUserDetail,
  SyncUserAuthInput,
  UpdateProfileInput,
  UpdatePreferencesInput,
} from '@elsesourav/types';

export class UserRepository {
  constructor(private readonly prisma: PrismaClient = defaultPrisma) {}

  async syncUserAuth(input: SyncUserAuthInput): Promise<DomainUser> {
    try {
      const email = input.email.trim().toLowerCase();
      const displayName = input.displayName?.trim() || email.split('@')[0] || 'Developer';

      const user = await this.prisma.user.upsert({
        where: { supabaseAuthId: input.supabaseAuthId },
        update: {
          email,
          ...(input.photoUrl ? { photoUrl: input.photoUrl } : {}),
        },
        create: {
          supabaseAuthId: input.supabaseAuthId,
          email,
          displayName,
          photoUrl: input.photoUrl,
          role: PrismaRole.USER,
          preferences: {
            theme: 'dark',
            emailNotifications: true,
            reduceMotion: false,
            compactView: false,
          },
        },
      });

      return mapPrismaUserToDomain(user);
    } catch (error) {
      throw AppError.database(`Failed to synchronize user auth identity: ${input.supabaseAuthId}`, error);
    }
  }

  async findBySupabaseAuthId(supabaseAuthId: string): Promise<DomainUser | null> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { supabaseAuthId },
      });
      if (!user) return null;
      return mapPrismaUserToDomain(user);
    } catch (error) {
      throw AppError.database(`Failed to find user by auth ID: ${supabaseAuthId}`, error);
    }
  }

  async findByEmail(email: string): Promise<DomainUser | null> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email: email.trim().toLowerCase() },
      });
      if (!user) return null;
      return mapPrismaUserToDomain(user);
    } catch (error) {
      throw AppError.database(`Failed to find user by email: ${email}`, error);
    }
  }

  async findById(id: string): Promise<DomainUser | null> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
      });
      if (!user) return null;
      return mapPrismaUserToDomain(user);
    } catch (error) {
      throw AppError.database(`Failed to find user by id: ${id}`, error);
    }
  }

  async findByUsername(username: string): Promise<DomainUser | null> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { username: username.trim().toLowerCase() },
      });
      if (!user) return null;
      return mapPrismaUserToDomain(user);
    } catch (error) {
      throw AppError.database(`Failed to find user by username: ${username}`, error);
    }
  }

  async getPublicProfile(username: string): Promise<PublicUserProfile | null> {
    const user = await this.findByUsername(username);
    if (!user || user.status === 'deleted') return null;

    return {
      id: user.id,
      displayName: user.displayName,
      username: user.username,
      photoUrl: user.photoUrl,
      bio: user.bio,
      role: user.role,
      createdAt: user.createdAt,
    };
  }

  async updateProfile(userId: string, data: UpdateProfileInput): Promise<DomainUser> {
    try {
      const normalizedUsername = data.username ? data.username.trim().toLowerCase() : undefined;

      const updated = await this.prisma.user.update({
        where: { id: userId },
        data: {
          ...(data.displayName ? { displayName: data.displayName.trim() } : {}),
          ...(normalizedUsername !== undefined ? { username: normalizedUsername } : {}),
          ...(data.bio !== undefined ? { bio: data.bio.trim() } : {}),
          ...(data.photoUrl !== undefined ? { photoUrl: data.photoUrl } : {}),
        },
      });

      return mapPrismaUserToDomain(updated);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw AppError.validation(`Username '${data.username}' is already taken`);
      }
      throw AppError.database(`Failed to update profile for user: ${userId}`, error);
    }
  }

  async updatePreferences(userId: string, preferences: UpdatePreferencesInput): Promise<DomainUser> {
    try {
      const existing = await this.findById(userId);
      if (!existing) {
        throw AppError.notFound('User');
      }

      const mergedPreferences = {
        ...existing.preferences,
        ...preferences,
      };

      const updated = await this.prisma.user.update({
        where: { id: userId },
        data: {
          preferences: mergedPreferences as object,
        },
      });

      return mapPrismaUserToDomain(updated);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw AppError.database(`Failed to update preferences for user: ${userId}`, error);
    }
  }

  async updateRole(userId: string, newRole: DomainRole, adminUserId: string): Promise<DomainUser> {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const updated = await tx.user.update({
          where: { id: userId },
          data: { role: newRole as PrismaRole },
        });

        await tx.auditLog.create({
          data: {
            userId: adminUserId,
            action: 'USER_ROLE_UPDATED',
            entityType: 'User',
            entityId: userId,
            details: { newRole },
          },
        });

        return mapPrismaUserToDomain(updated);
      });
    } catch (error) {
      throw AppError.database(`Failed to update role for user: ${userId}`, error);
    }
  }

  async softDeleteUserTransaction(userId: string, reason = 'User requested account closure'): Promise<void> {
    try {
      await this.prisma.$transaction(async (tx) => {
        await tx.user.update({
          where: { id: userId },
          data: {
            deletedAt: new Date(),
            bio: null,
            photoUrl: null,
          },
        });

        await tx.auditLog.create({
          data: {
            userId,
            action: 'USER_ACCOUNT_DELETED',
            entityType: 'User',
            entityId: userId,
            details: { reason },
          },
        });
      });
    } catch (error) {
      throw AppError.database(`Failed to soft-delete user account: ${userId}`, error);
    }
  }

  async countActiveUsers(): Promise<number> {
    try {
      return await this.prisma.user.count({
        where: { deletedAt: null },
      });
    } catch (error) {
      throw AppError.database('Failed to count active users', error);
    }
  }

  async countAdmins(): Promise<number> {
    try {
      return await this.prisma.user.count({
        where: {
          role: PrismaRole.ADMIN,
          deletedAt: null,
        },
      });
    } catch (error) {
      throw AppError.database('Failed to count admins', error);
    }
  }

  async findAllUsersAdmin(options: {
    role?: DomainRole | 'all';
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<{ users: AdminUserListItem[]; total: number }> {
    const page = Math.max(options.page ?? 1, 1);
    const limit = Math.min(Math.max(options.limit ?? 20, 1), 100);
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {};

    if (options.role && options.role !== 'all') {
      where.role = options.role as PrismaRole;
    }

    if (options.status && options.status !== 'all') {
      if (options.status === 'deleted') {
        where.deletedAt = { not: null };
      } else if (options.status === 'active') {
        where.deletedAt = null;
      }
    }

    if (options.search && options.search.trim().length > 0) {
      const term = options.search.trim();
      where.OR = [
        { email: { contains: term, mode: 'insensitive' } },
        { displayName: { contains: term, mode: 'insensitive' } },
        { username: { contains: term, mode: 'insensitive' } },
      ];
    }

    const [records, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              library: true,
              supportTickets: true,
            },
          },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    const users: AdminUserListItem[] = records.map((u) => ({
      id: u.id,
      email: u.email,
      displayName: u.displayName,
      username: u.username ?? undefined,
      photoUrl: u.photoUrl ?? undefined,
      role: u.role as PrismaRole as DomainRole,
      status: u.deletedAt ? 'deleted' : 'active',
      libraryCount: u._count.library,
      supportTicketCount: u._count.supportTickets,
      createdAt: u.createdAt.getTime(),
      updatedAt: u.updatedAt.getTime(),
    }));

    return { users, total };
  }

  async findUserDetailAdmin(userId: string): Promise<AdminUserDetail | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        _count: {
          select: {
            library: true,
            supportTickets: true,
          },
        },
        supportTickets: {
          where: { status: { in: ['OPEN', 'IN_PROGRESS', 'WAITING_FOR_USER'] } },
          select: { id: true },
        },
      },
    });

    if (!user) return null;

    const baseUser = mapPrismaUserToDomain(user);

    return {
      ...baseUser,
      libraryCount: user._count.library,
      supportTicketCount: user._count.supportTickets,
      openTicketCount: user.supportTickets.length,
    };
  }

  async adminDeleteUser(userId: string, adminUserId: string, reason = 'Admin initiated account termination'): Promise<void> {
    try {
      await this.prisma.$transaction(async (tx) => {
        await tx.user.update({
          where: { id: userId },
          data: {
            deletedAt: new Date(),
            bio: null,
            photoUrl: null,
          },
        });

        await tx.auditLog.create({
          data: {
            userId: adminUserId,
            action: 'ADMIN_USER_DELETED',
            entityType: 'User',
            entityId: userId,
            details: { reason },
          },
        });
      });
    } catch (error) {
      throw AppError.database(`Failed to delete user: ${userId}`, error);
    }
  }
}
