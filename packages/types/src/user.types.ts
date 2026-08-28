import type { ID, Timestamp } from './common.types';

export type UserRole = 'ADMIN' | 'USER' | 'STAFF' | 'CREATOR';
export type UserStatus = 'active' | 'suspended' | 'deleted' | 'pending';
export type ThemeMode = 'light' | 'dark' | 'system';

export interface UserPreferences {
  readonly theme: ThemeMode;
  readonly emailNotifications: boolean;
  readonly reduceMotion: boolean;
  readonly compactView: boolean;
  readonly language?: string;
}

export interface User {
  readonly id: ID;
  readonly supabaseAuthId: string;
  readonly email: string;
  readonly displayName: string;
  readonly username?: string;
  readonly photoUrl?: string;
  readonly bio?: string;
  readonly role: UserRole;
  readonly status: UserStatus;
  readonly preferences: UserPreferences;
  readonly lastLoginAt?: Timestamp;
  readonly createdAt: Timestamp;
  readonly updatedAt: Timestamp;
  readonly deletedAt?: Timestamp;
}

export interface UserLibraryItem {
  readonly id: ID;
  readonly userId: ID;
  readonly appId: ID;
  readonly isFavorite: boolean;
  readonly isPinned: boolean;
  readonly customNotes?: string;
  readonly addedAt: Timestamp;
  readonly lastOpenedAt?: Timestamp;
}
