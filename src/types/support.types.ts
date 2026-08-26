import type { ID, Timestamp } from './common.types';
import type { UserRole } from './user.types';

/**
 * Help Center Category
 */
export interface HelpCategory {
  readonly id: ID;
  readonly name: string;
  readonly slug: string;
  readonly description: string;
  readonly iconName?: string;
  readonly sortOrder: number;
}

/**
 * Help Center Knowledge Base Article
 */
export interface HelpArticle {
  readonly id: ID;
  readonly slug: string;
  readonly categoryId: ID;
  readonly title: string;
  readonly summary: string;
  readonly content: string;
  readonly tags: readonly string[];
  readonly isPublished: boolean;
  readonly viewsCount: number;
  readonly helpfulCount: number;
  readonly unhelpfulCount: number;
  readonly createdAt: Timestamp;
  readonly updatedAt: Timestamp;
}

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
