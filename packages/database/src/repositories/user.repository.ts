import { PrismaClient } from '@prisma/client';
import { prisma as defaultPrisma } from '../client';
import { mapPrismaUserToDomain } from '../mappers/user.mapper';
import type { User as DomainUser } from '@elsesourav/types';

export class UserRepository {
  constructor(private readonly prisma: PrismaClient = defaultPrisma) {}

  async findBySupabaseAuthId(supabaseAuthId: string): Promise<DomainUser | null> {
    const user = await this.prisma.user.findUnique({
      where: { supabaseAuthId },
    });
    if (!user) return null;
    return mapPrismaUserToDomain(user);
  }

  async findByEmail(email: string): Promise<DomainUser | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    if (!user) return null;
    return mapPrismaUserToDomain(user);
  }

  async findById(id: string): Promise<DomainUser | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    if (!user) return null;
    return mapPrismaUserToDomain(user);
  }

  async countActiveUsers(): Promise<number> {
    return this.prisma.user.count({
      where: { deletedAt: null },
    });
  }
}
