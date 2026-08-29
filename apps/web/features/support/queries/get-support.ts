import { SupportRepository, SupportService } from '@elsesourav/database';
import { getServerSession } from '@elsesourav/auth';
import { cookies } from 'next/headers';
import type { SupportTicketListItem, SupportTicketDetail } from '@elsesourav/types';

const supportRepo = new SupportRepository();
const supportService = new SupportService(supportRepo);

export async function getUserSupportTickets(): Promise<SupportTicketListItem[]> {
  const cookieStore = await cookies();
  const session = await getServerSession({
    getAll: () => cookieStore.getAll(),
  });

  if (!session?.user?.id) return [];

  try {
    return await supportService.getUserTickets(session.user.id);
  } catch {
    return [];
  }
}

export async function getUserSupportTicketDetail(
  ticketId: string
): Promise<SupportTicketDetail | null> {
  const cookieStore = await cookies();
  const session = await getServerSession({
    getAll: () => cookieStore.getAll(),
  });

  if (!session?.user?.id) return null;

  try {
    return await supportService.getTicketDetail(session.user.id, session.user.role, ticketId);
  } catch {
    return null;
  }
}
