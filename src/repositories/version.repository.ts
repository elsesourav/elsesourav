import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit as firestoreLimit,
  startAfter,
  type Firestore,
  type QueryConstraint,
  type DocumentSnapshot,
} from 'firebase/firestore';
import { getFirebaseFirestore } from '@/firebase/client';
import { createFirestoreConverter } from './converters';
import { createAppVersionSchema, updateAppVersionSchema } from '@/schemas/version.schema';
import { ok, err } from '@/lib/result';
import { AppError } from '@/lib/errors';
import { normalizeSemver } from '@/utils/semver';
import type { IAppVersionRepository } from './interfaces';
import type { AppVersion } from '@/types/version.types';
import type { RepositoryResult, PaginatedRepositoryResult, QueryOptions } from './types';
import type { Result } from '@/types/result.types';
import type { z } from 'zod';

export type CreateAppVersionDto = z.input<typeof createAppVersionSchema>;
export type UpdateAppVersionDto = z.input<typeof updateAppVersionSchema>;

export class FirestoreAppVersionRepository implements IAppVersionRepository {
  private readonly converter = createFirestoreConverter<AppVersion>();

  constructor(private readonly getFirestoreInstance: () => Firestore = getFirebaseFirestore) {}

  private getCollection(appId: string) {
    const db = this.getFirestoreInstance();
    return collection(db, 'apps', appId, 'versions').withConverter(this.converter);
  }

  private getDocRef(appId: string, versionId: string) {
    const db = this.getFirestoreInstance();
    return doc(db, 'apps', appId, 'versions', versionId).withConverter(this.converter);
  }

  public async findById(appId: string, versionId: string): RepositoryResult<AppVersion | null> {
    if (!appId || !versionId) {
      return err(AppError.badRequest('App ID and Version ID are required', 'id'));
    }

    try {
      const docRef = this.getDocRef(appId, versionId);
      const snapshot = await getDoc(docRef);

      if (!snapshot.exists()) {
        return ok(null);
      }

      return ok(snapshot.data());
    } catch (error) {
      return err(
        AppError.internal('Failed to retrieve version', {
          originalError: error instanceof Error ? error.message : String(error),
        })
      );
    }
  }

  public async findByVersion(appId: string, version: string): RepositoryResult<AppVersion | null> {
    if (!appId || !version) {
      return err(AppError.badRequest('App ID and version string are required', 'version'));
    }

    try {
      const normVersion = normalizeSemver(version);
      const colRef = this.getCollection(appId);
      const q = query(colRef, where('version', '==', normVersion), firestoreLimit(1));
      const snapshot = await getDocs(q);

      if (snapshot.empty || !snapshot.docs[0]) {
        return ok(null);
      }

      return ok(snapshot.docs[0].data());
    } catch (error) {
      return err(
        AppError.internal('Failed to retrieve version by version string', {
          originalError: error instanceof Error ? error.message : String(error),
        })
      );
    }
  }

  public async checkVersionUnique(
    appId: string,
    version: string,
    excludeId?: string
  ): Promise<Result<boolean, AppError>> {
    if (!appId || !version) {
      return ok(false);
    }

    const existing = await this.findByVersion(appId, version);
    if (!existing.success) {
      return err(existing.error);
    }

    if (!existing.data) {
      return ok(true);
    }

    if (excludeId && existing.data.id === excludeId) {
      return ok(true);
    }

    return ok(false);
  }

  public async getLatest(appId: string): RepositoryResult<AppVersion | null> {
    if (!appId) {
      return err(AppError.badRequest('App ID is required', 'appId'));
    }

    try {
      const colRef = this.getCollection(appId);
      const q = query(
        colRef,
        where('status', '==', 'published'),
        orderBy('releaseDate', 'desc'),
        firestoreLimit(1)
      );
      const snapshot = await getDocs(q);

      if (snapshot.empty || !snapshot.docs[0]) {
        return ok(null);
      }

      return ok(snapshot.docs[0].data());
    } catch (error) {
      return err(
        AppError.internal('Failed to retrieve latest version', {
          originalError: error instanceof Error ? error.message : String(error),
        })
      );
    }
  }

