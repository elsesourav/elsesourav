import type {
  User,
  UserPreferences,
  PublicUserProfile,
  AdminUserListItem,
  AdminUserDetail,
} from '@elsesourav/types';

export const defaultUserPreferences: UserPreferences = {
  theme: 'dark',
  emailNotifications: true,
  reduceMotion: false,
  compactView: false,
};

let userCounter = 1;

export function resetUserFactoryCounter(): void {
  userCounter = 1;
}

export function createUser(overrides?: Partial<User>): User {
  const index = userCounter++;
  const id = overrides?.id || `usr-test-${index}`;
  const username = overrides?.username !== undefined ? overrides.username : `testuser${index}`;

  return {
    id,
    supabaseAuthId: overrides?.supabaseAuthId || `sb-auth-${id}`,
    email: overrides?.email || `user${index}@example.test`,
    displayName: overrides?.displayName || `Test User ${index}`,
    username,
    photoUrl: overrides?.photoUrl,
    bio: overrides?.bio,
    role: overrides?.role || 'USER',
    status: overrides?.status || 'active',
    preferences: overrides?.preferences
      ? { ...defaultUserPreferences, ...overrides.preferences }
      : defaultUserPreferences,
    lastLoginAt: overrides?.lastLoginAt ?? 1704067200000,
    createdAt: overrides?.createdAt ?? 1704067200000,
    updatedAt: overrides?.updatedAt ?? 1704067200000,
    deletedAt: overrides?.deletedAt,
  };
}

export function createAdminUser(overrides?: Partial<User>): User {
  return createUser({
    displayName: 'Admin Staff',
    username: 'admin',
    role: 'ADMIN',
    ...overrides,
  });
}

export function createStaffUser(overrides?: Partial<User>): User {
  return createUser({
    displayName: 'Support Specialist',
    username: 'support_staff',
    role: 'STAFF',
    ...overrides,
  });
}

export function createPublicUserProfile(user: User): PublicUserProfile {
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

export function createAdminUserListItem(
  user: User,
  extra?: { libraryCount?: number; supportTicketCount?: number }
): AdminUserListItem {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    username: user.username,
    photoUrl: user.photoUrl,
    role: user.role,
    status: user.status,
    libraryCount: extra?.libraryCount ?? 0,
    supportTicketCount: extra?.supportTicketCount ?? 0,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export function createAdminUserDetail(
  user: User,
  extra?: { libraryCount?: number; supportTicketCount?: number; openTicketCount?: number }
): AdminUserDetail {
  return {
    ...user,
    libraryCount: extra?.libraryCount ?? 0,
    supportTicketCount: extra?.supportTicketCount ?? 0,
    openTicketCount: extra?.openTicketCount ?? 0,
  };
}
