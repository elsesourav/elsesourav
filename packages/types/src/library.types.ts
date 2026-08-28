import type { ID, Timestamp } from './common.types';
import type { AppListItem } from './app.types';

export interface LibraryItem {
  readonly id: ID;
  readonly userId: ID;
  readonly appId: ID;
  readonly isFavorite: boolean;
  readonly isPinned: boolean;
  readonly customNotes?: string;
  readonly addedAt: Timestamp;
  readonly lastOpenedAt?: Timestamp;
  readonly app: AppListItem;
}

export interface SaveAppInput {
  readonly appId: string;
  readonly isFavorite?: boolean;
  readonly isPinned?: boolean;
  readonly customNotes?: string;
}

export interface SaveAppResult {
  readonly isSaved: boolean;
  readonly appId: string;
  readonly item?: LibraryItem;
}

export interface UserLibraryResult {
  readonly items: readonly LibraryItem[];
  readonly totalCount: number;
}
