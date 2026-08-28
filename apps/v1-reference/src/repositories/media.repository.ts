import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit as firestoreLimit,
  startAfter,
  writeBatch,
  type Firestore,
  type QueryConstraint,
  type DocumentSnapshot,
} from 'firebase/firestore';
import { getFirebaseFirestore } from '@/firebase/client';
import { createFirestoreConverter } from './converters';
import { createAppMediaSchema, updateAppMediaSchema } from '@/schemas/media.schema';
import { ok, err } from '@/lib/result';
import { AppError } from '@/lib/errors';
import type { IAppMediaRepository } from './interfaces';
import type { AppMedia, AppMediaType } from '@/types/media.types';
import type {
  RepositoryResult,
  PaginatedRepositoryResult,
  QueryOptions,
  QueryFilter,
} from './types';
import type { z } from 'zod';

export type CreateAppMediaDto = z.input<typeof createAppMediaSchema>;
export type UpdateAppMediaDto = z.input<typeof updateAppMediaSchema>;

export class FirestoreAppMediaRepository implements IAppMediaRepository {
  private readonly converter = createFirestoreConverter<AppMedia>();

  constructor(private readonly getFirestoreInstance: () => Firestore = getFirebaseFirestore) {}

  private getCollection(appId: string) {
    const db = this.getFirestoreInstance();
    return collection(db, 'apps', appId, 'media').withConverter(this.converter);
  }

  private getDocRef(appId: string, mediaId: string) {
    const db = this.getFirestoreInstance();
    return doc(db, 'apps', appId, 'media', mediaId).withConverter(this.converter);
  }

  public async findById(appId: string, mediaId: string): RepositoryResult<AppMedia | null> {
    if (!appId || !mediaId) {
      return err(AppError.badRequest('App ID and Media ID are required', 'id'));
    }

    try {
      const docRef = this.getDocRef(appId, mediaId);
      const snapshot = await getDoc(docRef);

      if (!snapshot.exists()) {
        return ok(null);
      }

      return ok(snapshot.data());
    } catch (error) {
      return err(
        AppError.internal('Failed to retrieve media metadata', {
          originalError: error instanceof Error ? error.message : String(error),
        })
      );
    }
  }

  public async listByApp(
    appId: string,
    options?: QueryOptions
  ): PaginatedRepositoryResult<AppMedia> {
    if (!appId) {
      return err(AppError.badRequest('App ID is required', 'appId'));
    }

    try {
      const colRef = this.getCollection(appId);
      const constraints: QueryConstraint[] = [];

      if (options?.filters && options.filters.length > 0) {
        for (const f of options.filters) {
          constraints.push(where(f.field, f.operator, f.value));
        }
      } else {
        constraints.push(where('isActive', '==', true));
      }

      constraints.push(orderBy(options?.orderBy || 'orderIndex', options?.orderDirection || 'asc'));

      if (options?.startAfterDoc) {
        constraints.push(startAfter(options.startAfterDoc as DocumentSnapshot));
      }

      const queryLimit = options?.limit || 50;
      constraints.push(firestoreLimit(queryLimit + 1));

      const q = query(colRef, ...constraints);
      const snapshot = await getDocs(q);

      const items: AppMedia[] = [];
      const hasMore = snapshot.docs.length > queryLimit;
      const docsToProcess = hasMore ? snapshot.docs.slice(0, queryLimit) : snapshot.docs;

      for (const d of docsToProcess) {
        items.push(d.data());
      }

      const nextCursor =
        hasMore && docsToProcess.length > 0
          ? docsToProcess[docsToProcess.length - 1]?.id
          : undefined;

      return ok({
        items,
        hasMore,
        nextCursor,
      });
    } catch (error) {
      return err(
        AppError.internal('Failed to list media metadata for app', {
          originalError: error instanceof Error ? error.message : String(error),
        })
      );
    }
  }

