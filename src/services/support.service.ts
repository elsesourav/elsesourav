import type { ISupportRepository } from '@/repositories/interfaces';
import { supportRepository } from '@/repositories/support.repository';
import type {
  SupportTicket,
  SupportTicketMessage,
  SupportTicketStatus,
  SupportTicketPriority,
  CreateSupportTicketDto,
} from '@/types/support.types';
import type { UserRole } from '@/types/user.types';
import type { QueryOptions, PaginatedResult } from '@/repositories/types';
import {
  createSupportTicketSchema,
  createSupportMessageSchema,
  updateSupportTicketStatusSchema,
  updateSupportTicketPrioritySchema,
  VALID_STATUS_TRANSITIONS,
  type CreateSupportTicketInput,
} from '@/schemas/support.schema';
import { ok, err } from '@/lib/result';
import { AppError } from '@/lib/errors';
import type { Result } from '@/types/result.types';

export interface UserContext {
  readonly id: string;
  readonly email?: string;
  readonly name?: string;
  readonly role?: UserRole;
}

export interface ISupportService {
  createTicket(
    input: CreateSupportTicketInput,
    user: UserContext
  ): Promise<Result<SupportTicket, AppError>>;
  getTicket(
    ticketId: string,
    currentUser: UserContext
  ): Promise<Result<SupportTicket | null, AppError>>;
  listUserTickets(
    userId: string,
    currentUser: UserContext,
    options?: QueryOptions
  ): Promise<Result<PaginatedResult<SupportTicket>, AppError>>;
  listAdminTickets(
    currentUser: UserContext,
    options?: QueryOptions
  ): Promise<Result<PaginatedResult<SupportTicket>, AppError>>;
  updateTicketStatus(
    ticketId: string,
    status: SupportTicketStatus,
    currentUser: UserContext
  ): Promise<Result<SupportTicket, AppError>>;
  updateTicketPriority(
    ticketId: string,
    priority: SupportTicketPriority,
    currentUser: UserContext
  ): Promise<Result<SupportTicket, AppError>>;
  addMessage(
    input: { ticketId: string; message: string; attachments?: readonly string[] },
    currentUser: UserContext
  ): Promise<Result<SupportTicketMessage, AppError>>;
  listMessages(
    ticketId: string,
    currentUser: UserContext,
    options?: QueryOptions
  ): Promise<Result<PaginatedResult<SupportTicketMessage>, AppError>>;
  closeTicket(ticketId: string, currentUser: UserContext): Promise<Result<SupportTicket, AppError>>;
  reopenTicket(
    ticketId: string,
    currentUser: UserContext
  ): Promise<Result<SupportTicket, AppError>>;
}

/**
 * Core Support Ticket System Domain Service
 */
export class SupportService implements ISupportService {
  constructor(private readonly supportRepo: ISupportRepository = supportRepository) {}

  public async createTicket(
    input: CreateSupportTicketInput,
    user: UserContext
  ): Promise<Result<SupportTicket, AppError>> {
    if (!user || !user.id) {
      return err(AppError.unauthorized('You must be signed in to create a support ticket.'));
    }

    const validated = createSupportTicketSchema.safeParse(input);
    if (!validated.success) {
      const issue = validated.error.issues[0];
      return err(
        AppError.validation(issue?.message || 'Invalid support ticket data', issue?.path.join('.'))
      );
    }

    // Protect High Priority: Only admins can initially create HIGH priority tickets directly
    let priority: SupportTicketPriority = validated.data.priority || 'normal';
    if (priority === 'high' && user.role !== 'admin') {
      priority = 'normal';
    }

    const ticketDto: CreateSupportTicketDto & { userId: string } = {
      userId: user.id,
      subject: validated.data.subject,
      description: validated.data.description,
      category: validated.data.category,
      priority,
      relatedAppId: validated.data.relatedAppId,
      relatedHelpArticleId: validated.data.relatedHelpArticleId,
      userEmail: user.email || validated.data.userEmail,
      userName: user.name || validated.data.userName,
    };

    const createRes = await this.supportRepo.createTicket(ticketDto);
    if (!createRes.success) {
      return createRes;
    }

    const createdTicket = createRes.data;

    // Automatically create the initial opening message in the ticket thread
    await this.supportRepo.addMessage({
      ticketId: createdTicket.id,
      senderUserId: user.id,
      senderRole: user.role === 'admin' ? 'admin' : 'user',
      senderName: user.name || (user.role === 'admin' ? 'Support Team' : 'Author'),
      message: validated.data.description,
      attachments: [],
    });

    return ok(createdTicket);
  }