  public async listByApp(
    appId: string,
    options?: QueryOptions
  ): PaginatedRepositoryResult<AppVersion> {
    if (!appId) {
      return err(AppError.badRequest('App ID is required', 'appId'));
    }

    try {
      const colRef = this.getCollection(appId);
      const constraints: QueryConstraint[] = [];

      // Filter by status if provided, or default to published for public queries
      if (options?.filters && options.filters.length > 0) {
        for (const f of options.filters) {
          constraints.push(where(f.field, f.operator, f.value));
        }
      } else {
        constraints.push(where('status', '==', 'published'));
      }

      constraints.push(
        orderBy(options?.orderBy || 'releaseDate', options?.orderDirection || 'desc')
      );

      if (options?.startAfterDoc) {
        constraints.push(startAfter(options.startAfterDoc as DocumentSnapshot));
      }

      const queryLimit = options?.limit || 20;
      constraints.push(firestoreLimit(queryLimit + 1));

      const q = query(colRef, ...constraints);
      const snapshot = await getDocs(q);

      const items: AppVersion[] = [];
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
        AppError.internal('Failed to list versions for app', {
          originalError: error instanceof Error ? error.message : String(error),
        })
      );
    }
  }

  public async create(appId: string, data: CreateAppVersionDto): RepositoryResult<AppVersion> {
    const validation = createAppVersionSchema.safeParse(data);
    if (!validation.success) {
      return err(
        AppError.badRequest(
          'Validation failed for app version creation',
          validation.error.issues[0]?.path.join('.')
        )
      );
    }

    const normVersion = normalizeSemver(data.version);
    const now = Date.now();
    const docRef = doc(this.getCollection(appId));

    const newVersion: AppVersion = {
      ...validation.data,
      id: docRef.id,
      appId,
      version: normVersion,
      createdAt: now,
      updatedAt: now,
    };

    try {
      await setDoc(docRef, newVersion);
      return ok(newVersion);
    } catch (error) {
      return err(
        AppError.internal('Failed to create app version document', {
          originalError: error instanceof Error ? error.message : String(error),
        })
      );
    }
  }

  public async update(
    appId: string,
    versionId: string,
    data: UpdateAppVersionDto
  ): Promise<Result<AppVersion, AppError>> {
    const validation = updateAppVersionSchema.safeParse(data);
    if (!validation.success) {
      return err(
        AppError.badRequest(
          'Validation failed for app version update',
          validation.error.issues[0]?.path.join('.')
        )
      );
    }

    try {
      const existing = await this.findById(appId, versionId);
      if (!existing.success) return existing;
      if (!existing.data) {
        return err(AppError.notFound(`Version with ID "${versionId}" was not found.`));
      }

      const normVersion = data.version ? normalizeSemver(data.version) : existing.data.version;
      const updated: AppVersion = {
        ...existing.data,
        ...validation.data,
        version: normVersion,
        updatedAt: Date.now(),
      };

      const docRef = this.getDocRef(appId, versionId);
      await updateDoc(docRef, updated as unknown as Record<string, unknown>);
      return ok(updated);
    } catch (error) {
      return err(
        AppError.internal('Failed to update app version document', {
          originalError: error instanceof Error ? error.message : String(error),
        })
      );
    }
  }

  public async setCurrentVersion(appId: string, versionId: string): RepositoryResult<AppVersion> {
    try {
      const versionResult = await this.findById(appId, versionId);
      if (!versionResult.success) return versionResult;
      if (!versionResult.data) {
        return err(AppError.notFound(`Version with ID "${versionId}" was not found.`));
      }

      // Mark this version as current
      return this.update(appId, versionId, { isCurrent: true });
    } catch (error) {
      return err(
        AppError.internal('Failed to set current version', {
          originalError: error instanceof Error ? error.message : String(error),
        })
      );
    }
  }
}

export const appVersionRepository = new FirestoreAppVersionRepository();