  public async listByType(
    appId: string,
    type: AppMediaType,
    options?: QueryOptions
  ): PaginatedRepositoryResult<AppMedia> {
    if (!appId || !type) {
      return err(AppError.badRequest('App ID and Media Type are required', 'type'));
    }

    const filters: QueryFilter[] = [{ field: 'type', operator: '==', value: type }];
    if (options?.filters) {
      filters.push(...options.filters);
    } else {
      filters.push({ field: 'isActive', operator: '==', value: true });
    }

    return this.listByApp(appId, {
      ...options,
      filters,
      orderBy: options?.orderBy || 'orderIndex',
      orderDirection: options?.orderDirection || 'asc',
    });
  }

  public async create(appId: string, data: CreateAppMediaDto): RepositoryResult<AppMedia> {
    const validation = createAppMediaSchema.safeParse(data);
    if (!validation.success) {
      return err(
        AppError.badRequest(
          'Validation failed for app media metadata',
          validation.error.issues[0]?.path.join('.')
        )
      );
    }

    const now = Date.now();
    const docRef = doc(this.getCollection(appId));

    const newMedia: AppMedia = {
      ...validation.data,
      id: docRef.id,
      appId,
      createdAt: now,
      updatedAt: now,
    };

    try {
      await setDoc(docRef, newMedia);
      return ok(newMedia);
    } catch (error) {
      return err(
        AppError.internal('Failed to store media metadata', {
          originalError: error instanceof Error ? error.message : String(error),
        })
      );
    }
  }

  public async update(
    appId: string,
    mediaId: string,
    data: UpdateAppMediaDto
  ): RepositoryResult<AppMedia> {
    const validation = updateAppMediaSchema.safeParse(data);
    if (!validation.success) {
      return err(
        AppError.badRequest(
          'Validation failed for app media update',
          validation.error.issues[0]?.path.join('.')
        )
      );
    }

    try {
      const existing = await this.findById(appId, mediaId);
      if (!existing.success) return existing;
      if (!existing.data) {
        return err(AppError.notFound(`Media with ID "${mediaId}" was not found.`));
      }

      const updated: AppMedia = {
        ...existing.data,
        ...validation.data,
        updatedAt: Date.now(),
      };

      const docRef = this.getDocRef(appId, mediaId);
      await updateDoc(docRef, updated as unknown as Record<string, unknown>);
      return ok(updated);
    } catch (error) {
      return err(
        AppError.internal('Failed to update media metadata', {
          originalError: error instanceof Error ? error.message : String(error),
        })
      );
    }
  }

  public async delete(appId: string, mediaId: string): RepositoryResult<void> {
    if (!appId || !mediaId) {
      return err(AppError.badRequest('App ID and Media ID are required', 'id'));
    }

    try {
      const docRef = this.getDocRef(appId, mediaId);
      await deleteDoc(docRef);
      return ok(undefined);
    } catch (error) {
      return err(
        AppError.internal('Failed to delete media metadata record', {
          originalError: error instanceof Error ? error.message : String(error),
        })
      );
    }
  }

  public async reorder(appId: string, orderedMediaIds: string[]): RepositoryResult<void> {
    if (!appId || !orderedMediaIds || orderedMediaIds.length === 0) {
      return err(AppError.badRequest('App ID and ordered Media IDs are required', 'mediaIds'));
    }

    try {
      const db = this.getFirestoreInstance();
      const batch = writeBatch(db);

      orderedMediaIds.forEach((mediaId, index) => {
        const docRef = doc(db, 'apps', appId, 'media', mediaId);
        batch.update(docRef, { orderIndex: index, updatedAt: Date.now() });
      });

      await batch.commit();
      return ok(undefined);
    } catch (error) {
      return err(
        AppError.internal('Failed to reorder media metadata', {
          originalError: error instanceof Error ? error.message : String(error),
        })
      );
    }
  }
}

export const appMediaRepository = new FirestoreAppMediaRepository();
