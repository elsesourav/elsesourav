import { z } from 'zod';

export const SupportTicketSchema = z.object({
  subject: z.string().min(5, 'Subject must be at least 5 characters').max(120),
  description: z.string().min(20, 'Please describe your issue with at least 20 characters'),
  category: z.string().min(1, 'Please select a category'),
  priority: z.enum(['low', 'normal', 'high']).default('normal'),
  userEmail: z.string().email().optional(),
  userName: z.string().optional(),
});

export const SupportMessageSchema = z.object({
  ticketId: z.string().min(1),
  message: z.string().min(1, 'Message cannot be empty').max(2000),
  attachments: z.array(z.string().url()).optional(),
});

export type CreateSupportTicketInput = z.infer<typeof SupportTicketSchema>;
export type CreateSupportMessageInput = z.infer<typeof SupportMessageSchema>;
