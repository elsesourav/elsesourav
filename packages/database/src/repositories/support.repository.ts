import { PrismaClient, TicketStatus, TicketPriority } from '@prisma/client';
import { prisma as defaultPrisma } from '../client';
import { AppError } from '@elsesourav/types';
import type {
  SupportTicket as DomainSupportTicket,
  SupportTicketMessage as DomainMessage,
  CreateSupportTicketInput,
  AddSupportMessageInput,
  UserRole,
} from '@elsesourav/types';

export class SupportRepository {
  constructor(private readonly prisma: PrismaClient = defaultPrisma) {}

  async findUserTickets(userId: string, limit = 20): Promise<DomainSupportTicket[]> {
    try {
      const boundedLimit = Math.min(Math.max(limit, 1), 50);
      const records = await this.prisma.supportTicket.findMany({
        where: { userId },
        take: boundedLimit,
        orderBy: { lastMessageAt: 'desc' },
        include: { user: true },
      });

      return records.map((r) => ({
        id: r.id,
        ticketNumber: r.ticketNumber,
        userId: r.userId,
        userEmail: r.user.email,
        userName: r.user.displayName,
        subject: r.subject,
        description: r.description,
        category: r.category,
        priority: r.priority.toLowerCase() as 'low' | 'normal' | 'high',
        status: r.status.toLowerCase() as 'open' | 'in_progress' | 'waiting_for_user' | 'resolved' | 'closed',
        lastMessageAt: r.lastMessageAt.getTime(),
        createdAt: r.createdAt.getTime(),
        updatedAt: r.updatedAt.getTime(),
      }));
    } catch (error) {
      throw AppError.database('Failed to query user support tickets', error);
    }
  }

  async findByIdAndVerifyOwnership(
    ticketId: string,
    requestingUserId: string,
    requestingRole: UserRole
  ): Promise<DomainSupportTicket> {
    try {
      const ticket = await this.prisma.supportTicket.findUnique({
        where: { id: ticketId },
        include: { user: true },
      });

      if (!ticket) {
        throw AppError.notFound('Support Ticket');
      }

      // Strict server-side ownership enforcement
      const isOwner = ticket.userId === requestingUserId;
      const isAdminOrStaff = requestingRole === 'ADMIN' || requestingRole === 'STAFF';

      if (!isOwner && !isAdminOrStaff) {
        throw AppError.forbidden('You do not have permission to access this support ticket');
      }

      return {
        id: ticket.id,
        ticketNumber: ticket.ticketNumber,
        userId: ticket.userId,
        userEmail: ticket.user.email,
        userName: ticket.user.displayName,
        subject: ticket.subject,
        description: ticket.description,
        category: ticket.category,
        priority: ticket.priority.toLowerCase() as 'low' | 'normal' | 'high',
        status: ticket.status.toLowerCase() as 'open' | 'in_progress' | 'waiting_for_user' | 'resolved' | 'closed',
        lastMessageAt: ticket.lastMessageAt.getTime(),
        createdAt: ticket.createdAt.getTime(),
        updatedAt: ticket.updatedAt.getTime(),
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw AppError.database(`Failed to retrieve support ticket: ${ticketId}`, error);
    }
  }

  async createTicket(data: CreateSupportTicketInput): Promise<DomainSupportTicket> {
    try {
      const ticketNumber = `TICK-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

      const ticket = await this.prisma.supportTicket.create({
        data: {
          ticketNumber,
          userId: data.userId,
          subject: data.subject.trim(),
          description: data.description.trim(),
          category: data.category.trim(),
          priority: data.priority === 'high' ? TicketPriority.HIGH : data.priority === 'low' ? TicketPriority.LOW : TicketPriority.MEDIUM,
          status: TicketStatus.OPEN,
        },
        include: { user: true },
      });

      return {
        id: ticket.id,
        ticketNumber: ticket.ticketNumber,
        userId: ticket.userId,
        userEmail: ticket.user.email,
        userName: ticket.user.displayName,
        subject: ticket.subject,
        description: ticket.description,
        category: ticket.category,
        priority: ticket.priority.toLowerCase() as 'low' | 'normal' | 'high',
        status: 'open',
        lastMessageAt: ticket.lastMessageAt.getTime(),
        createdAt: ticket.createdAt.getTime(),
        updatedAt: ticket.updatedAt.getTime(),
      };
    } catch (error) {
      throw AppError.database('Failed to create support ticket', error);
    }
  }

  async addMessage(data: AddSupportMessageInput): Promise<DomainMessage> {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const message = await tx.ticketMessage.create({
          data: {
            ticketId: data.ticketId,
            senderUserId: data.senderUserId,
            senderRole: data.senderRole === 'ADMIN' ? 'ADMIN' : data.senderRole === 'STAFF' ? 'STAFF' : 'USER',
            message: data.message.trim(),
            attachments: data.attachments ? [...data.attachments] : [],
          },
          include: { sender: true },
        });

        await tx.supportTicket.update({
          where: { id: data.ticketId },
          data: {
            lastMessageAt: new Date(),
          },
        });

        return {
          id: message.id,
          ticketId: message.ticketId,
          senderUserId: message.senderUserId,
          senderName: message.sender.displayName,
          senderRole: data.senderRole,
          message: message.message,
          attachments: message.attachments,
          createdAt: message.createdAt.getTime(),
        };
      });
    } catch (error) {
      throw AppError.database(`Failed to add message to ticket: ${data.ticketId}`, error);
    }
  }
}
