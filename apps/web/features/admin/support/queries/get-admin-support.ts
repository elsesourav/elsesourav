import { SupportRepository, SupportService } from '@elsesourav/database';
import { requireAdmin } from '../../guards/require-admin';
import type {
  SupportTicketListItem,
  SupportTicketDetail,
  SupportTicketStatus,
} from '@elsesourav/types';

const supportRepo = new SupportRepository();
const supportService = new SupportService(supportRepo);

export async function getAdminTicketsList(
  options: {
    status?: SupportTicketStatus;
    category?: string;
    search?: string;
    limit?: number;
  } = {}
): Promise<SupportTicketListItem[]> {
  const context = await requireAdmin();
  return supportService.getAllTicketsAdmin(context.role, options);
}

export async function getAdminTicketDetail(ticketId: string): Promise<SupportTicketDetail> {
  const context = await requireAdmin();
  return supportService.getTicketDetail(context.id, context.role, ticketId);
}
