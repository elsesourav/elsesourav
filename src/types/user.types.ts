import type { ID, Timestamp } from './common.types';
import type { ThemeMode } from './theme.types';

/**
 * User Roles
 * Single-publisher architecture: extensible, but strictly ADMIN and USER initially
 */
export type UserRole = 'admin' | 'user';

/**
 * User Status
 */
export type UserStatus = 'active' | 'suspended' | 'pending';

/**
 * User Preferences
 */
export interface UserPreferences {
  readonly theme: ThemeMode;
  readonly emailNotifications: boolean;
  readonly reduceMotion: boolean;
  readonly compactView: boolean;
}

/**
 * User Profile Domain Entity
 */
export interface User {
  readonly id: ID;
  readonly email: string;
  readonly displayName: string;
  readonly photoUrl?: string;
  readonly role: UserRole;
  readonly status: UserStatus;
  readonly preferences: UserPreferences;
  readonly lastLoginAt?: Timestamp;
  readonly createdAt: Timestamp;
  readonly updatedAt: Timestamp;
}

/**
 * User Library Item
 * Tracks apps saved, pinned, or favorited in a user's personal dashboard
 */
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
