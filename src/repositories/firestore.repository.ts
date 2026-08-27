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
  orderBy as firestoreOrderBy,
  limit as firestoreLimit,
  startAfter as firestoreStartAfter,
  type Firestore,
  type CollectionReference,
  type DocumentReference,
  type Query,
  type FirestoreDataConverter,
  type WhereFilterOp,
} from 'firebase/firestore';
import { getFirebaseFirestore } from '@/firebase';
import { BaseRepository } from './base.repository';
import { createFirestoreConverter } from './converters';
import { ok, err } from '@/lib/result';
import { AppError } from '@/lib/errors';
import type { ZodType } from 'zod';
import type {
  BaseEntity,
  QueryOptions,
  RepositoryResult,
  PaginatedRepositoryResult,
} from './types';

export interface FirestoreRepositoryOptions<T extends BaseEntity, TCreate, TUpdate> {
  readonly converter?: FirestoreDataConverter<T>;
  readonly createSchema?: ZodType<TCreate>;
  readonly updateSchema?: ZodType<TUpdate>;
  readonly getFirestore?: () => Firestore;
}

/**
 * Generic Production-Ready Firestore Repository
 * Implements type-safe CRUD operations, cursor pagination, and Zod write validation
 */
export class FirestoreRepository<
  T extends BaseEntity,
  TCreate = Omit<T, 'id' | 'createdAt' | 'updatedAt'>,
  TUpdate = Partial<Omit<T, 'id' | 'createdAt'>>,
> extends BaseRepository<T, TCreate, TUpdate> {
  protected readonly converter: FirestoreDataConverter<T>;
  protected readonly createSchema?: ZodType<TCreate>;
  protected readonly updateSchema?: ZodType<TUpdate>;
  protected readonly getFirestoreInstance: () => Firestore;

  constructor(collectionName: string, options?: FirestoreRepositoryOptions<T, TCreate, TUpdate>) {
    super(collectionName);
    this.converter = options?.converter || createFirestoreConverter<T>();
    this.createSchema = options?.createSchema;
    this.updateSchema = options?.updateSchema;
    this.getFirestoreInstance = options?.getFirestore || getFirebaseFirestore;
  }

  protected get db(): Firestore {
    return this.getFirestoreInstance();
  }

  protected getCollectionRef(): CollectionReference<T> {
    return collection(this.db, this.collectionName).withConverter(this.converter);
  }

  protected getDocRef(id: string): DocumentReference<T> {
    return doc(this.db, this.collectionName, id).withConverter(this.converter);
  }

  public async findById(id: string): RepositoryResult<T | null> {
    if (!id || typeof id !== 'string') {
      return err(
        AppError.badRequest(`Invalid id provided for ${this.collectionName} lookup`, 'id')
      );
    }

    try {
      const docRef = this.getDocRef(id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return ok(null);
      }

      return ok(docSnap.data());
    } catch (error) {
      return err(this.handleFirestoreError(error, `retrieve document by ID: "${id}"`));
    }
  }

  public async findMany(options?: QueryOptions): PaginatedRepositoryResult<T> {
    try {
      const q = this.buildQuery(options);
      const querySnapshot = await getDocs(q);

      const items: T[] = [];
      querySnapshot.forEach((docSnap) => {
        items.push(docSnap.data());
      });

      const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
      const limit = options?.limit || 50;
      const hasMore = items.length === limit;

      return ok({
        items,
        lastDoc,
        nextCursor: lastDoc?.id,
        hasMore,
        totalCount: items.length,
      });
    } catch (error) {
      return err(this.handleFirestoreError(error, 'query documents'));
    }
  }

  public async create(data: TCreate, customId?: string): RepositoryResult<T> {
    try {
      // Validate schema if schema is configured
      if (this.createSchema) {
        const parseResult = this.createSchema.safeParse(data);
        if (!parseResult.success) {
          return err(
            AppError.validation(
              `Invalid data for creating ${this.collectionName}`,
              undefined,
              parseResult.error.issues
            )
          );
        }
      }

      const docRef = customId ? this.getDocRef(customId) : doc(this.getCollectionRef());
      const now = Date.now();

      const entityToCreate = {
        ...(data as Record<string, unknown>),
        id: docRef.id,
        createdAt: now,
        updatedAt: now,
      } as unknown as T;

      await setDoc(docRef, entityToCreate);
      return ok(entityToCreate);
    } catch (error) {
      return err(this.handleFirestoreError(error, 'create document'));
    }
  }

  public async update(id: string, data: TUpdate): RepositoryResult<T> {
    if (!id || typeof id !== 'string') {
      return err(
        AppError.badRequest(`Invalid id provided for ${this.collectionName} update`, 'id')
      );
    }

    try {
      if (this.updateSchema) {
        const parseResult = this.updateSchema.safeParse(data);
        if (!parseResult.success) {
          return err(
            AppError.validation(
              `Invalid update payload for ${this.collectionName}`,
              undefined,
              parseResult.error.issues
            )
          );
        }
      }

      const docRef = this.getDocRef(id);
      const existing = await getDoc(docRef);

      if (!existing.exists()) {
        return err(AppError.notFound(this.collectionName, id));
      }

      const now = Date.now();
      const updatedEntity = {
        ...existing.data(),
        ...(data as Record<string, unknown>),
        id,
        updatedAt: now,
      } as unknown as T;

      await updateDoc(docRef, {
        ...(data as Record<string, unknown>),
        updatedAt: now,
      });

      return ok(updatedEntity);
    } catch (error) {
      return err(this.handleFirestoreError(error, `update document: "${id}"`));
    }
  }

  public async delete(id: string): RepositoryResult<void> {
    if (!id || typeof id !== 'string') {
      return err(
        AppError.badRequest(`Invalid id provided for ${this.collectionName} deletion`, 'id')
      );
    }

    try {
      const docRef = this.getDocRef(id);
      await deleteDoc(docRef);
      return ok(undefined);
    } catch (error) {
      return err(this.handleFirestoreError(error, `delete document: "${id}"`));
    }
  }

  protected buildQuery(options?: QueryOptions): Query<T> {
    let q: Query<T> = this.getCollectionRef();

    if (options?.filters && options.filters.length > 0) {
      for (const filter of options.filters) {
        q = query(q, where(filter.field, filter.operator as WhereFilterOp, filter.value));
      }
    }

    if (options?.orderBy) {
      q = query(q, firestoreOrderBy(options.orderBy, options.orderDirection || 'asc'));
    }

    if (options?.startAfterDoc) {
      q = query(q, firestoreStartAfter(options.startAfterDoc));
    } else if (options?.startAfterCursor) {
      q = query(q, firestoreStartAfter(options.startAfterCursor));
    }

    if (options?.limit && options.limit > 0) {
      q = query(q, firestoreLimit(options.limit));
    }

    return q;
  }
}
