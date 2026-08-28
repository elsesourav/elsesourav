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
  increment,
  type Firestore,
  type QueryConstraint,
  type DocumentSnapshot,
} from 'firebase/firestore';
import { getFirebaseFirestore } from '@/firebase/client';
import { createFirestoreConverter } from './converters';
import { createAnalyticsEventSchema } from '@/schemas/analytics.schema';
import { ok, err } from '@/lib/result';
import { AppError } from '@/lib/errors';
import type { IAnalyticsRepository } from './interfaces';
import type { AnalyticsEvent, AppAnalyticsAggregate } from '@/types/analytics.types';
import type { RepositoryResult, PaginatedRepositoryResult, QueryOptions } from './types';
import type { z } from 'zod';

export type CreateAnalyticsEventDto = z.infer<typeof createAnalyticsEventSchema>;

export class FirestoreAnalyticsRepository implements IAnalyticsRepository {
  private readonly eventConverter = createFirestoreConverter<AnalyticsEvent>();
  private readonly statsConverter = createFirestoreConverter<AppAnalyticsAggregate>();

  constructor(private readonly getFirestoreInstance: () => Firestore = getFirebaseFirestore) {}

  private getEventsCollection() {
    const db = this.getFirestoreInstance();
    return collection(db, 'analyticsEvents').withConverter(this.eventConverter);
  }

  private getStatsDocRef(appId: string) {
    const db = this.getFirestoreInstance();
    return doc(db, 'appStatistics', appId).withConverter(this.statsConverter);
  }

  public async logEvent(data: CreateAnalyticsEventDto): Promise<RepositoryResult<AnalyticsEvent>> {
    const validation = createAnalyticsEventSchema.safeParse(data);
    if (!validation.success) {
      return err(
        AppError.badRequest(
          'Validation failed for analytics event',
          validation.error.issues[0]?.path.join('.')
        )
      );
    }

    try {
      const colRef = this.getEventsCollection();
      const docRef = doc(colRef);
      const now = Date.now();

      const eventRecord: AnalyticsEvent = {
        ...validation.data,
        id: docRef.id,
        createdAt: now,
      };

      await setDoc(docRef, eventRecord);
      return ok(eventRecord);
    } catch (error) {
      return err(
        AppError.internal('Failed to record analytics event', {
          originalError: error instanceof Error ? error.message : String(error),
        })
      );
    }
  }

  public async getAppStats(appId: string): Promise<RepositoryResult<AppAnalyticsAggregate | null>> {
    if (!appId) {
      return err(AppError.badRequest('App ID is required', 'appId'));
    }

    try {
      const docRef = this.getStatsDocRef(appId);
      const snapshot = await getDoc(docRef);

      if (!snapshot.exists()) {
        return ok(null);
      }

      return ok(snapshot.data());
    } catch (error) {
      return err(
        AppError.internal('Failed to retrieve application statistics', {
          originalError: error instanceof Error ? error.message : String(error),
        })
      );
    }
  }

  public async incrementStats(
    appId: string,
    metric: 'views' | 'actions' | 'library' | 'feedback',
    amount = 1
  ): Promise<RepositoryResult<void>> {
    if (!appId) {
      return err(AppError.badRequest('App ID is required', 'appId'));
    }

    try {
      const docRef = this.getStatsDocRef(appId);
      const now = Date.now();
      const snapshot = await getDoc(docRef);

      const fieldMap = {
        views: 'viewCount',
        actions: 'actionCount',
        library: 'libraryCount',
        feedback: 'feedbackCount',
      } as const;

      const targetField = fieldMap[metric];

      if (!snapshot.exists()) {
        const initialStats: AppAnalyticsAggregate = {
          id: appId,
          appId,
          viewCount: metric === 'views' ? amount : 0,
          uniqueViewCount: metric === 'views' ? amount : 0,
          actionCount: metric === 'actions' ? amount : 0,
          libraryCount: metric === 'library' ? amount : 0,
          feedbackCount: metric === 'feedback' ? amount : 0,
          averageRating: 0,
          ratingCount: 0,
          lastViewedAt: metric === 'views' ? now : undefined,
          lastActionAt: metric === 'actions' ? now : undefined,
          updatedAt: now,
        };
        await setDoc(docRef, initialStats);
      } else {
        const updatePayload: Record<string, unknown> = {
          [targetField]: increment(amount),
          updatedAt: now,
        };

        if (metric === 'views') {
          updatePayload.lastViewedAt = now;
        } else if (metric === 'actions') {
          updatePayload.lastActionAt = now;
        }

        await updateDoc(docRef, updatePayload);
      }

      return ok(undefined);
    } catch (error) {
      return err(
        AppError.internal('Failed to increment application statistics', {
          originalError: error instanceof Error ? error.message : String(error),
        })
      );
    }
  }

  public async listEvents(
    appId?: string,
    options?: QueryOptions
  ): PaginatedRepositoryResult<AnalyticsEvent> {
    try {
      const colRef = this.getEventsCollection();
      const constraints: QueryConstraint[] = [];

      if (appId) {
        constraints.push(where('appId', '==', appId));
      }

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

      const items: AnalyticsEvent[] = [];
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
        AppError.internal('Failed to list analytics events', {
          originalError: error instanceof Error ? error.message : String(error),
        })
      );
    }
  }
}

export const analyticsRepository = new FirestoreAnalyticsRepository();
