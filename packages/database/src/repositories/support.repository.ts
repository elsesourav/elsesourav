import { PrismaClient, Prisma, TicketStatus, TicketPriority } from '@prisma/client';
import { prisma as defaultPrisma } from '../client';
import { AppError } from '@elsesourav/types';
import {
  mapPrismaSupportTicketToListItem,
  mapPrismaSupportTicketToDetail,
  mapPrismaTicketMessageToDomain,
} from '../mappers/support.mapper';
import type {
  SupportTicketListItem,
  SupportTicketDetail,
  SupportTicketMessage as DomainMessage,
  CreateSupportTicketInput,
  AddSupportMessageInput,
  SupportTicketStatus,
  SupportTicketPriority,
  UserRole,
} from '@elsesourav/types';

function parsePrismaPriority(priority?: SupportTicketPriority | string): TicketPriority {
  switch (priority?.toLowerCase()) {
    case 'urgent':
      return TicketPriority.URGENT;
    case 'high':
      return TicketPriority.HIGH;
    case 'low':
      return TicketPriority.LOW;
    default:
      return TicketPriority.MEDIUM;
  }
}

function parsePrismaStatus(status: SupportTicketStatus | string): TicketStatus {
  switch (status.toLowerCase()) {
    case 'in_progress':
      return TicketStatus.IN_PROGRESS;
    case 'waiting_for_user':
      return TicketStatus.WAITING_FOR_USER;
    case 'resolved':
      return TicketStatus.RESOLVED;
    case 'closed':
      return TicketStatus.CLOSED;
    default:
      return TicketStatus.OPEN;
  }
}

export class SupportRepository {
  constructor(private readonly prisma: PrismaClient = defaultPrisma) {}

  /**
   * Queries user tickets ordered by lastMessageAt desc
   */
  async findUserTickets(userId: string, limit = 20): Promise<SupportTicketListItem[]> {
    const boundedLimit = Math.min(Math.max(limit, 1), 50);
    const records = await this.prisma.supportTicket.findMany({
      where: { userId },
      take: boundedLimit,
      orderBy: { lastMessageAt: 'desc' },
      include: {
        user: true,
        _count: {
          select: { messages: true },
        },
      },
    });

    return records.map(mapPrismaSupportTicketToListItem);
  }

  /**
   * Finds ticket by ID including all messages and senders
   */
  async findTicketDetail(
    ticketId: string,
    forAdmin: boolean = false
  ): Promise<SupportTicketDetail | null> {
    const ticket = await this.prisma.supportTicket.findUnique({
      where: { id: ticketId },
      include: {
        user: true,
        messages: {
          orderBy: { createdAt: 'asc' },
          include: {
            sender: true,
          },
        },
      },
    });

    if (!ticket) return null;

    return mapPrismaSupportTicketToDetail(ticket, forAdmin);
  }

  /**
   * Finds ticket by ID and verifies caller ownership/permissions
   */
  async findByIdAndVerifyOwnership(
    ticketId: string,
    requestingUserId: string,
    requestingRole: UserRole
  ): Promise<SupportTicketDetail> {
    const forAdmin = requestingRole === 'ADMIN' || requestingRole === 'STAFF';
    const ticket = await this.findTicketDetail(ticketId, forAdmin);

    if (!ticket) {
      throw AppError.notFound('Support Ticket');
    }

    const isOwner = ticket.userId === requestingUserId;
    if (!isOwner && !forAdmin) {
      throw AppError.forbidden('You do not have permission to access this support ticket');
    }

    return ticket;
  }

  /**
   * Finds ticket by reference number (e.g. TICK-AB12CD)
   */
  async findTicketByNumber(
    ticketNumber: string,
    forAdmin: boolean = false
  ): Promise<SupportTicketDetail | null> {
    const ticket = await this.prisma.supportTicket.findUnique({
      where: { ticketNumber },
      include: {
        user: true,
        messages: {
          orderBy: { createdAt: 'asc' },
          include: {
            sender: true,
          },
        },
      },
    });

    if (!ticket) return null;

    return mapPrismaSupportTicketToDetail(ticket, forAdmin);
  }

