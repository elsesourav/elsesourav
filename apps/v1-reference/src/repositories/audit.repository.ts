import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
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
import { ok, err } from '@/lib/result';
import { AppError } from '@/lib/errors';
import type { IAuditLogRepository } from './interfaces';
import type { AuditLog, CreateAuditLogDto } from '@/types/audit.types';
import type { RepositoryResult, PaginatedRepositoryResult, QueryOptions } from './types';
import { createAuditLogSchema, sanitizeAuditMetadata } from '@/schemas/audit.schema';

export class FirestoreAuditLogRepository implements IAuditLogRepository {
  private readonly converter = createFirestoreConverter<AuditLog>();

  constructor(private readonly getFirestoreInstance: () => Firestore = getFirebaseFirestore) {}

  private getCollection() {
    const db = this.getFirestoreInstance();
    return collection(db, 'auditLogs').withConverter(this.converter);
  }

  public async createLog(data: CreateAuditLogDto): RepositoryResult<AuditLog> {
    const validation = createAuditLogSchema.safeParse(data);
    if (!validation.success) {
      return err(
        AppError.badRequest(
          'Audit log validation failed',
          validation.error.issues[0]?.path.join('.')
        )
      );
    }

    try {
      const colRef = this.getCollection();
      const docRef = doc(colRef);
      const now = Date.now();
      const sanitizedMetadata = sanitizeAuditMetadata(
        validation.data.metadata as Record<string, unknown> | undefined
      );

      const record: AuditLog = {
        id: docRef.id,
        actorUserId: validation.data.actorUserId,
        actorEmail: validation.data.actorEmail,
        action: validation.data.action,
        entityType: validation.data.entityType,
        entityId: validation.data.entityId,
        metadata: sanitizedMetadata,
        ipAddress: validation.data.ipAddress,
        createdAt: now,
        // Compatibility aliases
        userId: validation.data.actorUserId,
        userEmail: validation.data.actorEmail,
        resourceType: validation.data.entityType,
        resourceId: validation.data.entityId,
        details: sanitizedMetadata,
      };

      await setDoc(docRef, record);
      return ok(record);
    } catch (error) {
      return err(
        AppError.internal('Failed to persist audit log', {
          originalError: error instanceof Error ? error.message : String(error),
        })
      );
    }
  }

  public async getLog(id: string): RepositoryResult<AuditLog | null> {
    if (!id) {
      return err(AppError.badRequest('Audit log ID is required', 'id'));
    }

    try {
      const colRef = this.getCollection();
      const docRef = doc(colRef, id);
      const snapshot = await getDoc(docRef);

      if (!snapshot.exists()) {
        return ok(null);
      }

      return ok(snapshot.data());
    } catch (error) {
      return err(
        AppError.internal('Failed to retrieve audit log', {
          originalError: error instanceof Error ? error.message : String(error),
        })
      );
    }
  }

  public async listLogs(options?: QueryOptions): PaginatedRepositoryResult<AuditLog> {
    try {
      const colRef = this.getCollection();
      const constraints: QueryConstraint[] = [];

      if (options?.filters && options.filters.length > 0) {
        for (const f of options.filters) {
          constraints.push(where(f.field, f.operator, f.value));
        }
      }

      constraints.push(orderBy(options?.orderBy || 'createdAt', options?.orderDirection || 'desc'));

      if (options?.startAfterDoc) {
        constraints.push(startAfter(options.startAfterDoc as DocumentSnapshot));
      }

      const queryLimit = options?.limit || 50;
      constraints.push(firestoreLimit(queryLimit + 1));

      const q = query(colRef, ...constraints);
      const snapshot = await getDocs(q);

      const items: AuditLog[] = [];
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
        lastDoc: docsToProcess.length > 0 ? docsToProcess[docsToProcess.length - 1] : undefined,
      });
    } catch (error) {
      return err(
        AppError.internal('Failed to list audit logs', {
          originalError: error instanceof Error ? error.message : String(error),
        })
      );
    }
  }

  // Backward compatibility alias methods
  public async logAction(entry: Omit<AuditLog, 'id'>): RepositoryResult<AuditLog> {
    return this.createLog({
      actorUserId: entry.actorUserId || entry.userId || 'system',
      actorEmail: entry.actorEmail || entry.userEmail,
      action: entry.action,
      entityType: entry.entityType || entry.resourceType || 'system',
      entityId: entry.entityId || entry.resourceId || 'system',
      metadata: entry.metadata || entry.details,
      ipAddress: entry.ipAddress,
    });
  }

  public async findRecent(options?: QueryOptions): PaginatedRepositoryResult<AuditLog> {
    return this.listLogs(options);
  }
}

export const auditLogRepository = new FirestoreAuditLogRepository();
