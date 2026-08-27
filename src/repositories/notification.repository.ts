import {
  type Firestore,
  collection,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy as firestoreOrderBy,
  limit as firestoreLimit,
  startAfter as firestoreStartAfter,
  addDoc,
  updateDoc,
  writeBatch,
  getCountFromServer,
  onSnapshot,
} from 'firebase/firestore';
import { FirestoreRepository } from './firestore.repository';
import type { INotificationRepository } from './interfaces';
import type { Notification } from '@/types/notification.types';
import type { RepositoryResult, PaginatedRepositoryResult, QueryOptions } from './types';
import {
  createNotificationSchema,
  updateNotificationSchema,
  type CreateNotificationInput,
  type UpdateNotificationInput,
} from '@/schemas/notification.schema';
import { ok, err } from '@/lib/result';
import { AppError } from '@/lib/errors';
import { getFirebaseFirestore } from '@/firebase';

export type CreateNotificationDto = CreateNotificationInput;
export type UpdateNotificationDto = UpdateNotificationInput;

/**
 * Production Cloud Firestore Notification Repository Implementation
 */
export class NotificationRepository
  extends FirestoreRepository<Notification, CreateNotificationInput, UpdateNotificationInput>
  implements INotificationRepository
{
  constructor(getFirestoreInstance?: () => Firestore) {
    super('notifications', {
      createSchema: createNotificationSchema,
      updateSchema: updateNotificationSchema,
      getFirestore: getFirestoreInstance,
    });
  }

  /**
   * List notifications for a specific user using cursor-based pagination
   */
  public async listUserNotifications(
    userId: string,
    options: QueryOptions = {}
  ): PaginatedRepositoryResult<Notification> {
    if (!userId) {
      return err(AppError.badRequest('User ID is required to fetch notifications.'));
    }

    try {
      const db = this.getFirestoreInstance();
      const notifsCol = collection(db, 'notifications');
      const pageSize = options.limit || 20;

      const constraints: unknown[] = [
        where('userId', '==', userId),
        firestoreOrderBy('createdAt', 'desc'),
      ];

      if (options.startAfterCursor) {
        constraints.push(firestoreStartAfter(options.startAfterCursor));
      }

      constraints.push(firestoreLimit(pageSize + 1));

      const q = query(notifsCol, ...(constraints as Parameters<typeof query>[1][]));
      const snapshot = await getDocs(q);

      const items: Notification[] = [];
      snapshot.docs.forEach((d) => {
        const data = d.data();
        items.push({
          id: d.id,
          userId: data.userId,
          type: data.type,
          severity: data.severity,
          title: data.title,
          message: data.message,
          link: data.link || data.linkUrl,
          linkUrl: data.linkUrl || data.link,
          relatedAppId: data.relatedAppId,
          relatedTicketId: data.relatedTicketId,
          read: data.read ?? data.isRead ?? false,
          isRead: data.read ?? data.isRead ?? false,
          readAt: data.readAt,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt || data.createdAt,
          expiresAt: data.expiresAt,
        });
      });

      const hasMore = items.length > pageSize;
      if (hasMore) {
        items.pop();
      }

      const nextCursor = items.length > 0 ? items[items.length - 1]?.createdAt : undefined;

      return ok({
        items,
        hasMore,
        nextCursor: nextCursor ? String(nextCursor) : undefined,
      });
    } catch (error) {
      return err(this.handleFirestoreError(error, `list notifications for user "${userId}"`));
    }
  }

  /**
   * Compute unread count efficiently via Firestore aggregation count without loading full documents
   */
  public async getUnreadCount(userId: string): RepositoryResult<number> {
    if (!userId) {
      return ok(0);
    }

    try {
      const db = this.getFirestoreInstance();
      const notifsCol = collection(db, 'notifications');
      const q = query(notifsCol, where('userId', '==', userId), where('read', '==', false));

      const countSnapshot = await getCountFromServer(q);
      return ok(countSnapshot.data().count);
    } catch (error) {
      return err(this.handleFirestoreError(error, `get unread count for user "${userId}"`));
    }
  }

  /**
   * Mark a single user notification as read
   */
  public async markAsRead(userId: string, notificationId: string): RepositoryResult<Notification> {
    if (!userId || !notificationId) {
      return err(AppError.badRequest('User ID and Notification ID are required.'));
    }

    try {
      const db = this.getFirestoreInstance();
      const docRef = doc(db, 'notifications', notificationId);
      const snapshot = await getDoc(docRef);

      if (!snapshot.exists()) {
        return err(AppError.notFound('Notification not found.'));
      }

      const data = snapshot.data();
      if (data.userId !== userId) {
        return err(AppError.forbidden('You are not authorized to update this notification.'));
      }

      const now = Date.now();
      await updateDoc(docRef, {
        read: true,
        isRead: true,
        readAt: now,
      });

      return ok({
        id: snapshot.id,
        userId: data.userId,
        type: data.type,
        severity: data.severity,
        title: data.title,
        message: data.message,
        link: data.link || data.linkUrl,
        linkUrl: data.linkUrl || data.link,
        relatedAppId: data.relatedAppId,
        relatedTicketId: data.relatedTicketId,
        read: true,
        isRead: true,
        readAt: now,
        createdAt: data.createdAt,
        updatedAt: now,
        expiresAt: data.expiresAt,
      });
    } catch (error) {
      return err(this.handleFirestoreError(error, `mark notification "${notificationId}" as read`));
    }
  }

  /**
   * Mark all unread notifications as read for a given user in a batch
   */
  public async markAllAsRead(userId: string): RepositoryResult<number> {
    if (!userId) {
      return ok(0);
    }

    try {
      const db = this.getFirestoreInstance();
      const notifsCol = collection(db, 'notifications');
      const q = query(notifsCol, where('userId', '==', userId), where('read', '==', false));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        return ok(0);
      }

      const batch = writeBatch(db);
      const now = Date.now();

      snapshot.docs.forEach((d) => {
        batch.update(d.ref, {
          read: true,
          isRead: true,
          readAt: now,
        });
      });

      await batch.commit();
      return ok(snapshot.size);
    } catch (error) {
      return err(
        this.handleFirestoreError(error, `mark all notifications as read for user "${userId}"`)
      );
    }
  }

  /**
   * Create a notification for a user (called by trusted system workflows)
   */
  public async createForUser(data: CreateNotificationInput): RepositoryResult<Notification> {
    const validation = createNotificationSchema.safeParse(data);
    if (!validation.success) {
      return err(
        AppError.validation(
          validation.error.issues[0]?.message || 'Invalid notification payload',
          'notification',
          validation.error.issues
        )
      );
    }

    try {
      const db = this.getFirestoreInstance();
      const notifsCol = collection(db, 'notifications');
      const now = Date.now();

      const docData = {
        ...validation.data,
        read: false,
        isRead: false,
        createdAt: now,
        updatedAt: now,
      };

      const docRef = await addDoc(notifsCol, docData);

      return ok({
        id: docRef.id,
        ...docData,
      });
    } catch (error) {
      return err(this.handleFirestoreError(error, `create notification for user "${data.userId}"`));
    }
  }

  /**
   * Realtime subscription scoped strictly to the current user
   */
  public subscribeToUserNotifications(
    userId: string,
    onUpdate: (notifications: Notification[]) => void,
    onError?: (error: AppError) => void
  ): () => void {
    if (!userId) {
      return () => {};
    }

    try {
      const db = this.getFirestoreInstance();
      const notifsCol = collection(db, 'notifications');
      const q = query(
        notifsCol,
        where('userId', '==', userId),
        firestoreOrderBy('createdAt', 'desc'),
        firestoreLimit(30)
      );

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const items: Notification[] = snapshot.docs.map((d) => {
            const data = d.data();
            return {
              id: d.id,
              userId: data.userId,
              type: data.type,
              severity: data.severity,
              title: data.title,
              message: data.message,
              link: data.link || data.linkUrl,
              linkUrl: data.linkUrl || data.link,
              relatedAppId: data.relatedAppId,
              relatedTicketId: data.relatedTicketId,
              read: data.read ?? data.isRead ?? false,
              isRead: data.read ?? data.isRead ?? false,
              readAt: data.readAt,
              createdAt: data.createdAt,
              updatedAt: data.updatedAt || data.createdAt,
              expiresAt: data.expiresAt,
            };
          });
          onUpdate(items);
        },
        (error) => {
          if (onError) {
            onError(
              this.handleFirestoreError(error, `subscribe to notifications for user "${userId}"`)
            );
          }
        }
      );

      return unsubscribe;
    } catch (error) {
      if (onError) {
        onError(
          this.handleFirestoreError(error, `subscribe to notifications for user "${userId}"`)
        );
      }
      return () => {};
    }
  }
}

export const notificationRepository = new NotificationRepository(getFirebaseFirestore);
