import type { ID, Timestamp } from './common.types';
import type { UserRole } from './user.types';

export * from './help.types';

/**
 * Support Ticket Priority & Status
 */
export type TicketStatus = 'open' | 'in_progress' | 'waiting_on_user' | 'resolved' | 'closed';

export type TicketPriority = 'low' | 'normal' | 'high' | 'urgent';

export type TicketCategory =
  'bug_report' | 'feature_request' | 'account' | 'app_feedback' | 'general';

/**
 * Support Ticket Message Thread Item
 */
export interface SupportTicketMessage {
  readonly id: ID;
  readonly ticketId: ID;
  readonly senderId: ID;
  readonly senderName: string;
  readonly senderRole: UserRole;
  readonly content: string;
  readonly attachments?: readonly string[];
  readonly createdAt: Timestamp;
}

/**
 * Support Ticket Domain Entity
 */
export interface SupportTicket {
  readonly id: ID;
  readonly ticketNumber: string;
  readonly userId: ID;
  readonly userEmail: string;
  readonly userName: string;
  readonly category: TicketCategory;
  readonly priority: TicketPriority;
  readonly status: TicketStatus;
  readonly subject: string;
  readonly appId?: ID;
  readonly messages: readonly SupportTicketMessage[];
  readonly lastMessageAt: Timestamp;
  readonly createdAt: Timestamp;
  readonly updatedAt: Timestamp;
  readonly resolvedAt?: Timestamp;
}
