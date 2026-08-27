import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  orderBy,
  limit as firestoreLimit,
  startAfter,
  getDocs,
  type Firestore,
  type QueryConstraint,
  type DocumentSnapshot,
} from 'firebase/firestore';
import { getFirebaseFirestore } from '@/firebase/client';
import { createFirestoreConverter } from './converters';
import {
  submitFeedbackSchema,
  updateFeedbackSchema,
  moderateFeedbackSchema,
} from '@/schemas/feedback.schema';
import { ok, err } from '@/lib/result';
import { AppError } from '@/lib/errors';
import type { IFeedbackRepository } from './interfaces';
import type {
  AppFeedback,
  AppRatingAggregate,
  FeedbackModerationStatus,
} from '@/types/feedback.types';
import type { RepositoryResult, PaginatedRepositoryResult, QueryOptions } from './types';
import type { z } from 'zod';

export type SubmitFeedbackDto = z.infer<typeof submitFeedbackSchema>;
export type UpdateFeedbackDto = z.infer<typeof updateFeedbackSchema>;
export type ModerateFeedbackDto = z.infer<typeof moderateFeedbackSchema>;

export class FirestoreFeedbackRepository implements IFeedbackRepository {
  private readonly feedbackConverter = createFirestoreConverter<AppFeedback>();
  private readonly ratingConverter = createFirestoreConverter<AppRatingAggregate>();

  constructor(private readonly getFirestoreInstance: () => Firestore = getFirebaseFirestore) {}

  private getFeedbackDocRef(feedbackId: string) {
    const db = this.getFirestoreInstance();
    return doc(db, 'feedback', feedbackId).withConverter(this.feedbackConverter);
  }

  private getRatingsDocRef(appId: string) {
    const db = this.getFirestoreInstance();
    return doc(db, 'appRatings', appId).withConverter(this.ratingConverter);
  }

  private getFeedbackCollection() {
    const db = this.getFirestoreInstance();
    return collection(db, 'feedback').withConverter(this.feedbackConverter);
  }

  public getDeterministicId(userId: string, appId: string): string {
    return `${userId}_${appId}`;
  }

  public async submitFeedback(
    userId: string,
    data: SubmitFeedbackDto,
    userInfo?: { displayName?: string; photoUrl?: string }
  ): Promise<RepositoryResult<AppFeedback>> {
    if (!userId) {
      return err(AppError.unauthorized('User ID is required to submit feedback'));
    }

    const validation = submitFeedbackSchema.safeParse(data);
    if (!validation.success) {
      return err(
        AppError.badRequest(
          'Validation failed for feedback submission',
          validation.error.issues[0]?.path.join('.')
        )
      );
    }

    const feedbackId = this.getDeterministicId(userId, validation.data.appId);
    const docRef = this.getFeedbackDocRef(feedbackId);
    const now = Date.now();

    try {
      const existingDoc = await getDoc(docRef);
      let feedbackRecord: AppFeedback;

      if (existingDoc.exists()) {
        const existingData = existingDoc.data();
        feedbackRecord = {
          ...existingData,
          rating: validation.data.rating,
          message: validation.data.message,
          userDisplayName: userInfo?.displayName || existingData.userDisplayName,
          userPhotoUrl: userInfo?.photoUrl || existingData.userPhotoUrl,
          updatedAt: now,
        };
        await updateDoc(docRef, feedbackRecord as unknown as Record<string, unknown>);
      } else {
        feedbackRecord = {
          id: feedbackId,
          userId,
          appId: validation.data.appId,
          rating: validation.data.rating,
          message: validation.data.message,
          userDisplayName: userInfo?.displayName || validation.data.userDisplayName,
          userPhotoUrl: userInfo?.photoUrl || validation.data.userPhotoUrl,
          status: 'pending',
          createdAt: now,
          updatedAt: now,
        };
        await setDoc(docRef, feedbackRecord);
      }

      return ok(feedbackRecord);
    } catch (error) {
      return err(
        AppError.internal('Failed to save feedback record', {
          originalError: error instanceof Error ? error.message : String(error),
        })
      );
    }
  }

