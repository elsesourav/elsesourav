import type { UserLibraryItem } from '@elsesourav/types';

export const fixtureLibraryItemPinned: UserLibraryItem = {
  id: 'lib-item-1',
  userId: 'usr-standard-1',
  appId: 'app-terminal-pro',
  isFavorite: true,
  isPinned: true,
  customNotes: 'Primary shell for local cloud container testing.',
  addedAt: 1704067200000,
  lastOpenedAt: 1704153600000,
};

export const fixtureLibraryItemFavorite: UserLibraryItem = {
  id: 'lib-item-2',
  userId: 'usr-standard-1',
  appId: 'app-palette-studio',
  isFavorite: true,
  isPinned: false,
  customNotes: 'Theme generator for design token exports.',
  addedAt: 1704067200000,
  lastOpenedAt: 1704140000000,
};

export const fixtureLibraryItemStandard: UserLibraryItem = {
  id: 'lib-item-3',
  userId: 'usr-standard-1',
  appId: 'app-focusflow',
  isFavorite: false,
  isPinned: false,
  addedAt: 1704067200000,
};

export const fixtureUserLibraryItems: readonly UserLibraryItem[] = [
  fixtureLibraryItemPinned,
  fixtureLibraryItemFavorite,
  fixtureLibraryItemStandard,
];
