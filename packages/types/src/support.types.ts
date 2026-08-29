import type { ID, Timestamp } from './common.types';
import type { UserRole } from './user.types';

export type SupportTicketStatus =
  | 'open'
  | 'in_progress'
  | 'waiting_for_user'
  | 'resolved'
  | 'closed';

export type TicketStatus = SupportTicketStatus;

export type SupportTicketPriority = 'low' | 'medium' | 'high' | 'urgent' | 'normal';

export type TicketPriority = SupportTicketPriority;

export type SupportTicketCategory =
  | 'account'
  | 'app_issue'
  | 'bug_report'
  | 'billing'
  | 'feature_request'
  | 'general'
  | 'other';

export type TicketCategory = SupportTicketCategory;

export interface SupportTicketMessage {
  readonly id: ID;
  readonly ticketId: ID;
  readonly senderUserId: ID;
  readonly senderName?: string;
  readonly senderPhotoUrl?: string;
  readonly senderRole: UserRole;
  readonly message: string;
  readonly attachments?: readonly string[];
  readonly isInternalNote?: boolean;
  readonly createdAt: Timestamp;
}

export interface SupportTicketListItem {
  readonly id: ID;
  readonly ticketNumber: string;
  readonly userId: ID;
  readonly userEmail?: string;
  readonly userName?: string;
  readonly subject: string;
  readonly category: string;
  readonly priority: SupportTicketPriority;
  readonly status: SupportTicketStatus;
  readonly messageCount?: number;
  readonly lastMessageAt: Timestamp;
  readonly createdAt: Timestamp;
  readonly updatedAt: Timestamp;
}

export interface SupportTicketDetail {
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
  readonly messages: readonly SupportTicketMessage[];
  readonly lastMessageAt: Timestamp;
  readonly createdAt: Timestamp;
  readonly updatedAt: Timestamp;
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
  readonly messages?: readonly SupportTicketMessage[];
  readonly lastMessageAt: Timestamp;
  readonly createdAt: Timestamp;
  readonly updatedAt: Timestamp;
}

export interface CreateSupportTicketInput {
  readonly userId: string;
  readonly subject: string;
  readonly description: string;
  readonly category: string;
  readonly priority?: SupportTicketPriority;
  readonly attachments?: readonly string[];
}

export interface AddSupportMessageInput {
  readonly ticketId: string;
  readonly senderUserId: string;
  readonly senderRole: UserRole;
  readonly message: string;
  readonly attachments?: readonly string[];
  readonly isInternalNote?: boolean;
}

export interface UpdateTicketStatusInput {
  readonly ticketId: string;
  readonly status: SupportTicketStatus;
}
