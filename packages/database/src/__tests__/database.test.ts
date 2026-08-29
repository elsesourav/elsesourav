import { describe, it, expect, vi } from 'vitest';
import {
  mapPrismaAppToDomain,
  mapPrismaUserToDomain,
  mapPrismaBlogPostToDomain,
  AppRepository,
  UserRepository,
  BlogRepository,
  AuditRepository,
} from '../index';
import { PublishStatus, UserRole, PrismaClient } from '@prisma/client';

describe('Prisma Model Mappers', () => {
  it('maps Prisma App model to Domain App entity correctly', () => {
    const prismaApp = {
      id: 'app-1',
      slug: 'terminal-pro',
      name: 'Terminal Pro',
      shortDescription: 'Hardware accelerated terminal',
      description: 'Full featured web terminal',
      iconUrl: 'https://elsesourav.com/icon.png',
      featuredImageUrl: null,
      demoUrl: null,
      videoUrl: null,
      status: PublishStatus.PUBLISHED,
      sortOrder: 1,
      isFeatured: true,
      isPinned: false,
      currentVersion: '2.1.0',
      seoTitle: null,
      seoDescription: null,
      publishedAt: new Date('2026-01-01T00:00:00Z'),
      createdAt: new Date('2026-01-01T00:00:00Z'),
      updatedAt: new Date('2026-01-02T00:00:00Z'),
      deletedAt: null,
      categoryId: 'cat-1',
      category: { id: 'cat-1', name: 'Developer Tools', slug: 'dev-tools', description: null, icon: null, orderIndex: 0, isActive: true },
      tags: [{ tag: { id: 'tag-1', name: 'CLI', slug: 'cli' } }],
      links: [
        {
          id: 'link-1',
          appId: 'app-1',
          platform: 'web',
          label: 'Launch Web App',
          url: 'https://terminal.elsesourav.com',
          action: 'open_app',
          isPrimary: true,
          displayOrder: 0,
          isActive: true,
        },
      ],
      versions: [
        {
          id: 'ver-1',
          appId: 'app-1',
          version: '2.1.0',
          releaseDate: new Date('2026-01-01T00:00:00Z'),
          changelog: 'Initial v2 release',
          downloadUrl: null,
        },
      ],
      stats: {
        appId: 'app-1',
        views: 100,
        launches: 50,
        libraryAdds: 20,
        ratingAverage: 4.8,
        ratingCount: 10,
      },
    };

    const domain = mapPrismaAppToDomain(prismaApp);
    expect(domain.id).toBe('app-1');
    expect(domain.slug).toBe('terminal-pro');
    expect(domain.primaryCategory).toBe('Developer Tools');
    expect(domain.tags).toContain('cli');
    expect(domain.status).toBe('published');
    expect(domain.currentVersion).toBe('2.1.0');
    expect(domain.links[0]?.url).toBe('https://terminal.elsesourav.com');
  });

  it('maps Prisma User model to Domain User entity', () => {
    const prismaUser = {
      id: 'usr-1',
      supabaseAuthId: 'sb-auth-123',
      email: 'sourav@elsesourav.com',
      displayName: 'Sourav',
      username: 'elsesourav',
      photoUrl: null,
      bio: 'Software Engineer',
      role: UserRole.ADMIN,
      preferences: { theme: 'dark' as const, emailNotifications: true, reduceMotion: false, compactView: false },
      createdAt: new Date('2026-01-01T00:00:00Z'),
      updatedAt: new Date('2026-01-01T00:00:00Z'),
      deletedAt: null,
    };

    const domain = mapPrismaUserToDomain(prismaUser);
    expect(domain.id).toBe('usr-1');
    expect(domain.email).toBe('sourav@elsesourav.com');
    expect(domain.role).toBe('ADMIN');
    expect(domain.status).toBe('active');
  });

  it('maps Prisma BlogPost model to Domain BlogPost entity', () => {
    const prismaPost = {
      id: 'post-1',
      slug: 'architecture-v2',
      title: 'Building V2 Architecture',
      excerpt: 'Overview of V2 changes',
      content: 'Detailed technical article content...',
      coverImageUrl: null,
      status: PublishStatus.PUBLISHED,
      readingTime: 5,
      viewsCount: 150,
      publishedAt: new Date('2026-02-01T00:00:00Z'),
      createdAt: new Date('2026-02-01T00:00:00Z'),
      updatedAt: new Date('2026-02-02T00:00:00Z'),
      deletedAt: null,
      categoryId: 'cat-1',
      category: { id: 'cat-1', name: 'Engineering', slug: 'engineering', description: null, orderIndex: 0 },
      authorId: null,
      author: null,
      seoTitle: null,
      seoDescription: null,
      tags: [],
    };

    const domain = mapPrismaBlogPostToDomain(prismaPost);
    expect(domain.slug).toBe('architecture-v2');
    expect(domain.category?.slug).toBe('engineering');
    expect(domain.viewsCount).toBe(150);
  });
});

describe('Database Repositories Architecture', () => {
  it('instantiates AppRepository and delegates queries to Prisma', async () => {
    const mockPrisma = {
      app: {
        findUnique: vi.fn().mockResolvedValue(null),
        findMany: vi.fn().mockResolvedValue([]),
        count: vi.fn().mockResolvedValue(10),
      },
    };

    const repo = new AppRepository(mockPrisma as unknown as PrismaClient);
    const count = await repo.countPublished();
    expect(count).toBe(10);
    expect(mockPrisma.app.count).toHaveBeenCalledTimes(1);
  });

  it('instantiates UserRepository and delegates queries to Prisma', async () => {
    const mockPrisma = {
      user: {
        findUnique: vi.fn().mockResolvedValue(null),
        count: vi.fn().mockResolvedValue(42),
      },
    };

    const repo = new UserRepository(mockPrisma as unknown as PrismaClient);
    const count = await repo.countActiveUsers();
    expect(count).toBe(42);
  });

  it('instantiates BlogRepository and delegates view increment', async () => {
    const mockPrisma = {
      blogPost: {
        update: vi.fn().mockResolvedValue({}),
      },
    };

    const repo = new BlogRepository(mockPrisma as unknown as PrismaClient);
    await repo.incrementViews('post-1');
    expect(mockPrisma.blogPost.update).toHaveBeenCalledWith({
      where: { id: 'post-1' },
      data: { viewsCount: { increment: 1 } },
    });
  });

  it('instantiates AuditRepository and logs actions', async () => {
    const mockRecord = {
      id: 'audit-1',
      userId: 'usr-1',
      action: 'APP_CREATED',
      entityType: 'App',
      entityId: 'app-1',
      details: {},
      ipAddress: '127.0.0.1',
      userAgent: 'Mozilla/5.0',
      timestamp: new Date(),
    };

    const mockPrisma = {
      auditLog: {
        create: vi.fn().mockResolvedValue(mockRecord),
      },
    };

    const repo = new AuditRepository(mockPrisma as unknown as PrismaClient);
    const log = await repo.logAction({
      userId: 'usr-1',
      action: 'APP_CREATED',
      entityType: 'App',
      entityId: 'app-1',
    });

    expect(log.action).toBe('APP_CREATED');
    expect(mockPrisma.auditLog.create).toHaveBeenCalled();
  });
});
