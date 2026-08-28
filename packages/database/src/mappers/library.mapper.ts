import type { UserLibraryItem as PrismaUserLibraryItem } from '@prisma/client';
import type { LibraryItem } from '@elsesourav/types';
import { mapPrismaAppToListItem, PrismaAppWithRelations } from './app.mapper';

export type PrismaLibraryItemWithApp = PrismaUserLibraryItem & {
  app: PrismaAppWithRelations;
};

export function mapPrismaLibraryItemToDomain(item: PrismaLibraryItemWithApp): LibraryItem {
  return {
    id: item.id,
    userId: item.userId,
    appId: item.appId,
    isFavorite: item.isFavorite,
    isPinned: item.isPinned,
    customNotes: item.customNotes ?? undefined,
    addedAt: item.addedAt.getTime(),
    lastOpenedAt: item.lastOpenedAt ? item.lastOpenedAt.getTime() : undefined,
    app: mapPrismaAppToListItem(item.app),
  };
}
