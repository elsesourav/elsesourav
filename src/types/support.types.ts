import type { ID, Timestamp } from './common.types';
import type { UserRole } from './user.types';

export * from './help.types';

/**
 * Support Ticket Status Workflow
 */
export type SupportTicketStatus =
  'open' | 'in_progress' | 'waiting_for_user' | 'resolved' | 'closed';

export type TicketStatus = SupportTicketStatus;

/**
 * Support Ticket Priority Levels
 */
export type SupportTicketPriority = 'low' | 'normal' | 'high';

export type TicketPriority = SupportTicketPriority;

/**
 * Support Ticket Issue Categories
 */
export type SupportTicketCategory =
  | 'app_issue'
  | 'account'
  | 'download'
  | 'chrome_extension'
  | 'android_app'
  | 'bug_report'
  | 'general'
  | 'other';

export type TicketCategory = SupportTicketCategory;

/**
 * Support Ticket Message Model (/supportTickets/{ticketId}/messages/{messageId})
 */
export interface SupportTicketMessage {
  readonly id: ID;
  readonly ticketId: ID;
  readonly senderUserId: ID;
  readonly senderName?: string;
  readonly senderRole: UserRole;
  readonly message: string;
  readonly attachments?: readonly string[];
  readonly createdAt: Timestamp;
  readonly updatedAt: Timestamp;
}

/**
 * Support Ticket Domain Entity (/supportTickets/{ticketId})
 */
export interface SupportTicket {
  readonly id: ID;
  readonly ticketNumber: string;
  readonly userId: ID;
  readonly userEmail?: string;
  readonly userName?: string;
  readonly subject: string;
  readonly description: string;
  readonly category: SupportTicketCategory;
  readonly priority: SupportTicketPriority;
  readonly status: SupportTicketStatus;
  readonly relatedAppId?: ID;
  readonly relatedHelpArticleId?: ID;
  readonly lastMessageAt: Timestamp;
  readonly createdAt: Timestamp;
  readonly updatedAt: Timestamp;
  readonly closedAt?: Timestamp;
  readonly resolvedAt?: Timestamp;
}

/**
 * DTO for creating a new support ticket
 */
export interface CreateSupportTicketDto {
  readonly subject: string;
  readonly description: string;
  readonly category: SupportTicketCategory;
  readonly priority?: SupportTicketPriority;
  readonly relatedAppId?: ID;
  readonly relatedHelpArticleId?: ID;
  readonly userEmail?: string;
  readonly userName?: string;
}

/**
 * DTO for creating a message in a ticket thread
 */
export interface CreateSupportMessageDto {
  readonly ticketId: ID;
  readonly senderUserId: ID;
  readonly senderRole: UserRole;
  readonly senderName?: string;
  readonly message: string;
  readonly attachments?: readonly string[];
}
