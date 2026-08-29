import { AppError } from '@elsesourav/types';
import { generateTicketNumber } from '@elsesourav/validation';
import type { SupportRepository } from '../repositories/support.repository';
import type {
  SupportTicketListItem,
  SupportTicketDetail,
  SupportTicketMessage,
  SupportTicketStatus,
  CreateSupportTicketInput,
  UserRole,
} from '@elsesourav/types';

export class SupportService {
  constructor(private readonly supportRepo: SupportRepository) {}

  private verifyAdmin(callerRole?: UserRole | string): void {
    if (callerRole !== 'ADMIN' && callerRole !== 'STAFF') {
      throw AppError.forbidden('Administrative privileges are required for this action.');
    }
  }

  /**
   * Retrieves list of tickets belonging to the authenticated user
   */
  async getUserTickets(userId: string, limit = 20): Promise<SupportTicketListItem[]> {
    if (!userId) {
      throw AppError.unauthorized('User must be authenticated to view support tickets.');
    }
    return this.supportRepo.findUserTickets(userId, limit);
  }

  /**
   * Retrieves a ticket detail with server-side ownership enforcement
   */
  async getTicketDetail(
    callerUserId: string,
    callerRole: UserRole,
    ticketId: string
  ): Promise<SupportTicketDetail> {
    if (!callerUserId) {
      throw AppError.unauthorized('User must be authenticated.');
    }

    const forAdmin = callerRole === 'ADMIN' || callerRole === 'STAFF';
    const ticket = await this.supportRepo.findTicketDetail(ticketId, forAdmin);

    if (!ticket) {
      throw AppError.notFound(`Support ticket '${ticketId}' was not found.`);
    }

    const isOwner = ticket.userId === callerUserId;
    if (!isOwner && !forAdmin) {
      throw AppError.forbidden('You do not have permission to view this support ticket.');
    }

    return ticket;
  }

  /**
   * Creates a new support ticket for the authenticated user
   */
  async createTicket(
    callerUserId: string,
    input: Omit<CreateSupportTicketInput, 'userId'>
  ): Promise<SupportTicketDetail> {
    if (!callerUserId) {
      throw AppError.unauthorized('User must be authenticated to create a support ticket.');
    }

    const ticketNumber = generateTicketNumber();
    return this.supportRepo.createTicket(
      {
        ...input,
        userId: callerUserId,
      },
      ticketNumber
    );
  }

  /**
   * Adds a reply message to an existing ticket
   */
  async replyToTicket(
    callerUserId: string,
    callerRole: UserRole,
    ticketId: string,
    message: string,
    attachments?: string[],
    isInternalNote: boolean = false
  ): Promise<SupportTicketMessage> {
    if (!callerUserId) {
      throw AppError.unauthorized('User must be authenticated to reply.');
    }

    const forAdmin = callerRole === 'ADMIN' || callerRole === 'STAFF';
    const ticket = await this.supportRepo.findTicketDetail(ticketId, forAdmin);

    if (!ticket) {
      throw AppError.notFound(`Support ticket '${ticketId}' was not found.`);
    }

    const isOwner = ticket.userId === callerUserId;
    if (!isOwner && !forAdmin) {
      throw AppError.forbidden('You do not have permission to reply to this ticket.');
    }

    // Only admin/staff can post internal notes
    const effectiveInternalNote = forAdmin ? isInternalNote : false;

    return this.supportRepo.addMessage({
      ticketId,
      senderUserId: callerUserId,
      senderRole: callerRole,
      message,
      attachments,
      isInternalNote: effectiveInternalNote,
    });
  }

  /**
   * Closes a support ticket
   */
  async closeTicket(callerUserId: string, callerRole: UserRole, ticketId: string): Promise<void> {
    await this.getTicketDetail(callerUserId, callerRole, ticketId);
    await this.supportRepo.updateTicketStatus(ticketId, 'closed');
  }

  /**
   * Reopens a support ticket
   */
  async reopenTicket(callerUserId: string, callerRole: UserRole, ticketId: string): Promise<void> {
    await this.getTicketDetail(callerUserId, callerRole, ticketId);
    await this.supportRepo.updateTicketStatus(ticketId, 'open');
  }

  /**
   * Retrieves all tickets for Admin portal with filtering
   */
  async getAllTicketsAdmin(
    callerRole: UserRole,
    options: {
      status?: SupportTicketStatus;
      category?: string;
      search?: string;
      limit?: number;
    } = {}
  ): Promise<SupportTicketListItem[]> {
    this.verifyAdmin(callerRole);
    return this.supportRepo.findAllTickets(options);
  }

  /**
   * Updates ticket status from Admin workspace
   */
  async updateTicketStatusAdmin(
    callerRole: UserRole,
    ticketId: string,
    status: SupportTicketStatus
  ): Promise<void> {
    this.verifyAdmin(callerRole);
    await this.supportRepo.updateTicketStatus(ticketId, status);
  }
}