  public async updateFeedback(
    userId: string,
    appId: string,
    data: UpdateFeedbackDto
  ): Promise<RepositoryResult<AppFeedback>> {
    if (!userId || !appId) {
      return err(AppError.badRequest('User ID and App ID are required', 'appId'));
    }

    const validation = updateFeedbackSchema.safeParse(data);
    if (!validation.success) {
      return err(
        AppError.badRequest(
          'Validation failed for feedback update',
          validation.error.issues[0]?.path.join('.')
        )
      );
    }

    const feedbackId = this.getDeterministicId(userId, appId);
    const docRef = this.getFeedbackDocRef(feedbackId);

    try {
      const snapshot = await getDoc(docRef);
      if (!snapshot.exists()) {
        return err(AppError.notFound('Feedback record not found'));
      }

      const existing = snapshot.data();
      if (existing.userId !== userId) {
        return err(AppError.forbidden('You can only update your own feedback'));
      }

      const updatedRecord: AppFeedback = {
        ...existing,
        rating: validation.data.rating !== undefined ? validation.data.rating : existing.rating,
        message: validation.data.message !== undefined ? validation.data.message : existing.message,
        updatedAt: Date.now(),
      };

      await updateDoc(docRef, updatedRecord as unknown as Record<string, unknown>);
      return ok(updatedRecord);
    } catch (error) {
      return err(
        AppError.internal('Failed to update feedback record', {
          originalError: error instanceof Error ? error.message : String(error),
        })
      );
    }
  }

  public async getUserFeedback(
    userId: string,
    appId: string
  ): Promise<RepositoryResult<AppFeedback | null>> {
    if (!userId || !appId) {
      return ok(null);
    }

    const feedbackId = this.getDeterministicId(userId, appId);
    const docRef = this.getFeedbackDocRef(feedbackId);

    try {
      const snapshot = await getDoc(docRef);
      if (!snapshot.exists()) {
        return ok(null);
      }
      return ok(snapshot.data());
    } catch (error) {
      return err(
        AppError.internal('Failed to query user feedback', {
          originalError: error instanceof Error ? error.message : String(error),
        })
      );
    }
  }

