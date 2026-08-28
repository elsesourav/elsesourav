import { z } from 'zod';
import { EntityIdSchema } from './common.schema';

/**
 * Support Ticket Category Schema
 */
export const supportTicketCategorySchema = z.enum([
  'app_issue',
  'account',
  'download',
  'chrome_extension',
  'android_app',
  'bug_report',
  'general',
  'other',
]);

/**
 * Support Ticket Priority Schema
 */
export const supportTicketPrioritySchema = z.enum(['low', 'normal', 'high']);

/**
 * Support Ticket Status Schema
 */
export const supportTicketStatusSchema = z.enum([
  'open',
  'in_progress',
  'waiting_for_user',
  'resolved',
  'closed',
]);

/**
 * Valid Status Transitions Matrix
 */
export const VALID_STATUS_TRANSITIONS: Record<
  z.infer<typeof supportTicketStatusSchema>,
  readonly z.infer<typeof supportTicketStatusSchema>[]
> = {
  open: ['in_progress', 'closed', 'resolved'],
  in_progress: ['waiting_for_user', 'resolved', 'closed'],
  waiting_for_user: ['in_progress', 'resolved', 'closed'],
  resolved: ['closed', 'open', 'in_progress'],
  closed: ['open'], // Reopening allowed by admin or explicit action
};

/**
 * Ticket Creation Schema
 */
export const createSupportTicketSchema = z.object({
  subject: z
    .string()
    .trim()
    .min(5, 'Subject must be at least 5 characters')
    .max(150, 'Subject cannot exceed 150 characters'),
  description: z
    .string()
    .trim()
    .min(10, 'Description must be at least 10 characters')
    .max(3000, 'Description cannot exceed 3000 characters'),
  category: supportTicketCategorySchema,
  priority: supportTicketPrioritySchema.optional().default('normal'),
  relatedAppId: EntityIdSchema.optional(),
  relatedHelpArticleId: EntityIdSchema.optional(),
  userEmail: z.string().trim().email('Please enter a valid email address').optional(),
  userName: z.string().trim().max(100).optional(),
});

export type CreateSupportTicketInput = z.input<typeof createSupportTicketSchema>;

/**
 * Ticket Message Creation Schema
 */
export const createSupportMessageSchema = z.object({
  ticketId: EntityIdSchema,
  message: z
    .string()
    .trim()
    .min(1, 'Message cannot be empty')
    .max(2000, 'Message cannot exceed 2000 characters'),
  senderUserId: EntityIdSchema,
  senderRole: z.enum(['user', 'admin']),
  senderName: z.string().trim().max(100).optional(),
  attachments: z.array(z.string()).max(5).optional(),
});

export type CreateSupportMessageInput = z.input<typeof createSupportMessageSchema>;

/**
 * Ticket Status Update Schema
 */
export const updateSupportTicketStatusSchema = z.object({
  status: supportTicketStatusSchema,
});

export type UpdateSupportTicketStatusInput = z.input<typeof updateSupportTicketStatusSchema>;

/**
 * Ticket Priority Update Schema (Admin Only)
 */
export const updateSupportTicketPrioritySchema = z.object({
  priority: supportTicketPrioritySchema,
});

export type UpdateSupportTicketPriorityInput = z.input<typeof updateSupportTicketPrioritySchema>;
