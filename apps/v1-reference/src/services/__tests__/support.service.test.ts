import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SupportService } from '../support.service';
import type { ISupportRepository } from '@/repositories/interfaces';
import type { SupportTicket, SupportTicketMessage } from '@/types/support.types';
import { ok } from '@/lib/result';

describe('SupportService Domain Logic & QC (Prompt 39)', () => {
  let mockSupportRepo: ISupportRepository;
  let service: SupportService;

  const mockUserTicket: SupportTicket = {
    id: 'ticket-101',
    ticketNumber: '#ES-TEST-101',
    userId: 'user-123',
    userEmail: 'user@example.com',
    userName: 'John Doe',
    subject: 'Cannot login to Chrome Extension',
    description: 'When I click login on the Chrome extension, it spins forever.',
    category: 'chrome_extension',
    priority: 'normal',
    status: 'open',
    lastMessageAt: 1700000000000,
    createdAt: 1700000000000,
    updatedAt: 1700000000000,
  };

  const mockMessage: SupportTicketMessage = {
    id: 'msg-1',
    ticketId: 'ticket-101',
    senderUserId: 'user-123',
    senderRole: 'user',
    senderName: 'John Doe',
    message: 'When I click login on the Chrome extension, it spins forever.',
    attachments: [],
    createdAt: 1700000000000,
    updatedAt: 1700000000000,
  };

  beforeEach(() => {
    mockSupportRepo = {
      createTicket: vi.fn().mockImplementation((dto) =>
        Promise.resolve(
          ok({
            id: 'new-ticket-id',
            ticketNumber: '#ES-NEW-999',
            userId: dto.userId,
            subject: dto.subject,
            description: dto.description,
            category: dto.category,
            priority: dto.priority || 'normal',
            status: 'open' as const,
            userEmail: dto.userEmail,
            userName: dto.userName,
            lastMessageAt: Date.now(),
            createdAt: Date.now(),
            updatedAt: Date.now(),
          })
        )
      ),
      getTicket: vi.fn().mockResolvedValue(ok(mockUserTicket)),
      findByUser: vi.fn().mockResolvedValue(ok({ items: [mockUserTicket], hasMore: false })),
      listUserTickets: vi.fn().mockResolvedValue(ok({ items: [mockUserTicket], hasMore: false })),
      listAdminTickets: vi.fn().mockResolvedValue(ok({ items: [mockUserTicket], hasMore: false })),
      findByTicketNumber: vi.fn().mockResolvedValue(ok(mockUserTicket)),
      updateTicketStatus: vi.fn().mockImplementation((id, status) =>
        Promise.resolve(
          ok({
            ...mockUserTicket,
            id,
            status,
            updatedAt: Date.now(),
          })
        )
      ),
      updatePriority: vi.fn().mockImplementation((id, priority) =>
        Promise.resolve(
          ok({
            ...mockUserTicket,
            id,
            priority,
            updatedAt: Date.now(),
          })
        )
      ),
      addMessage: vi.fn().mockImplementation((dto) =>
        Promise.resolve(
          ok({
            id: 'msg-new',
            ticketId: dto.ticketId,
            senderUserId: dto.senderUserId,
            senderRole: dto.senderRole,
            senderName: dto.senderName,
            message: dto.message,
            attachments: dto.attachments || [],
            createdAt: Date.now(),
            updatedAt: Date.now(),
          })
        )
      ),
      listMessages: vi.fn().mockResolvedValue(ok({ items: [mockMessage], hasMore: false })),
      getMessages: vi.fn().mockResolvedValue(ok({ items: [mockMessage], hasMore: false })),
      closeTicket: vi.fn().mockResolvedValue(ok({ ...mockUserTicket, status: 'closed' })),
      reopenTicket: vi.fn().mockResolvedValue(ok({ ...mockUserTicket, status: 'open' })),
      // Base IRepository mock methods
      findById: vi.fn().mockResolvedValue(ok(mockUserTicket)),
      findMany: vi.fn().mockResolvedValue(ok({ items: [mockUserTicket], hasMore: false })),
      create: vi.fn().mockResolvedValue(ok(mockUserTicket)),
      update: vi.fn().mockResolvedValue(ok(mockUserTicket)),
      delete: vi.fn().mockResolvedValue(ok(undefined)),
    };

    service = new SupportService(mockSupportRepo);
  });

  it('1. User creates ticket with validation and creates opening message thread', async () => {
    const user = {
      id: 'user-123',
      email: 'user@example.com',
      name: 'John Doe',
      role: 'user' as const,
    };
    const res = await service.createTicket(
      {
        subject: 'Cannot login to Chrome Extension',
        description: 'When I click login on the Chrome extension, it spins forever.',
        category: 'chrome_extension',
      },
      user
    );

    expect(res.success).toBe(true);
    expect(mockSupportRepo.createTicket).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-123',
        subject: 'Cannot login to Chrome Extension',
        priority: 'normal',
      })
    );
    expect(mockSupportRepo.addMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        senderUserId: 'user-123',
        senderRole: 'user',
        message: 'When I click login on the Chrome extension, it spins forever.',
      })
    );
  });

  it('2. User sees own ticket', async () => {
    const user = { id: 'user-123', role: 'user' as const };
    const res = await service.getTicket('ticket-101', user);

    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data?.id).toBe('ticket-101');
      expect(res.data?.userId).toBe('user-123');
    }
  });

  it("3. User cannot see another user's ticket (FORBIDDEN)", async () => {
    const intruder = { id: 'user-intruder', role: 'user' as const };
    const res = await service.getTicket('ticket-101', intruder);

    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.code).toBe('FORBIDDEN');
    }
  });

  it('4. User adds message to own ticket', async () => {
    const user = { id: 'user-123', name: 'John Doe', role: 'user' as const };
    const res = await service.addMessage(
      {
        ticketId: 'ticket-101',
        message: 'Here is additional context: I am using macOS Chrome v125.',
      },
      user
    );

    expect(res.success).toBe(true);
    expect(mockSupportRepo.addMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        ticketId: 'ticket-101',
        senderUserId: 'user-123',
        senderRole: 'user',
        message: 'Here is additional context: I am using macOS Chrome v125.',
      })
    );
  });

  it('5. User cannot impersonate admin role on message creation', async () => {
    const user = { id: 'user-123', name: 'John Doe', role: 'user' as const };
    await service.addMessage(
      {
        ticketId: 'ticket-101',
        message: 'Trying to forge role',
      },
      user
    );

    // Enforced senderRole to 'user' because user.role !== 'admin'
    expect(mockSupportRepo.addMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        senderRole: 'user',
      })
    );
  });

  it('6. Normal user cannot set high priority directly (downgraded to normal)', async () => {
    const user = { id: 'user-123', role: 'user' as const };
    await service.createTicket(
      {
        subject: 'My urgent ticket request',
        description: 'Need immediate fix please resolve now.',
        category: 'bug_report',
        priority: 'high',
      },
      user
    );

    expect(mockSupportRepo.createTicket).toHaveBeenCalledWith(
      expect.objectContaining({
        priority: 'normal',
      })
    );
  });

  it('7. Admin can view any user ticket', async () => {
    const admin = { id: 'admin-1', role: 'admin' as const };
    const res = await service.getTicket('ticket-101', admin);

    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data?.id).toBe('ticket-101');
    }
  });

  it('8. Admin can reply with admin role', async () => {
    const admin = { id: 'admin-1', name: 'ElseSourav Dev', role: 'admin' as const };
    const res = await service.addMessage(
      {
        ticketId: 'ticket-101',
        message: 'Thank you for reporting. A patch has been deployed.',
      },
      admin
    );

    expect(res.success).toBe(true);
    expect(mockSupportRepo.addMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        senderRole: 'admin',
        senderUserId: 'admin-1',
      })
    );
  });

  it('9. Admin can change ticket status through valid transitions', async () => {
    const admin = { id: 'admin-1', role: 'admin' as const };
    const res = await service.updateTicketStatus('ticket-101', 'in_progress', admin);

    expect(res.success).toBe(true);
    expect(mockSupportRepo.updateTicketStatus).toHaveBeenCalledWith('ticket-101', 'in_progress');
  });

  it('10. Admin can change ticket priority to high', async () => {
    const admin = { id: 'admin-1', role: 'admin' as const };
    const res = await service.updateTicketPriority('ticket-101', 'high', admin);

    expect(res.success).toBe(true);
    expect(mockSupportRepo.updatePriority).toHaveBeenCalledWith('ticket-101', 'high');
  });

  it('11. Rejects invalid status transition (e.g. open -> waiting_for_user)', async () => {
    const admin = { id: 'admin-1', role: 'admin' as const };
    const res = await service.updateTicketStatus('ticket-101', 'waiting_for_user', admin);

    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.code).toBe('BAD_REQUEST');
    }
  });

  it('12. User can close and resolve their own ticket', async () => {
    const user = { id: 'user-123', role: 'user' as const };
    const res = await service.updateTicketStatus('ticket-101', 'resolved', user);

    expect(res.success).toBe(true);
    expect(mockSupportRepo.updateTicketStatus).toHaveBeenCalledWith('ticket-101', 'resolved');
  });

  it('13. Admin can reopen closed ticket', async () => {
    const admin = { id: 'admin-1', role: 'admin' as const };
    const res = await service.reopenTicket('ticket-101', admin);

    expect(res.success).toBe(true);
    expect(mockSupportRepo.reopenTicket).toHaveBeenCalledWith('ticket-101');
  });

  it('14. Prevents non-admin from updating ticket priority', async () => {
    const user = { id: 'user-123', role: 'user' as const };
    const res = await service.updateTicketPriority('ticket-101', 'high', user);

    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.code).toBe('FORBIDDEN');
    }
  });

  it('15. Paginated user tickets retrieval', async () => {
    const user = { id: 'user-123', role: 'user' as const };
    const res = await service.listUserTickets('user-123', user, { limit: 10 });

    expect(res.success).toBe(true);
    expect(mockSupportRepo.listUserTickets).toHaveBeenCalledWith('user-123', { limit: 10 });
  });

  it('16. Paginated message thread retrieval', async () => {
    const user = { id: 'user-123', role: 'user' as const };
    const res = await service.listMessages('ticket-101', user, { limit: 20 });

    expect(res.success).toBe(true);
    expect(mockSupportRepo.listMessages).toHaveBeenCalledWith('ticket-101', { limit: 20 });
  });
});
