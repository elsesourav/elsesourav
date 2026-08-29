import type {
  SupportTicket as PrismaSupportTicket,
  TicketMessage as PrismaTicketMessage,
  User as PrismaUser,
} from '@prisma/client';
import type {
  SupportTicketListItem,
  SupportTicketDetail,
  SupportTicketMessage as DomainTicketMessage,
  SupportTicketStatus,
  SupportTicketPriority,
  UserRole,
} from '@elsesourav/types';

export type PrismaTicketMessageWithSender = PrismaTicketMessage & {
  sender?: PrismaUser | null;
};

export type PrismaSupportTicketWithRelations = PrismaSupportTicket & {
  user?: PrismaUser | null;
  messages?: PrismaTicketMessageWithSender[] | null;
  _count?: {
    messages: number;
  };
};

export function mapPrismaTicketMessageToDomain(
  msg: PrismaTicketMessageWithSender
): DomainTicketMessage {
  return {
    id: msg.id,
    ticketId: msg.ticketId,
    senderUserId: msg.senderUserId,
    senderName: msg.sender?.displayName || undefined,
    senderPhotoUrl: msg.sender?.photoUrl || undefined,
    senderRole: msg.senderRole.toLowerCase() as UserRole,
    message: msg.message,
    attachments: msg.attachments,
    isInternalNote: msg.isInternalNote,
    createdAt: msg.createdAt.getTime(),
  };
}

export function mapPrismaSupportTicketToListItem(
  ticket: PrismaSupportTicketWithRelations
): SupportTicketListItem {
  return {
    id: ticket.id,
    ticketNumber: ticket.ticketNumber,
    userId: ticket.userId,
    subject: ticket.subject,
    category: ticket.category,
    priority: ticket.priority.toLowerCase() as SupportTicketPriority,
    status: ticket.status.toLowerCase() as SupportTicketStatus,
    messageCount: ticket._count?.messages ?? (ticket.messages ? ticket.messages.length : 0),
    lastMessageAt: ticket.lastMessageAt.getTime(),
    createdAt: ticket.createdAt.getTime(),
    updatedAt: ticket.updatedAt.getTime(),
  };
}

export function mapPrismaSupportTicketToDetail(
  ticket: PrismaSupportTicketWithRelations,
  forAdmin: boolean = false
): SupportTicketDetail {
  const rawMessages = ticket.messages || [];
  const visibleMessages = forAdmin
    ? rawMessages
    : rawMessages.filter((m) => !m.isInternalNote);

  return {
    id: ticket.id,
    ticketNumber: ticket.ticketNumber,
    userId: ticket.userId,
    userEmail: ticket.user?.email || undefined,
    userName: ticket.user?.displayName || undefined,
    subject: ticket.subject,
    description: ticket.description,
    category: ticket.category,
    priority: ticket.priority.toLowerCase() as SupportTicketPriority,
    status: ticket.status.toLowerCase() as SupportTicketStatus,
    messages: visibleMessages.map(mapPrismaTicketMessageToDomain),
    lastMessageAt: ticket.lastMessageAt.getTime(),
    createdAt: ticket.createdAt.getTime(),
    updatedAt: ticket.updatedAt.getTime(),
  };
}