  /**
   * Creates a new support ticket and initial conversation message
   */
  async createTicket(
    data: CreateSupportTicketInput,
    ticketNumber: string
  ): Promise<SupportTicketDetail> {
    const priority = parsePrismaPriority(data.priority);

    return await this.prisma.$transaction(async (tx) => {
      const ticket = await tx.supportTicket.create({
        data: {
          ticketNumber,
          userId: data.userId,
          subject: data.subject.trim(),
          description: data.description.trim(),
          category: data.category.trim(),
          priority,
          status: TicketStatus.OPEN,
        },
        include: {
          user: true,
        },
      });

      // Create initial message
      const initialMessage = await tx.ticketMessage.create({
        data: {
          ticketId: ticket.id,
          senderUserId: data.userId,
          senderRole: 'USER',
          message: data.description.trim(),
          attachments: data.attachments ? [...data.attachments] : [],
        },
        include: {
          sender: true,
        },
      });

      return {
        ...mapPrismaSupportTicketToDetail(ticket, false),
        messages: [mapPrismaTicketMessageToDomain(initialMessage)],
      };
    });
  }

  /**
   * Adds a message to a ticket and updates lastMessageAt
   */
  async addMessage(data: AddSupportMessageInput): Promise<DomainMessage> {
    return await this.prisma.$transaction(async (tx) => {
      const message = await tx.ticketMessage.create({
        data: {
          ticketId: data.ticketId,
          senderUserId: data.senderUserId,
          senderRole: data.senderRole === 'ADMIN' ? 'ADMIN' : data.senderRole === 'STAFF' ? 'STAFF' : 'USER',
          message: data.message.trim(),
          attachments: data.attachments ? [...data.attachments] : [],
          isInternalNote: data.isInternalNote ?? false,
        },
        include: { sender: true },
      });

      // Update ticket lastMessageAt and status if user replied
      await tx.supportTicket.update({
        where: { id: data.ticketId },
        data: {
          lastMessageAt: new Date(),
          ...(data.senderRole === 'USER' && {
            status: TicketStatus.OPEN,
          }),
        },
      });

      return mapPrismaTicketMessageToDomain(message);
    });
  }

  /**
   * Updates ticket status
   */
  async updateTicketStatus(
    ticketId: string,
    status: SupportTicketStatus
  ): Promise<void> {
    const prismaStatus = parsePrismaStatus(status);
    await this.prisma.supportTicket.update({
      where: { id: ticketId },
      data: { status: prismaStatus },
    });
  }

  /**
   * Lists all tickets (Admin view) with optional filters
   */
  async findAllTickets(
    options:
      | {
          status?: SupportTicketStatus;
          category?: string;
          search?: string;
          limit?: number;
        }
      | number = 50
  ): Promise<SupportTicketListItem[]> {
    const limit = typeof options === 'number' ? options : Math.min(Math.max(options.limit ?? 50, 1), 100);
    const where: Prisma.SupportTicketWhereInput = {};

    if (typeof options === 'object') {
      if (options.status && (options.status as string) !== 'all') {
        where.status = parsePrismaStatus(options.status);
      }
      if (options.category && options.category !== 'all') {
        where.category = options.category;
      }
      if (options.search && options.search.trim().length > 0) {
        const term = options.search.trim();
        where.OR = [
          { ticketNumber: { contains: term, mode: 'insensitive' } },
          { subject: { contains: term, mode: 'insensitive' } },
          { user: { email: { contains: term, mode: 'insensitive' } } },
        ];
      }
    }

    const records = await this.prisma.supportTicket.findMany({
      where,
      take: limit,
      orderBy: { lastMessageAt: 'desc' },
      include: {
        user: true,
        _count: {
          select: { messages: true },
        },
      },
    });

    return records.map(mapPrismaSupportTicketToListItem);
  }
}
