import type { ID, Timestamp } from './common.types';
import type { UserRole } from './user.types';

export type SupportTicketStatus =
  | 'open'
  | 'in_progress'
  | 'waiting_for_user'
  | 'resolved'
  | 'closed';

export type SupportTicketPriority = 'low' | 'normal' | 'high';

export interface SupportTicketMessage {
  readonly id: ID;
  readonly ticketId: ID;
  readonly senderUserId: ID;
  readonly senderName?: string;
  readonly senderRole: UserRole;
  readonly message: string;
  readonly attachments?: readonly string[];
  readonly createdAt: Timestamp;
}

export interface SupportTicket {
  readonly id: ID;
  readonly ticketNumber: string;
  readonly userId: ID;
  readonly userEmail?: string;
  readonly userName?: string;
  readonly subject: string;
  readonly description: string;
  readonly category: string;
  readonly priority: SupportTicketPriority;
  readonly status: SupportTicketStatus;
  readonly lastMessageAt: Timestamp;
  readonly createdAt: Timestamp;
  readonly updatedAt: Timestamp;
}
