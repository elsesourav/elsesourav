import { describe, it, expect, vi } from 'vitest';
import { SupportRepository } from '../index';
import { PrismaClient, TicketStatus, TicketPriority } from '@prisma/client';
import { AppError } from '@elsesourav/types';

describe('Server-Side Security & Resource Ownership Boundaries', () => {
  const mockTicketRecord = {
    id: 'ticket-123',
    ticketNumber: 'TICK-USER-B',
    userId: 'usr-b',
    subject: 'Billing issue',
    description: 'Invoice inquiry',
    category: 'Billing',
    priority: TicketPriority.MEDIUM,
    status: TicketStatus.OPEN,
    lastMessageAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    user: {
      email: 'userb@example.com',
      displayName: 'User B',
    },
  };

  it('strictly rejects unauthorized user (User A) from accessing User B ticket', async () => {
    const mockPrisma = {
      supportTicket: {
        findUnique: vi.fn().mockResolvedValue(mockTicketRecord),
      },
    };

    const repo = new SupportRepository(mockPrisma as unknown as PrismaClient);

    // User A ('usr-a') with role 'USER' requests ticket owned by User B ('usr-b')
    await expect(
      repo.findByIdAndVerifyOwnership('ticket-123', 'usr-a', 'USER')
    ).rejects.toThrowError(AppError);

    try {
      await repo.findByIdAndVerifyOwnership('ticket-123', 'usr-a', 'USER');
    } catch (err: unknown) {
      expect(err).toBeInstanceOf(AppError);
      expect((err as AppError).code).toBe('AUTHORIZATION_ERROR');
    }
  });

  it('permits ticket owner (User B) to access their own ticket', async () => {
    const mockPrisma = {
      supportTicket: {
        findUnique: vi.fn().mockResolvedValue(mockTicketRecord),
      },
    };

    const repo = new SupportRepository(mockPrisma as unknown as PrismaClient);
    const ticket = await repo.findByIdAndVerifyOwnership('ticket-123', 'usr-b', 'USER');

    expect(ticket.id).toBe('ticket-123');
    expect(ticket.userId).toBe('usr-b');
  });

  it('permits STAFF and ADMIN roles to access any user ticket for triage', async () => {
    const mockPrisma = {
      supportTicket: {
        findUnique: vi.fn().mockResolvedValue(mockTicketRecord),
      },
    };

    const repo = new SupportRepository(mockPrisma as unknown as PrismaClient);

    const staffAccess = await repo.findByIdAndVerifyOwnership('ticket-123', 'usr-staff-99', 'STAFF');
    expect(staffAccess.id).toBe('ticket-123');

    const adminAccess = await repo.findByIdAndVerifyOwnership('ticket-123', 'usr-admin-01', 'ADMIN');
    expect(adminAccess.id).toBe('ticket-123');
  });

  it('throws NOT_FOUND when ticket does not exist', async () => {
    const mockPrisma = {
      supportTicket: {
        findUnique: vi.fn().mockResolvedValue(null),
      },
    };

    const repo = new SupportRepository(mockPrisma as unknown as PrismaClient);

    await expect(
      repo.findByIdAndVerifyOwnership('non-existent-id', 'usr-a', 'USER')
    ).rejects.toThrowError(AppError);

    try {
      await repo.findByIdAndVerifyOwnership('non-existent-id', 'usr-a', 'USER');
    } catch (err: unknown) {
      expect(err).toBeInstanceOf(AppError);
      expect((err as AppError).code).toBe('NOT_FOUND_ERROR');
    }
  });
});
