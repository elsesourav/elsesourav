'use server';

import { SupportRepository, SupportService } from '@elsesourav/database';
import { getServerSession } from '@elsesourav/auth';
import { cookies } from 'next/headers';
import { CreateSupportTicketSchema, AddTicketMessageSchema } from '@elsesourav/validation';
import { revalidatePath } from 'next/cache';
import type { SupportTicketPriority } from '@elsesourav/types';

const supportRepo = new SupportRepository();
const supportService = new SupportService(supportRepo);

async function getSessionUser() {
  const cookieStore = await cookies();
  const session = await getServerSession({
    getAll: () => cookieStore.getAll(),
  });
  return session?.user ?? null;
}

export async function createSupportTicketAction(input: {
  subject: string;
  description: string;
  category: string;
  priority?: string;
  attachments?: string[];
}) {
  const user = await getSessionUser();
  if (!user?.id) {
    return { success: false, error: 'You must be signed in to create a support ticket.' };
  }

  const parsed = CreateSupportTicketSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || 'Invalid ticket submission data',
    };
  }

  try {
    const priority = (parsed.data.priority || 'medium') as SupportTicketPriority;
    const ticket = await supportService.createTicket(user.id, {
      subject: parsed.data.subject,
      description: parsed.data.description,
      category: parsed.data.category,
      priority,
      attachments: parsed.data.attachments,
    });

    revalidatePath('/support');
    revalidatePath('/support/tickets');

    return { success: true, ticketId: ticket.id, ticketNumber: ticket.ticketNumber };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create ticket',
    };
  }
}

export async function replyToSupportTicketAction(input: {
  ticketId: string;
  message: string;
  attachments?: string[];
}) {
  const user = await getSessionUser();
  if (!user?.id) {
    return { success: false, error: 'You must be signed in to reply.' };
  }

  const parsed = AddTicketMessageSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || 'Invalid message',
    };
  }

  try {
    const message = await supportService.replyToTicket(
      user.id,
      user.role,
      parsed.data.ticketId,
      parsed.data.message,
      parsed.data.attachments,
      false
    );

    revalidatePath(`/support/tickets/${input.ticketId}`);
    revalidatePath('/support/tickets');

    return { success: true, messageId: message.id };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send reply',
    };
  }
}

export async function closeSupportTicketAction(ticketId: string) {
  const user = await getSessionUser();
  if (!user?.id) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    await supportService.closeTicket(user.id, user.role, ticketId);
    revalidatePath(`/support/tickets/${ticketId}`);
    revalidatePath('/support/tickets');
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to close ticket',
    };
  }
}

export async function reopenSupportTicketAction(ticketId: string) {
  const user = await getSessionUser();
  if (!user?.id) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    await supportService.reopenTicket(user.id, user.role, ticketId);
    revalidatePath(`/support/tickets/${ticketId}`);
    revalidatePath('/support/tickets');
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to reopen ticket',
    };
  }
}
