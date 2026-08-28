import { describe, it, expect, vi } from 'vitest';
import { AppRepository, UserRepository } from '../index';
import { PrismaClient, PublishStatus, UserRole } from '@prisma/client';

describe('AppRepository Contracts & Query Protections', () => {
  it('enforces maximum query limits on list operation', async () => {
    const mockPrisma = {
      app: {
        findMany: vi.fn().mockResolvedValue([]),
      },
    };

    const repo = new AppRepository(mockPrisma as unknown as PrismaClient);

    // Requesting excessive limit of 1000 must be bounded to 50
    await repo.list({ limit: 1000 });

    expect(mockPrisma.app.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        take: 50,
      })
    );
  });

  it('restricts sorting to safe allow-listed fields', async () => {
    const mockPrisma = {
      app: {
        findMany: vi.fn().mockResolvedValue([]),
      },
    };

    const repo = new AppRepository(mockPrisma as unknown as PrismaClient);

    // Requesting invalid sortField should fallback to 'sortOrder'
    await repo.list({ sortField: 'malicious_sql_field' as unknown as 'createdAt', sortDirection: 'desc' });

    expect(mockPrisma.app.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { sortOrder: 'desc' },
      })
    );
  });

  it('sanitizes and bounds search queries to 50 characters', async () => {
    const mockPrisma = {
      app: {
        findMany: vi.fn().mockResolvedValue([]),
      },
    };

    const repo = new AppRepository(mockPrisma as unknown as PrismaClient);
    const longSearchString = 'a'.repeat(100);

    await repo.list({ search: longSearchString });

    expect(mockPrisma.app.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: [
            { name: { contains: 'a'.repeat(50), mode: 'insensitive' } },
            { shortDescription: { contains: 'a'.repeat(50), mode: 'insensitive' } },
          ],
        }),
      })
    );
  });

  it('executes atomic publish transaction with version creation', async () => {
    const mockTx = {
      appVersion: {
        create: vi.fn().mockResolvedValue({ id: 'ver-1' }),
      },
      app: {
        update: vi.fn().mockResolvedValue({
          id: 'app-1',
          slug: 'terminal-pro',
          name: 'Terminal Pro',
          shortDescription: 'Hardware accelerated terminal',
          description: 'Full featured terminal emulator',
          iconUrl: 'https://icon.png',
          status: PublishStatus.PUBLISHED,
          currentVersion: '2.1.0',
          sortOrder: 0,
          isFeatured: true,
          isPinned: false,
          publishedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      },
    };

    const mockPrisma = {
      $transaction: vi.fn().mockImplementation(async (cb: (tx: typeof mockTx) => Promise<unknown>) => cb(mockTx)),
    };

    const repo = new AppRepository(mockPrisma as unknown as PrismaClient);
    const result = await repo.publishWithVersionTransaction('app-1', {
      version: '2.1.0',
      changelog: 'Added WebGL renderer',
    });

    expect(mockTx.appVersion.create).toHaveBeenCalledTimes(1);
    expect(mockTx.app.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'app-1' },
        data: expect.objectContaining({
          status: PublishStatus.PUBLISHED,
          currentVersion: '2.1.0',
        }),
      })
    );
    expect(result.currentVersion).toBe('2.1.0');
    expect(result.status).toBe('published');
  });
});

describe('UserRepository Transactions & Audit Trail', () => {
  it('updates role and generates audit log in atomic transaction', async () => {
    const mockTx = {
      user: {
        update: vi.fn().mockResolvedValue({
          id: 'usr-target',
          supabaseAuthId: 'sb-1',
          email: 'target@example.com',
          displayName: 'Target User',
          role: UserRole.STAFF,
          preferences: {},
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      },
      auditLog: {
        create: vi.fn().mockResolvedValue({ id: 'audit-1' }),
      },
    };

    const mockPrisma = {
      $transaction: vi.fn().mockImplementation(async (cb: (tx: typeof mockTx) => Promise<unknown>) => cb(mockTx)),
    };

    const repo = new UserRepository(mockPrisma as unknown as PrismaClient);
    const updated = await repo.updateRole('usr-target', 'STAFF', 'usr-admin');

    expect(mockTx.user.update).toHaveBeenCalledWith({
      where: { id: 'usr-target' },
      data: { role: 'STAFF' },
    });
    expect(mockTx.auditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: 'usr-admin',
        action: 'USER_ROLE_UPDATED',
        entityId: 'usr-target',
      }),
    });
    expect(updated.role).toBe('STAFF');
  });
});
