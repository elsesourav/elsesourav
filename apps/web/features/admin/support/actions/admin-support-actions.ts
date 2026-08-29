'use server';

import {
  SupportRepository,
  SupportService,
  NotificationRepository,
  NotificationService,
} from '@elsesourav/database';
import { requireAdmin } from '../../guards/require-admin';
import { AddTicketMessageSchema, UpdateTicketStatusSchema } from '@elsesourav/validation';
import type { SupportTicketStatus } from '@elsesourav/types';
import { revalidatePath } from 'next/cache';

const supportRepo = new SupportRepository();
const supportService = new SupportService(supportRepo);
const notificationRepo = new NotificationRepository();
const notificationService = new NotificationService(notificationRepo);

export async function adminReplyTicketAction(
  ticketId: string,
  message: string,
  attachments: string[] = [],
  isInternalNote: boolean = false
) {
  const context = await requireAdmin();

  const parsed = AddTicketMessageSchema.safeParse({
    ticketId,
    message,
    attachments,
    isInternalNote,
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || 'Invalid reply message',
    };
  }

  try {
    const newMessage = await supportService.replyToTicket(
      context.id,
      context.role,
      ticketId,
      parsed.data.message,
      parsed.data.attachments,
      parsed.data.isInternalNote
    );

    // If this is a public reply to the user (not an internal note), send a notification
    if (!isInternalNote) {
      const ticket = await supportService.getTicketDetail(context.id, context.role, ticketId);

      if (ticket.userId && ticket.userId !== context.id) {
        await notificationService.sendNotification({
          userId: ticket.userId,
          title: `Support Reply: ${ticket.subject}`,
          message: `ElseSourav Support replied to your ticket #${ticket.ticketNumber}.`,
          type: 'support_reply',
          linkUrl: `/support/tickets/${ticket.id}`,
        });
      }
    }

    revalidatePath('/admin/support');
    revalidatePath(`/admin/support/${ticketId}`);
    revalidatePath('/admin');
    revalidatePath(`/support/tickets/${ticketId}`);

    return {
      success: true,
      message: newMessage,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to post staff reply',
    };
  }
}

export async function adminUpdateTicketStatusAction(ticketId: string, status: SupportTicketStatus) {
  const context = await requireAdmin();

  const parsed = UpdateTicketStatusSchema.safeParse({
    ticketId,
    status,
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || 'Invalid ticket status',
    };
  }

  try {
    await supportService.updateTicketStatusAdmin(context.role, ticketId, parsed.data.status);

    // Notify ticket owner
    const ticket = await supportService.getTicketDetail(context.id, context.role, ticketId);

    if (ticket.userId && ticket.userId !== context.id) {
      await notificationService.sendNotification({
        userId: ticket.userId,
        title: `Ticket Status Updated: #${ticket.ticketNumber}`,
        message: `Your support ticket status has been changed to ${parsed.data.status.replace('_', ' ').toUpperCase()}.`,
        type: 'support_reply',
        linkUrl: `/support/tickets/${ticket.id}`,
      });
    }

    revalidatePath('/admin/support');
    revalidatePath(`/admin/support/${ticketId}`);
    revalidatePath('/admin');
    revalidatePath(`/support/tickets/${ticketId}`);

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update ticket status',
    };
  }
}
