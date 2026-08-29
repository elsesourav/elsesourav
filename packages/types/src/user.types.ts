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

export interface PublicUserProfile {
  readonly id: ID;
  readonly displayName: string;
  readonly username?: string;
  readonly photoUrl?: string;
  readonly bio?: string;
  readonly role: UserRole;
  readonly createdAt: Timestamp;
}

export interface SyncUserAuthInput {
  readonly supabaseAuthId: string;
  readonly email: string;
  readonly displayName?: string;
  readonly photoUrl?: string;
}

export interface UpdateProfileInput {
  readonly displayName?: string;
  readonly username?: string;
  readonly bio?: string;
  readonly photoUrl?: string;
}

export interface UpdatePreferencesInput {
  readonly theme?: ThemeMode;
  readonly emailNotifications?: boolean;
  readonly reduceMotion?: boolean;
  readonly compactView?: boolean;
  readonly language?: string;
}

export interface DeleteAccountInput {
  readonly confirmation: string; // Must match "DELETE MY ACCOUNT"
  readonly reason?: string;
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

export interface AdminUserListItem {
  readonly id: ID;
  readonly email: string;
  readonly displayName: string;
  readonly username?: string;
  readonly photoUrl?: string;
  readonly role: UserRole;
  readonly status: UserStatus;
  readonly libraryCount: number;
  readonly supportTicketCount: number;
  readonly createdAt: Timestamp;
  readonly updatedAt: Timestamp;
}

export interface AdminUserDetail extends User {
  readonly libraryCount: number;
  readonly supportTicketCount: number;
  readonly openTicketCount: number;
}

export interface AdminUserListResult {
  readonly users: readonly AdminUserListItem[];
  readonly total: number;
  readonly page: number;
  readonly limit: number;
  readonly totalPages: number;
}
