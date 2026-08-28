import { PrismaClient, UserRole as PrismaRole } from '@prisma/client';
import { prisma as defaultPrisma } from '../client';
import { mapPrismaUserToDomain } from '../mappers/user.mapper';
import { AppError } from '@elsesourav/types';
import type { User as DomainUser, UserRole as DomainRole } from '@elsesourav/types';

export class UserRepository {
  constructor(private readonly prisma: PrismaClient = defaultPrisma) {}

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

  async softDeleteUserTransaction(userId: string): Promise<void> {
    try {
      await this.prisma.$transaction(async (tx) => {
        await tx.user.update({
          where: { id: userId },
          data: {
            deletedAt: new Date(),
          },
        });

        await tx.auditLog.create({
          data: {
            userId,
            action: 'USER_ACCOUNT_DELETED',
            entityType: 'User',
            entityId: userId,
            details: { reason: 'User requested account closure' },
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
}
