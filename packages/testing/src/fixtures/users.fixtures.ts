import type { User } from '@elsesourav/types';

export const fixtureStandardUser: User = {
  id: 'usr-standard-1',
  supabaseAuthId: 'sb-auth-standard-1',
  email: 'developer@example.test',
  displayName: 'Alex Rivers',
  username: 'alexrivers',
  photoUrl: '/avatars/avatar-2.svg',
  bio: 'Full stack TypeScript engineer building developer automation tools.',
  role: 'USER',
  status: 'active',
  preferences: {
    theme: 'dark',
    emailNotifications: true,
    reduceMotion: false,
    compactView: false,
    language: 'en',
  },
  lastLoginAt: 1704067200000,
  createdAt: 1704067200000,
  updatedAt: 1704067200000,
};

export const fixtureAdminUser: User = {
  id: 'usr-admin-1',
  supabaseAuthId: 'sb-auth-admin-1',
  email: 'admin@example.test',
  displayName: 'Sourav',
  username: 'elsesourav',
  photoUrl: '/avatars/avatar-1.svg',
  bio: 'Platform Creator & Principal Architect.',
  role: 'ADMIN',
  status: 'active',
  preferences: {
    theme: 'dark',
    emailNotifications: true,
    reduceMotion: false,
    compactView: true,
    language: 'en',
  },
  lastLoginAt: 1704067200000,
  createdAt: 1704067200000,
  updatedAt: 1704067200000,
};

export const fixtureStaffUser: User = {
  id: 'usr-staff-1',
  supabaseAuthId: 'sb-auth-staff-1',
  email: 'staff@example.test',
  displayName: 'Jordan Taylor',
  username: 'jordant',
  photoUrl: '/avatars/avatar-3.svg',
  bio: 'Developer Operations & Support Engineer.',
  role: 'STAFF',
  status: 'active',
  preferences: {
    theme: 'system',
    emailNotifications: true,
    reduceMotion: false,
    compactView: false,
  },
  lastLoginAt: 1704067200000,
  createdAt: 1704067200000,
  updatedAt: 1704067200000,
};

export const fixtureSuspendedUser: User = {
  id: 'usr-suspended-1',
  supabaseAuthId: 'sb-auth-suspended-1',
  email: 'suspended@example.test',
  displayName: 'Inactive Account',
  username: 'inactive_user',
  photoUrl: '/avatars/avatar-4.svg',
  role: 'USER',
  status: 'suspended',
  preferences: {
    theme: 'dark',
    emailNotifications: false,
    reduceMotion: true,
    compactView: false,
  },
  createdAt: 1704067200000,
  updatedAt: 1704067200000,
};

export const fixtureMinimalUser: User = {
  id: 'usr-minimal-1',
  supabaseAuthId: 'sb-auth-minimal-1',
  email: 'minimal@example.test',
  displayName: 'Anonymous Dev',
  username: 'anonym_dev',
  photoUrl: '/avatars/avatar-5.svg',
  role: 'USER',
  status: 'active',
  preferences: {
    theme: 'dark',
    emailNotifications: false,
    reduceMotion: false,
    compactView: false,
  },
  createdAt: 1704067200000,
  updatedAt: 1704067200000,
};

export const fixtureUsersList: readonly User[] = [
  fixtureAdminUser,
  fixtureStaffUser,
  fixtureStandardUser,
  fixtureSuspendedUser,
  fixtureMinimalUser,
];
