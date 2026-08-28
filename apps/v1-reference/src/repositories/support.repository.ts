import {
  type Firestore,
  collection,
  doc,
  getDocs,
  query,
  orderBy as firestoreOrderBy,
  limit as firestoreLimit,
  startAfter as firestoreStartAfter,
  addDoc,
  updateDoc,
} from 'firebase/firestore';
import { FirestoreRepository } from './firestore.repository';
import type { ISupportRepository } from './interfaces';
import type {
  SupportTicket,
  SupportTicketMessage,
  SupportTicketStatus,
  SupportTicketPriority,
  CreateSupportTicketDto,
  CreateSupportMessageDto,
} from '@/types/support.types';
import type { RepositoryResult, PaginatedRepositoryResult, QueryOptions } from './types';
import { createSupportTicketSchema, createSupportMessageSchema } from '@/schemas/support.schema';
import { ok, err } from '@/lib/result';
import { AppError } from '@/lib/errors';
import { getFirebaseFirestore } from '@/firebase';

/**
 * Support Ticket and Thread Repository Implementation
 */
export class SupportRepository
  extends FirestoreRepository<
    SupportTicket,
    CreateSupportTicketDto & {
      userId: string;
      ticketNumber?: string;
      status?: SupportTicketStatus;
    },
    Partial<SupportTicket>
  >
  implements ISupportRepository
{
  constructor(getFirestoreInstance?: () => Firestore) {
    super('supportTickets', {
      getFirestore: getFirestoreInstance,
    });
  }

  public async createTicket(
    data: CreateSupportTicketDto & { userId: string; ticketNumber?: string }
  ): RepositoryResult<SupportTicket> {
    const validated = createSupportTicketSchema.safeParse(data);
    if (!validated.success) {
      const issue = validated.error.issues[0];
      return err(
        AppError.validation(
          issue?.message || 'Invalid support ticket payload',
          issue?.path.join('.')
        )
      );
    }

    const ticketNumber =
      data.ticketNumber ||
      `#ES-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const now = Date.now();
    const payload = {
      userId: data.userId,
      ticketNumber,
      subject: validated.data.subject,
      description: validated.data.description,
      category: validated.data.category,
      priority: validated.data.priority || 'normal',
      status: 'open' as const,
      relatedAppId: validated.data.relatedAppId,
      relatedHelpArticleId: validated.data.relatedHelpArticleId,
      userEmail: validated.data.userEmail,
      userName: validated.data.userName,
      lastMessageAt: now,
      createdAt: now,
      updatedAt: now,
    };

    return this.create(payload);
  }

  public async getTicket(id: string): RepositoryResult<SupportTicket | null> {
    return this.findById(id);
  }

  public async findByUser(
    userId: string,
    options?: QueryOptions
  ): PaginatedRepositoryResult<SupportTicket> {
    return this.findMany({
      ...options,
      filters: [{ field: 'userId', operator: '==', value: userId }],
      orderBy: options?.orderBy || 'lastMessageAt',
      orderDirection: options?.orderDirection || 'desc',
    });
  }

  public async listUserTickets(
    userId: string,
    options?: QueryOptions
  ): PaginatedRepositoryResult<SupportTicket> {
    return this.findByUser(userId, options);
  }

  public async listAdminTickets(options?: QueryOptions): PaginatedRepositoryResult<SupportTicket> {
    return this.findMany({
      ...options,
      orderBy: options?.orderBy || 'lastMessageAt',
      orderDirection: options?.orderDirection || 'desc',
    });
  }

  public async findByTicketNumber(ticketNumber: string): RepositoryResult<SupportTicket | null> {
    if (!ticketNumber) {
      return ok(null);
    }

    const res = await this.findMany({
      filters: [{ field: 'ticketNumber', operator: '==', value: ticketNumber }],
      limit: 1,
    });

    if (!res.success) {
      return res;
    }

    return ok(res.data.items[0] ?? null);
  }

  public async updateTicketStatus(
    id: string,
    status: SupportTicketStatus,
    closedAt?: number
  ): RepositoryResult<SupportTicket> {
    const updateData: Record<string, unknown> = {
      status,
      updatedAt: Date.now(),
    };

    if (status === 'closed') {
      updateData.closedAt = closedAt || Date.now();
    } else if (status === 'resolved') {
      updateData.resolvedAt = Date.now();
    }

    return this.update(id, updateData as Partial<SupportTicket>);
  }

  public async updatePriority(
    id: string,
    priority: SupportTicketPriority
  ): RepositoryResult<SupportTicket> {
    return this.update(id, {
      priority,
      updatedAt: Date.now(),
    });
  }

  public async addMessage(data: CreateSupportMessageDto): RepositoryResult<SupportTicketMessage> {
    const validated = createSupportMessageSchema.safeParse(data);
    if (!validated.success) {
      const issue = validated.error.issues[0];
      return err(
        AppError.validation(
          issue?.message || 'Invalid support message payload',
          issue?.path.join('.')
        )
      );
    }

    const firestore = this.getFirestoreInstance();
    if (!firestore) {
      return err(AppError.internal('Firestore is not initialized'));
    }

    try {
      const now = Date.now();
      const messagesRef = collection(firestore, 'supportTickets', data.ticketId, 'messages');
      const messageDoc = {
        ticketId: data.ticketId,
        senderUserId: data.senderUserId,
        senderRole: data.senderRole,
        senderName: data.senderName || '',
        message: data.message,
        attachments: data.attachments || [],
        createdAt: now,
        updatedAt: now,
      };

      const docRef = await addDoc(messagesRef, messageDoc);

      // Update ticket's lastMessageAt and updatedAt timestamp
      const ticketRef = doc(firestore, 'supportTickets', data.ticketId);
      await updateDoc(ticketRef, {
        lastMessageAt: now,
        updatedAt: now,
      });

      const message: SupportTicketMessage = {
        id: docRef.id,
        ...messageDoc,
      };

      return ok(message);
    } catch (error) {
      return err(AppError.internal('Failed to add message to support ticket', error));
    }
  }

  public async listMessages(
    ticketId: string,
    options?: QueryOptions
  ): PaginatedRepositoryResult<SupportTicketMessage> {
    const firestore = this.getFirestoreInstance();
    if (!firestore) {
      return err(AppError.internal('Firestore is not initialized'));
    }

    try {
      const messagesRef = collection(firestore, 'supportTickets', ticketId, 'messages');
      const limitCount = options?.limit || 50;

      let q = query(messagesRef, firestoreOrderBy('createdAt', 'asc'), firestoreLimit(limitCount));

      if (options?.startAfterDoc) {
        q = query(
          messagesRef,
          firestoreOrderBy('createdAt', 'asc'),
          firestoreStartAfter(options.startAfterDoc),
          firestoreLimit(limitCount)
        );
      }

      const snapshot = await getDocs(q);
      const items: SupportTicketMessage[] = [];

      snapshot.forEach((docSnap) => {
        const raw = docSnap.data();
        items.push({
          id: docSnap.id,
          ticketId: raw.ticketId || ticketId,
          senderUserId: raw.senderUserId,
          senderRole: raw.senderRole || 'user',
          senderName: raw.senderName,
          message: raw.message || raw.content || '',
          attachments: raw.attachments,
          createdAt: raw.createdAt || 0,
          updatedAt: raw.updatedAt || raw.createdAt || 0,
        });
      });

      const lastVisible = snapshot.docs[snapshot.docs.length - 1];
      const hasMore = snapshot.docs.length === limitCount;

      return ok({
        items,
        hasMore,
        lastDoc: lastVisible,
        nextCursor: lastVisible ? lastVisible.id : undefined,
      });
    } catch (error) {
      return err(AppError.internal('Failed to fetch support ticket messages', error));
    }
  }

  public async getMessages(
    ticketId: string,
    options?: QueryOptions
  ): PaginatedRepositoryResult<SupportTicketMessage> {
    return this.listMessages(ticketId, options);
  }

  public async closeTicket(id: string): RepositoryResult<SupportTicket> {
    return this.updateTicketStatus(id, 'closed', Date.now());
  }

  public async reopenTicket(id: string): RepositoryResult<SupportTicket> {
    return this.updateTicketStatus(id, 'open');
  }
}

/**
 * Default singleton instance
 */
export const supportRepository = new SupportRepository(getFirebaseFirestore);
