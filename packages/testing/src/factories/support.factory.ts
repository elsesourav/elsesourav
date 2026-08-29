import type {
  SupportTicket,
  SupportTicketMessage,
  SupportTicketStatus,
  SupportTicketPriority,
  SupportTicketListItem,
} from '@elsesourav/types';

let ticketCounter = 1;
let messageCounter = 1;

export function resetSupportFactoryCounter(): void {
  ticketCounter = 1;
  messageCounter = 1;
}

export function createTicketMessage(
  overrides?: Partial<SupportTicketMessage>
): SupportTicketMessage {
  const index = messageCounter++;
  return {
    id: overrides?.id || `msg-test-${index}`,
    ticketId: overrides?.ticketId || 'ticket-test-1',
    senderUserId: overrides?.senderUserId || 'usr-test-1',
    senderName: overrides?.senderName || 'Developer Member',
    senderPhotoUrl: overrides?.senderPhotoUrl,
    senderRole: overrides?.senderRole || 'USER',
    message:
      overrides?.message || `This is reply message #${index} regarding the issue diagnostics.`,
    attachments: overrides?.attachments || [],
    isInternalNote: overrides?.isInternalNote ?? false,
    createdAt: overrides?.createdAt ?? 1704067200000 + index * 60000,
  };
}

export function createSupportTicket(overrides?: Partial<SupportTicket>): SupportTicket {
  const index = ticketCounter++;
  const id = overrides?.id || `ticket-test-${index}`;
  const ticketNumber = overrides?.ticketNumber || `TICK-2026-${String(index).padStart(4, '0')}`;

  return {
    id,
    ticketNumber,
    userId: overrides?.userId || 'usr-test-1',
    userEmail: overrides?.userEmail || 'user@example.test',
    userName: overrides?.userName || 'Developer Member',
    subject: overrides?.subject || `CLI WebSocket Latency Issue #${index}`,
    description:
      overrides?.description ||
      `Observed intermittent connection dropouts when executing long-running builds through web terminal proxy.`,
    category: overrides?.category || 'Technical Support',
    priority: (overrides?.priority as SupportTicketPriority) || 'medium',
    status: (overrides?.status as SupportTicketStatus) || 'open',
    messages: overrides?.messages || [
      createTicketMessage({
        ticketId: id,
        message: 'Initial ticket submission describing the environment and reproduction steps.',
      }),
    ],
    lastMessageAt: overrides?.lastMessageAt ?? 1704067200000,
    createdAt: overrides?.createdAt ?? 1704067200000,
    updatedAt: overrides?.updatedAt ?? 1704067200000,
  };
}

export function createSupportTicketListItem(ticket: SupportTicket): SupportTicketListItem {
  return {
    id: ticket.id,
    ticketNumber: ticket.ticketNumber,
    userId: ticket.userId,
    userEmail: ticket.userEmail,
    userName: ticket.userName,
    subject: ticket.subject,
    category: ticket.category,
    priority: ticket.priority,
    status: ticket.status,
    messageCount: ticket.messages?.length || 1,
    lastMessageAt: ticket.lastMessageAt,
    createdAt: ticket.createdAt,
    updatedAt: ticket.updatedAt,
  };
}
