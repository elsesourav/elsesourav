import { describe, it, expect, vi } from 'vitest';
import { SupportService, SupportRepository } from '@elsesourav/database';
import { AppError } from '@elsesourav/types';
import { generateTicketNumber } from '@elsesourav/validation';
import type {
  SupportTicketListItem,
  SupportTicketDetail,
} from '@elsesourav/types';

describe('Support Domain Service, Ownership & Security Lifecycle', () => {
  const mockUserTicket: SupportTicketDetail = {
    id: 'ticket-101',
    ticketNumber: 'TICK-9A82KZ',
    userId: 'usr-alice',
    userEmail: 'alice@elsesourav.com',
    userName: 'Alice',
    subject: 'Cannot connect to web terminal',
    description: 'WebSocket connection times out on Safari.',
    category: 'app_issue',
    priority: 'medium',
    status: 'open',
    messages: [
      {
        id: 'msg-1',
        ticketId: 'ticket-101',
        senderUserId: 'usr-alice',
        senderName: 'Alice',
        senderRole: 'USER',
        message: 'WebSocket connection times out on Safari.',
        createdAt: 1704067000000,
      },
      {
        id: 'msg-2',
        ticketId: 'ticket-101',
        senderUserId: 'usr-staff',
        senderName: 'Staff Member',
        senderRole: 'STAFF',
        message: 'Internal review: check websocket proxy settings.',
        isInternalNote: true,
        createdAt: 1704067100000,
      },
      {
        id: 'msg-3',
        ticketId: 'ticket-101',
        senderUserId: 'usr-staff',
        senderName: 'Staff Member',
        senderRole: 'STAFF',
        message: 'We are investigating this Safari compatibility issue.',
        isInternalNote: false,
        createdAt: 1704067200000,
      },
    ],
    lastMessageAt: 1704067200000,
    createdAt: 1704067000000,
    updatedAt: 1704067200000,
  };

  const mockUserTicketList: SupportTicketListItem[] = [
    {
      id: 'ticket-101',
      ticketNumber: 'TICK-9A82KZ',
      userId: 'usr-alice',
      subject: 'Cannot connect to web terminal',
      category: 'app_issue',
      priority: 'medium',
      status: 'open',
      messageCount: 3,
      lastMessageAt: 1704067200000,
      createdAt: 1704067000000,
      updatedAt: 1704067200000,
    },
  ];

  it('retrieves user tickets list for owner', async () => {
    const mockRepo = {
      findUserTickets: vi.fn().mockResolvedValue(mockUserTicketList),
    } as unknown as SupportRepository;

    const service = new SupportService(mockRepo);
    const tickets = await service.getUserTickets('usr-alice');

    expect(tickets).toHaveLength(1);
    expect(tickets[0]?.ticketNumber).toBe('TICK-9A82KZ');
    expect(mockRepo.findUserTickets).toHaveBeenCalledWith('usr-alice', 20);
  });

  it('allows owner to retrieve their own support ticket', async () => {
    const sanitizedForUser: SupportTicketDetail = {
      ...mockUserTicket,
      messages: mockUserTicket.messages.filter((m) => !m.isInternalNote),
    };

    const mockRepo = {
      findTicketDetail: vi.fn().mockResolvedValue(sanitizedForUser),
    } as unknown as SupportRepository;

    const service = new SupportService(mockRepo);
    const ticket = await service.getTicketDetail('usr-alice', 'USER', 'ticket-101');

    expect(ticket.id).toBe('ticket-101');
    expect(ticket.ticketNumber).toBe('TICK-9A82KZ');
    expect(ticket.messages).toHaveLength(2); // internal note filtered out
    expect(mockRepo.findTicketDetail).toHaveBeenCalledWith('ticket-101', false);
  });

  it('blocks User B from viewing User A ticket (Throws 403 Forbidden)', async () => {
    const mockRepo = {
      findTicketDetail: vi.fn().mockResolvedValue(mockUserTicket),
    } as unknown as SupportRepository;

    const service = new SupportService(mockRepo);

    await expect(
      service.getTicketDetail('usr-bob', 'USER', 'ticket-101')
    ).rejects.toThrowError(AppError);
  });

  it('allows ADMIN to view any ticket including internal notes', async () => {
    const mockRepo = {
      findTicketDetail: vi.fn().mockResolvedValue(mockUserTicket),
    } as unknown as SupportRepository;

    const service = new SupportService(mockRepo);
    const ticket = await service.getTicketDetail('usr-admin', 'ADMIN', 'ticket-101');

    expect(ticket.id).toBe('ticket-101');
    expect(ticket.messages).toHaveLength(3); // admin sees all notes
    expect(mockRepo.findTicketDetail).toHaveBeenCalledWith('ticket-101', true);
  });

  it('blocks User B from replying to User A ticket (Throws 403 Forbidden)', async () => {
    const mockRepo = {
      findTicketDetail: vi.fn().mockResolvedValue(mockUserTicket),
      addMessage: vi.fn(),
    } as unknown as SupportRepository;

    const service = new SupportService(mockRepo);

    await expect(
      service.replyToTicket('usr-bob', 'USER', 'ticket-101', 'Unauthorized response')
    ).rejects.toThrowError(AppError);

    expect(mockRepo.addMessage).not.toHaveBeenCalled();
  });

  // ==========================================
  // Lifecycle & Creation Tests
  // ==========================================

  it('creates support ticket with generated reference number', async () => {
    const mockRepo = {
      createTicket: vi.fn().mockResolvedValue(mockUserTicket),
    } as unknown as SupportRepository;

    const service = new SupportService(mockRepo);
    const created = await service.createTicket('usr-alice', {
      subject: 'Cannot connect to web terminal',
      description: 'WebSocket connection times out on Safari.',
      category: 'app_issue',
      priority: 'medium',
    });

    expect(created.ticketNumber).toBe('TICK-9A82KZ');
    expect(mockRepo.createTicket).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'usr-alice',
        subject: 'Cannot connect to web terminal',
      }),
      expect.stringMatching(/^TICK-[A-Z0-9]{6}$/)
    );
  });

  it('closes and reopens tickets by owner', async () => {
    const mockRepo = {
      findTicketDetail: vi.fn().mockResolvedValue(mockUserTicket),
      updateTicketStatus: vi.fn().mockResolvedValue(undefined),
    } as unknown as SupportRepository;

    const service = new SupportService(mockRepo);

    await service.closeTicket('usr-alice', 'USER', 'ticket-101');
    expect(mockRepo.updateTicketStatus).toHaveBeenCalledWith('ticket-101', 'closed');

    await service.reopenTicket('usr-alice', 'USER', 'ticket-101');
    expect(mockRepo.updateTicketStatus).toHaveBeenCalledWith('ticket-101', 'open');
  });

  it('generates valid ticket reference format', () => {
    const num = generateTicketNumber();
    expect(num).toMatch(/^TICK-[2-9A-HJ-NP-Z]{6}$/);
  });
});
