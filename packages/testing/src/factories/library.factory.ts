import type { UserLibraryItem, App } from '@elsesourav/types';

let libraryCounter = 1;

export function resetLibraryFactoryCounter(): void {
  libraryCounter = 1;
}

export function createUserLibraryItem(overrides?: Partial<UserLibraryItem>): UserLibraryItem {
  const index = libraryCounter++;
  return {
    id: overrides?.id || `lib-test-${index}`,
    userId: overrides?.userId || 'usr-test-1',
    appId: overrides?.appId || `app-test-${index}`,
    isFavorite: overrides?.isFavorite ?? false,
    isPinned: overrides?.isPinned ?? false,
    customNotes: overrides?.customNotes,
    addedAt: overrides?.addedAt ?? 1704067200000,
    lastOpenedAt: overrides?.lastOpenedAt,
  };
}

export interface PopulatedLibraryItem extends UserLibraryItem {
  app: App;
}