  public async listApprovedByApp(
    appId: string,
    options?: QueryOptions
  ): PaginatedRepositoryResult<AppFeedback> {
    if (!appId) {
      return err(AppError.badRequest('App ID is required', 'appId'));
    }

    try {
      const colRef = this.getFeedbackCollection();
      const constraints: QueryConstraint[] = [
        where('appId', '==', appId),
        where('status', '==', 'approved'),
        orderBy(options?.orderBy || 'createdAt', options?.orderDirection || 'desc'),
      ];

      if (options?.startAfterDoc) {
        constraints.push(startAfter(options.startAfterDoc as DocumentSnapshot));
      }

      const queryLimit = options?.limit || 20;
      constraints.push(firestoreLimit(queryLimit + 1));

      const q = query(colRef, ...constraints);
      const snapshot = await getDocs(q);

      const items: AppFeedback[] = [];
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
        AppError.internal('Failed to list approved reviews for app', {
          originalError: error instanceof Error ? error.message : String(error),
        })
      );
    }
  }

  public async listAllForModeration(
    options?: QueryOptions
  ): PaginatedRepositoryResult<AppFeedback> {
    try {
      const colRef = this.getFeedbackCollection();
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

      const items: AppFeedback[] = [];
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
        AppError.internal('Failed to list feedback for moderation', {
          originalError: error instanceof Error ? error.message : String(error),
        })
      );
    }
  }

  public async moderate(
    feedbackId: string,
    status: FeedbackModerationStatus,
    adminId: string
  ): Promise<RepositoryResult<AppFeedback>> {
    const validation = moderateFeedbackSchema.safeParse({ status });
    if (!validation.success) {
      return err(AppError.badRequest('Invalid moderation status', 'status'));
    }

    const docRef = this.getFeedbackDocRef(feedbackId);

    try {
      const snapshot = await getDoc(docRef);
      if (!snapshot.exists()) {
        return err(AppError.notFound('Feedback record not found'));
      }

      const existing = snapshot.data();
      const updated: AppFeedback = {
        ...existing,
        status: validation.data.status,
        moderatedAt: Date.now(),
        moderatedBy: adminId,
        updatedAt: Date.now(),
      };

      await updateDoc(docRef, updated as unknown as Record<string, unknown>);
      return ok(updated);
    } catch (error) {
      return err(
        AppError.internal('Failed to moderate feedback record', {
          originalError: error instanceof Error ? error.message : String(error),
        })
      );
    }
  }

  public async deleteFeedback(userId: string, appId: string): Promise<RepositoryResult<void>> {
    if (!userId || !appId) {
      return err(AppError.badRequest('User ID and App ID are required', 'appId'));
    }

    const feedbackId = this.getDeterministicId(userId, appId);
    const docRef = this.getFeedbackDocRef(feedbackId);

    try {
      await deleteDoc(docRef);
      return ok(undefined);
    } catch (error) {
      return err(
        AppError.internal('Failed to delete feedback record', {
          originalError: error instanceof Error ? error.message : String(error),
        })
      );
    }
  }

  public async getAppRatingAggregate(
    appId: string
  ): Promise<RepositoryResult<AppRatingAggregate | null>> {
    if (!appId) {
      return err(AppError.badRequest('App ID is required', 'appId'));
    }

    try {
      const docRef = this.getRatingsDocRef(appId);
      const snapshot = await getDoc(docRef);

      if (!snapshot.exists()) {
        return ok(null);
      }

      return ok(snapshot.data());
    } catch (error) {
      return err(
        AppError.internal('Failed to get app rating aggregate', {
          originalError: error instanceof Error ? error.message : String(error),
        })
      );
    }
  }

  public async updateAppRatingAggregate(
    appId: string,
    oldRating: number | null,
    newRating: number | null
  ): Promise<RepositoryResult<AppRatingAggregate>> {
    if (!appId) {
      return err(AppError.badRequest('App ID is required', 'appId'));
    }

    const docRef = this.getRatingsDocRef(appId);
    const now = Date.now();

    try {
      const snapshot = await getDoc(docRef);
      let aggregate: AppRatingAggregate;

      if (!snapshot.exists()) {
        const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        if (newRating && newRating >= 1 && newRating <= 5) {
          distribution[newRating as 1 | 2 | 3 | 4 | 5] = 1;
        }

        aggregate = {
          id: appId,
          appId,
          ratingCount: newRating ? 1 : 0,
          averageRating: newRating ? newRating : 0,
          distribution,
          updatedAt: now,
        };

        await setDoc(docRef, aggregate);
      } else {
        const existing = snapshot.data();
        const distribution = { ...existing.distribution };

        if (oldRating && oldRating >= 1 && oldRating <= 5) {
          const key = oldRating as 1 | 2 | 3 | 4 | 5;
          distribution[key] = Math.max(0, distribution[key] - 1);
        }

        if (newRating && newRating >= 1 && newRating <= 5) {
          const key = newRating as 1 | 2 | 3 | 4 | 5;
          distribution[key] = (distribution[key] || 0) + 1;
        }

        const totalCount =
          distribution[1] + distribution[2] + distribution[3] + distribution[4] + distribution[5];

        const totalScore =
          distribution[1] * 1 +
          distribution[2] * 2 +
          distribution[3] * 3 +
          distribution[4] * 4 +
          distribution[5] * 5;

        const averageRating = totalCount > 0 ? Number((totalScore / totalCount).toFixed(2)) : 0;

        aggregate = {
          ...existing,
          ratingCount: totalCount,
          averageRating,
          distribution,
          updatedAt: now,
        };

        await updateDoc(docRef, aggregate as unknown as Record<string, unknown>);
      }

      return ok(aggregate);
    } catch (error) {
      return err(
        AppError.internal('Failed to update app rating aggregate', {
          originalError: error instanceof Error ? error.message : String(error),
        })
      );
    }
  }
}

export const feedbackRepository = new FirestoreFeedbackRepository();