  public async getTicket(
    ticketId: string,
    currentUser: UserContext
  ): Promise<Result<SupportTicket | null, AppError>> {
    if (!ticketId) {
      return err(AppError.badRequest('Ticket ID is required', 'ticketId'));
    }

    if (!currentUser || !currentUser.id) {
      return err(AppError.unauthorized('Authentication required to access support tickets.'));
    }

    const res = await this.supportRepo.getTicket(ticketId);
    if (!res.success) {
      return res;
    }

    if (!res.data) {
      return ok(null);
    }

    // Access control: Admin or ticket owner only
    const isAdmin = currentUser.role === 'admin';
    const isOwner = res.data.userId === currentUser.id;

    if (!isAdmin && !isOwner) {
      return err(AppError.forbidden('You do not have permission to view this ticket.'));
    }

    return res;
  }

  public async listUserTickets(
    userId: string,
    currentUser: UserContext,
    options?: QueryOptions
  ): Promise<Result<PaginatedResult<SupportTicket>, AppError>> {
    if (!userId) {
      return err(AppError.badRequest('User ID is required', 'userId'));
    }

    if (!currentUser || !currentUser.id) {
      return err(AppError.unauthorized('Authentication required.'));
    }

    const isAdmin = currentUser.role === 'admin';
    const isOwner = userId === currentUser.id;

    if (!isAdmin && !isOwner) {
      return err(AppError.forbidden('Access denied. You cannot view tickets for another user.'));
    }

    return this.supportRepo.listUserTickets(userId, options);
  }

  public async listAdminTickets(
    currentUser: UserContext,
    options?: QueryOptions
  ): Promise<Result<PaginatedResult<SupportTicket>, AppError>> {
    if (!currentUser || currentUser.role !== 'admin') {
      return err(AppError.forbidden('Admin permissions required to view all support tickets.'));
    }

    return this.supportRepo.listAdminTickets(options);
  }

  public async updateTicketStatus(
    ticketId: string,
    status: SupportTicketStatus,
    currentUser: UserContext
  ): Promise<Result<SupportTicket, AppError>> {
    if (!ticketId) {
      return err(AppError.badRequest('Ticket ID is required', 'ticketId'));
    }

    if (!currentUser || !currentUser.id) {
      return err(AppError.unauthorized('Authentication required.'));
    }

    const validated = updateSupportTicketStatusSchema.safeParse({ status });
    if (!validated.success) {
      return err(AppError.validation('Invalid support ticket status', 'status'));
    }

    const ticketRes = await this.supportRepo.getTicket(ticketId);
    if (!ticketRes.success) {
      return ticketRes;
    }

    if (!ticketRes.data) {
      return err(AppError.notFound('Support Ticket', ticketId));
    }

    const ticket = ticketRes.data;
    const isAdmin = currentUser.role === 'admin';
    const isOwner = ticket.userId === currentUser.id;

    if (!isAdmin && !isOwner) {
      return err(AppError.forbidden('You do not have permission to modify this ticket.'));
    }

    // Normal users can only mark their own tickets as 'resolved' or 'closed'
    if (!isAdmin && status !== 'resolved' && status !== 'closed') {
      return err(AppError.forbidden('Normal users can only mark tickets as resolved or closed.'));
    }

    // Validate Status Transitions
    const allowedTransitions = VALID_STATUS_TRANSITIONS[ticket.status] || [];
    if (!allowedTransitions.includes(status) && ticket.status !== status) {
      return err(
        AppError.badRequest(
          `Invalid status transition from "${ticket.status}" to "${status}". Allowed: ${allowedTransitions.join(
            ', '
          )}`
        )
      );
    }

    return this.supportRepo.updateTicketStatus(ticketId, status);
  }

  public async updateTicketPriority(
    ticketId: string,
    priority: SupportTicketPriority,
    currentUser: UserContext
  ): Promise<Result<SupportTicket, AppError>> {
    if (!ticketId) {
      return err(AppError.badRequest('Ticket ID is required', 'ticketId'));
    }

    if (!currentUser || currentUser.role !== 'admin') {
      return err(AppError.forbidden('Only administrators can update ticket priority.'));
    }

    const validated = updateSupportTicketPrioritySchema.safeParse({ priority });
    if (!validated.success) {
      return err(AppError.validation('Invalid support ticket priority', 'priority'));
    }

    const ticketRes = await this.supportRepo.getTicket(ticketId);
    if (!ticketRes.success) {
      return ticketRes;
    }

    if (!ticketRes.data) {
      return err(AppError.notFound('Support Ticket', ticketId));
    }

    return this.supportRepo.updatePriority(ticketId, priority);
  }

