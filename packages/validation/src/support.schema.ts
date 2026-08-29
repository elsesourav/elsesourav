import { z } from 'zod';

export const TicketPrioritySchema = z.enum(['low', 'medium', 'high', 'urgent', 'normal']);
export const TicketStatusSchema = z.enum([
  'open',
  'in_progress',
  'waiting_for_user',
  'resolved',
  'closed',
]);

export const CreateSupportTicketSchema = z.object({
  subject: z.string().min(5, 'Subject must be at least 5 characters').max(120),
  description: z
    .string()
    .min(10, 'Please describe your issue with at least 10 characters')
    .max(3000),
  category: z.string().min(1, 'Please select a category'),
  priority: z.enum(['low', 'medium', 'high', 'urgent', 'normal']).default('medium'),
  attachments: z.array(z.string().url()).optional(),
});

export const AddTicketMessageSchema = z.object({
  ticketId: z.string().uuid('Invalid ticket identifier'),
  message: z.string().min(1, 'Message cannot be empty').max(2000),
  attachments: z.array(z.string().url()).optional(),
  isInternalNote: z.boolean().optional().default(false),
});

export const UpdateTicketStatusSchema = z.object({
  ticketId: z.string().uuid(),
  status: TicketStatusSchema,
});

export const SupportTicketSchema = z.object({
  subject: z.string().min(5, 'Subject must be at least 5 characters').max(120),
  description: z.string().min(10, 'Please describe your issue with at least 10 characters'),
  category: z.string().min(1, 'Please select a category'),
  priority: z.enum(['low', 'medium', 'high', 'urgent', 'normal']).default('medium'),
  userEmail: z.string().email().optional(),
  userName: z.string().optional(),
});

export const SupportMessageSchema = z.object({
  ticketId: z.string().min(1),
  message: z.string().min(1, 'Message cannot be empty').max(2000),
  attachments: z.array(z.string().url()).optional(),
});

export type CreateSupportTicketInputSchema = z.infer<typeof CreateSupportTicketSchema>;
export type AddTicketMessageInputSchema = z.infer<typeof AddTicketMessageSchema>;
export type UpdateTicketStatusInputSchema = z.infer<typeof UpdateTicketStatusSchema>;
export type CreateSupportTicketInput = z.infer<typeof SupportTicketSchema>;
export type CreateSupportMessageInput = z.infer<typeof SupportMessageSchema>;

export function generateTicketNumber(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let rand = '';
  for (let i = 0; i < 6; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `TICK-${rand}`;
}
