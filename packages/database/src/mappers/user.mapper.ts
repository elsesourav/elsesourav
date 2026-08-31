import type { User as PrismaUser, UserRole as PrismaRole } from '@prisma/client';
import type {
  User as DomainUser,
  UserRole as DomainRole,
  UserPreferences,
} from '@elsesourav/types';

export function mapPrismaUserToDomain(prismaUser: PrismaUser): DomainUser {
  const defaultPrefs: UserPreferences = {
    theme: 'dark',
    emailNotifications: true,
    reduceMotion: false,
    compactView: false,
  };

  const rawPrefs = (prismaUser.preferences as Partial<UserPreferences>) || {};
  const preferences: UserPreferences = {
    ...defaultPrefs,
    ...rawPrefs,
  };

  return {
    id: prismaUser.id,
    supabaseAuthId: prismaUser.supabaseAuthId,
    email: prismaUser.email,
    displayName: prismaUser.displayName,
    username: prismaUser.username ?? undefined,
    photoUrl: prismaUser.photoUrl ?? undefined,
    bio: prismaUser.bio ?? undefined,
    role: prismaUser.role as PrismaRole as DomainRole,
    status: prismaUser.deletedAt ? 'deleted' : 'active',
    preferences,
    emailVerified: prismaUser.emailVerified,
    scheduledDeletionAt: prismaUser.scheduledDeletionAt
      ? prismaUser.scheduledDeletionAt.getTime()
      : undefined,
    createdAt: prismaUser.createdAt.getTime(),
    updatedAt: prismaUser.updatedAt.getTime(),
    deletedAt: prismaUser.deletedAt ? prismaUser.deletedAt.getTime() : undefined,
  };
}