  public async addMessage(
    input: { ticketId: string; message: string; attachments?: readonly string[] },
    currentUser: UserContext
  ): Promise<Result<SupportTicketMessage, AppError>> {
    if (!currentUser || !currentUser.id) {
      return err(AppError.unauthorized('Authentication required to send messages.'));
    }

    const senderRole: UserRole = currentUser.role === 'admin' ? 'admin' : 'user';
    const validated = createSupportMessageSchema.safeParse({
      ticketId: input.ticketId,
      message: input.message,
      senderUserId: currentUser.id,
      senderRole,
      senderName: currentUser.name,
      attachments: input.attachments,
    });

    if (!validated.success) {
      const issue = validated.error.issues[0];
      return err(
        AppError.validation(issue?.message || 'Invalid message format', issue?.path.join('.'))
      );
    }

    const ticketRes = await this.supportRepo.getTicket(input.ticketId);
    if (!ticketRes.success) {
      return ticketRes as unknown as Result<SupportTicketMessage, AppError>;
    }

    if (!ticketRes.data) {
      return err(AppError.notFound('Support Ticket', input.ticketId));
    }

    const ticket = ticketRes.data;
    const isAdmin = currentUser.role === 'admin';
    const isOwner = ticket.userId === currentUser.id;

    if (!isAdmin && !isOwner) {
      return err(AppError.forbidden('You do not have permission to post messages on this ticket.'));
    }

    if (ticket.status === 'closed' && !isAdmin) {
      return err(
        AppError.badRequest(
          'This ticket is closed. Please create a new ticket or request support to reopen it.'
        )
      );
    }

    const senderName = currentUser.name || (isAdmin ? 'ElseSourav Support' : 'Author');

    const messageRes = await this.supportRepo.addMessage({
      ticketId: input.ticketId,
      senderUserId: currentUser.id,
      senderRole,
      senderName,
      message: input.message,
      attachments: input.attachments,
    });

    if (!messageRes.success) {
      return messageRes;
    }

    // Auto-advance workflow status
    if (isAdmin && (ticket.status === 'open' || ticket.status === 'in_progress')) {
      await this.supportRepo.updateTicketStatus(ticket.id, 'waiting_for_user');
    } else if (!isAdmin && ticket.status === 'waiting_for_user') {
      await this.supportRepo.updateTicketStatus(ticket.id, 'in_progress');
    } else if (isAdmin && ticket.status === 'closed') {
      // Admin replying to a closed ticket reopens it
      await this.supportRepo.updateTicketStatus(ticket.id, 'open');
    }

    return messageRes;
  }

  public async listMessages(
    ticketId: string,
    currentUser: UserContext,
    options?: QueryOptions
  ): Promise<Result<PaginatedResult<SupportTicketMessage>, AppError>> {
    if (!ticketId) {
      return err(AppError.badRequest('Ticket ID is required', 'ticketId'));
    }

    if (!currentUser || !currentUser.id) {
      return err(AppError.unauthorized('Authentication required to view ticket messages.'));
    }

    const ticketRes = await this.supportRepo.getTicket(ticketId);
    if (!ticketRes.success) {
      return ticketRes as unknown as Result<PaginatedResult<SupportTicketMessage>, AppError>;
    }

    if (!ticketRes.data) {
      return err(AppError.notFound('Support Ticket', ticketId));
    }

    const ticket = ticketRes.data;
    const isAdmin = currentUser.role === 'admin';
    const isOwner = ticket.userId === currentUser.id;

    if (!isAdmin && !isOwner) {
      return err(AppError.forbidden('You do not have permission to view this ticket messages.'));
    }

    return this.supportRepo.listMessages(ticketId, options);
  }

  public async closeTicket(
    ticketId: string,
    currentUser: UserContext
  ): Promise<Result<SupportTicket, AppError>> {
    return this.updateTicketStatus(ticketId, 'closed', currentUser);
  }

  public async reopenTicket(
    ticketId: string,
    currentUser: UserContext
  ): Promise<Result<SupportTicket, AppError>> {
    if (!currentUser || currentUser.role !== 'admin') {
      return err(AppError.forbidden('Only administrators can reopen closed tickets.'));
    }

    return this.supportRepo.reopenTicket(ticketId);
  }
}

/**
 * Default singleton service instance
 */
export const supportService = new SupportService(supportRepository);
