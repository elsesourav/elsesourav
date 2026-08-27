import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HelpService } from '@/services/help.service';
import { SupportService } from '@/services/support.service';
import type {
  IHelpCategoryRepository,
  IHelpArticleRepository,
  IHelpArticleFeedbackRepository,
  ISupportRepository,
} from '@/repositories/interfaces';
import type { HelpArticle, HelpCategory, ArticleHelpfulnessFeedback } from '@/types/help.types';
import type { SupportTicket, SupportTicketMessage } from '@/types/support.types';
import { ok } from '@/lib/result';
import { PRIMARY_NAVIGATION } from '@/constants/navigation';
import { ROUTES } from '@/constants/routes';

describe('Prompt 40: Help Center & Support Ticket Full Integration Suite (20 Steps)', () => {
  // Mock data
  const mockCategory: HelpCategory = {
    id: 'cat-cli',
    name: 'Command Line Tools',
    slug: 'cli-tools',
    description: 'Guides on using and installing CLI tools.',
    icon: 'terminal',
    orderIndex: 1,
    isActive: true,
    createdAt: 1700000000000,
    updatedAt: 1700000000000,
  };

  const mockArticle: HelpArticle = {
    id: 'art-install-cli',
    categoryId: 'cat-cli',
    title: 'Installing ElseSourav CLI',
    slug: 'installing-cli',
    excerpt: 'Step-by-step instructions to install the CLI on macOS and Linux.',
    content: 'Run `brew install elsesourav/tap/cli` to install.',
    status: 'published',
    orderIndex: 1,
    viewsCount: 10,
    helpfulCount: 5,
    unhelpfulCount: 1,
    createdAt: 1700000000000,
    updatedAt: 1700000000000,
    publishedAt: 1700000000000,
  };

  const mockDraftArticle: HelpArticle = {
    ...mockArticle,
    id: 'art-draft-cli',
    slug: 'draft-cli',
    title: 'Draft CLI Guide',
    status: 'draft',
  };

  let mockTicket: SupportTicket;
  let mockMessages: SupportTicketMessage[];

  let mockCategoryRepo: IHelpCategoryRepository;
  let mockArticleRepo: IHelpArticleRepository;
  let mockFeedbackRepo: IHelpArticleFeedbackRepository;
  let mockSupportRepo: ISupportRepository;

  let helpService: HelpService;
  let supportService: SupportService;

  beforeEach(() => {
    mockTicket = {
      id: 'ticket-101',
      ticketNumber: '#ES-TEST-101',
      userId: 'user-alice',
      userEmail: 'alice@example.com',
      userName: 'Alice Smith',
      subject: 'Help with: Installing ElseSourav CLI',
      description: 'The brew formula fails with SHA mismatch on Apple Silicon.',
      category: 'general',
      priority: 'normal',
      status: 'open',
      relatedHelpArticleId: 'art-install-cli',
      lastMessageAt: 1700000000000,
      createdAt: 1700000000000,
      updatedAt: 1700000000000,
    };

    mockMessages = [
      {
        id: 'msg-1',
        ticketId: 'ticket-101',
        senderUserId: 'user-alice',
        senderRole: 'user',
        senderName: 'Alice Smith',
        message: 'The brew formula fails with SHA mismatch on Apple Silicon.',
        attachments: [],
        createdAt: 1700000000000,
        updatedAt: 1700000000000,
      },
    ];

    mockCategoryRepo = {
      listActive: vi.fn().mockResolvedValue(ok({ items: [mockCategory], hasMore: false })),
      findBySlug: vi.fn().mockResolvedValue(ok(mockCategory)),
      checkSlugUnique: vi.fn().mockResolvedValue(ok(true)),
      findById: vi.fn().mockResolvedValue(ok(mockCategory)),
      findMany: vi.fn().mockResolvedValue(ok({ items: [mockCategory], hasMore: false })),
      create: vi.fn().mockResolvedValue(ok(mockCategory)),
      update: vi.fn().mockResolvedValue(ok(mockCategory)),
      delete: vi.fn().mockResolvedValue(ok(undefined)),
    };

    mockArticleRepo = {
      findBySlug: vi.fn().mockImplementation((slug) => {
        if (slug === 'installing-cli') return Promise.resolve(ok(mockArticle));
        if (slug === 'draft-cli') return Promise.resolve(ok(mockDraftArticle));
        return Promise.resolve(ok(null));
      }),
      createDraft: vi.fn().mockResolvedValue(ok(mockArticle)),
      listPublished: vi.fn().mockResolvedValue(ok({ items: [mockArticle], hasMore: false })),
      listByCategory: vi.fn().mockResolvedValue(ok({ items: [mockArticle], hasMore: false })),
      listFeatured: vi.fn().mockResolvedValue(ok({ items: [mockArticle], hasMore: false })),
      searchArticles: vi.fn().mockResolvedValue(ok({ items: [mockArticle], hasMore: false })),
      checkSlugUnique: vi.fn().mockResolvedValue(ok(true)),
      publish: vi.fn().mockResolvedValue(ok(mockArticle)),
      unpublish: vi.fn().mockResolvedValue(ok(mockArticle)),
      archive: vi.fn().mockResolvedValue(ok(mockArticle)),
      restore: vi.fn().mockResolvedValue(ok(mockArticle)),
      incrementHelpfulness: vi.fn().mockResolvedValue(ok(undefined)),
      findById: vi.fn().mockImplementation((id) => {
        if (id === 'art-install-cli') return Promise.resolve(ok(mockArticle));
        if (id === 'art-draft-cli') return Promise.resolve(ok(mockDraftArticle));
        return Promise.resolve(ok(null));
      }),
      findMany: vi.fn().mockResolvedValue(ok({ items: [mockArticle], hasMore: false })),
      create: vi.fn().mockResolvedValue(ok(mockArticle)),
      update: vi.fn().mockResolvedValue(ok(mockArticle)),
      delete: vi.fn().mockResolvedValue(ok(undefined)),
    };

    mockFeedbackRepo = {
      findByArticleAndUser: vi.fn().mockResolvedValue(ok(null)),
      incrementArticleHelpfulness: vi.fn().mockResolvedValue(ok(undefined)),
      findById: vi.fn().mockResolvedValue(ok(null)),
      findMany: vi.fn().mockResolvedValue(ok({ items: [], hasMore: false })),
      create: vi.fn().mockImplementation((dto) =>
        Promise.resolve(
          ok({
            id: 'fb-1',
            ...dto,
            createdAt: Date.now(),
          } as ArticleHelpfulnessFeedback)
        )
      ),
      update: vi.fn().mockResolvedValue(ok({} as ArticleHelpfulnessFeedback)),
      delete: vi.fn().mockResolvedValue(ok(undefined)),
    };

    mockSupportRepo = {
      createTicket: vi.fn().mockImplementation((dto) => {
        mockTicket = {
          id: 'ticket-101',
          ticketNumber: dto.ticketNumber || '#ES-TEST-101',
          userId: dto.userId,
          userEmail: dto.userEmail,
          userName: dto.userName,
          subject: dto.subject,
          description: dto.description,
          category: dto.category,
          priority: dto.priority || 'normal',
          status: 'open',
          relatedAppId: dto.relatedAppId,
          relatedHelpArticleId: dto.relatedHelpArticleId,
          lastMessageAt: Date.now(),
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        return Promise.resolve(ok(mockTicket));
      }),
      getTicket: vi.fn().mockImplementation((id) => {
        if (id === mockTicket.id) return Promise.resolve(ok(mockTicket));
        return Promise.resolve(ok(null));
      }),
      findByUser: vi
        .fn()
        .mockImplementation(() => Promise.resolve(ok({ items: [mockTicket], hasMore: false }))),
      listUserTickets: vi
        .fn()
        .mockImplementation(() => Promise.resolve(ok({ items: [mockTicket], hasMore: false }))),
      listAdminTickets: vi
        .fn()
        .mockImplementation(() => Promise.resolve(ok({ items: [mockTicket], hasMore: false }))),
      findByTicketNumber: vi.fn().mockImplementation(() => Promise.resolve(ok(mockTicket))),
      updateTicketStatus: vi.fn().mockImplementation((id, status) => {
        mockTicket = { ...mockTicket, id, status, updatedAt: Date.now() };
        return Promise.resolve(ok(mockTicket));
      }),
      updatePriority: vi.fn().mockImplementation((id, priority) => {
        mockTicket = { ...mockTicket, id, priority, updatedAt: Date.now() };
        return Promise.resolve(ok(mockTicket));
      }),
      addMessage: vi.fn().mockImplementation((dto) => {
        const newMsg: SupportTicketMessage = {
          id: `msg-${mockMessages.length + 1}`,
          ticketId: dto.ticketId,
          senderUserId: dto.senderUserId,
          senderRole: dto.senderRole,
          senderName: dto.senderName,
          message: dto.message,
          attachments: dto.attachments || [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        mockMessages.push(newMsg);
        return Promise.resolve(ok(newMsg));
      }),
      listMessages: vi
        .fn()
        .mockImplementation(() => Promise.resolve(ok({ items: mockMessages, hasMore: false }))),
      getMessages: vi
        .fn()
        .mockImplementation(() => Promise.resolve(ok({ items: mockMessages, hasMore: false }))),
      closeTicket: vi.fn().mockImplementation(() => {
        mockTicket = { ...mockTicket, status: 'closed', closedAt: Date.now() };
        return Promise.resolve(ok(mockTicket));
      }),
      reopenTicket: vi.fn().mockImplementation(() => {
        mockTicket = { ...mockTicket, status: 'open' };
        return Promise.resolve(ok(mockTicket));
      }),
      findById: vi.fn().mockResolvedValue(ok(mockTicket)),
      findMany: vi.fn().mockResolvedValue(ok({ items: [mockTicket], hasMore: false })),
      create: vi.fn().mockResolvedValue(ok(mockTicket)),
      update: vi.fn().mockResolvedValue(ok(mockTicket)),
      delete: vi.fn().mockResolvedValue(ok(undefined)),
    };

    helpService = new HelpService(mockCategoryRepo, mockArticleRepo, mockFeedbackRepo);
    supportService = new SupportService(mockSupportRepo);
  });

  it('Step 1: Visitor opens Help Center (Categories & Articles listed)', async () => {
    const catsRes = await helpService.listActiveCategories();
    expect(catsRes.success).toBe(true);
    if (catsRes.success && catsRes.data) {
      expect(catsRes.data.items.length).toBeGreaterThan(0);
      expect(catsRes.data.items[0]?.slug).toBe('cli-tools');
    }
  });

  it('Step 2: Visitor searches for an article', async () => {
    const searchRes = await helpService.searchArticles('CLI');
    expect(searchRes.success).toBe(true);
    if (searchRes.success && searchRes.data) {
      expect(searchRes.data.items.length).toBe(1);
      expect(searchRes.data.items[0]?.title).toContain('CLI');
    }
  });

  it('Step 3: Visitor opens published article detail', async () => {
    const articleRes = await helpService.getArticleBySlug('installing-cli');
    expect(articleRes.success).toBe(true);
    if (articleRes.success && articleRes.data) {
      expect(articleRes.data.title).toBe('Installing ElseSourav CLI');
      expect(articleRes.data.status).toBe('published');
    }
  });

  it('Step 4: Visitor marks article helpful', async () => {
    const voteRes = await helpService.submitHelpfulness({
      articleId: 'art-install-cli',
      helpful: true,
      sessionId: 'session-v1',
      userId: 'user-alice',
    });
    expect(voteRes.success).toBe(true);
    expect(mockFeedbackRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        articleId: 'art-install-cli',
        helpful: true,
        sessionId: 'session-v1',
      })
    );
  });

  it('Step 5: Visitor marks article not helpful', async () => {
    const voteRes = await helpService.submitHelpfulness({
      articleId: 'art-install-cli',
      helpful: false,
      sessionId: 'session-v2',
    });
    expect(voteRes.success).toBe(true);
    expect(mockFeedbackRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        articleId: 'art-install-cli',
        helpful: false,
        sessionId: 'session-v2',
      })
    );
  });

  it('Step 6 & 7: Visitor chooses Contact Support -> Authenticated user creates ticket with context', async () => {
    const userAlice = {
      id: 'user-alice',
      email: 'alice@example.com',
      name: 'Alice Smith',
      role: 'user' as const,
    };
    const ticketRes = await supportService.createTicket(
      {
        subject: 'Help with: Installing ElseSourav CLI',
        description: 'The brew formula fails with SHA mismatch on Apple Silicon.',
        category: 'general',
        relatedHelpArticleId: 'art-install-cli',
      },
      userAlice
    );

    expect(ticketRes.success).toBe(true);
    if (ticketRes.success && ticketRes.data) {
      expect(ticketRes.data.subject).toBe('Help with: Installing ElseSourav CLI');
      expect(ticketRes.data.relatedHelpArticleId).toBe('art-install-cli');
      expect(ticketRes.data.status).toBe('open');
      expect(ticketRes.data.priority).toBe('normal');
    }
  });

  it('Step 8: User sees ticket in their personal history', async () => {
    const userAlice = { id: 'user-alice', role: 'user' as const };
    const listRes = await supportService.listUserTickets('user-alice', userAlice);

    expect(listRes.success).toBe(true);
    if (listRes.success && listRes.data) {
      expect(listRes.data.items.length).toBe(1);
      expect(listRes.data.items[0]?.userId).toBe('user-alice');
    }
  });

  it('Step 9: User opens ticket detail', async () => {
    const userAlice = { id: 'user-alice', role: 'user' as const };
    const ticketRes = await supportService.getTicket('ticket-101', userAlice);

    expect(ticketRes.success).toBe(true);
    if (ticketRes.success && ticketRes.data) {
      expect(ticketRes.data.id).toBe('ticket-101');
      expect(ticketRes.data.ticketNumber).toBe('#ES-TEST-101');
    }
  });

  it('Step 10: User sends message on ticket thread', async () => {
    const userAlice = { id: 'user-alice', name: 'Alice Smith', role: 'user' as const };
    const msgRes = await supportService.addMessage(
      {
        ticketId: 'ticket-101',
        message: 'Here is the brew error log: Error: SHA256 mismatch.',
      },
      userAlice
    );

    expect(msgRes.success).toBe(true);
    if (msgRes.success && msgRes.data) {
      expect(msgRes.data.senderRole).toBe('user');
      expect(msgRes.data.message).toContain('Error: SHA256 mismatch');
    }
  });

  it('Step 11: Admin accesses ticket queue', async () => {
    const admin = { id: 'admin-1', role: 'admin' as const };
    const listRes = await supportService.listAdminTickets(admin);

    expect(listRes.success).toBe(true);
    if (listRes.success && listRes.data) {
      expect(listRes.data.items.length).toBeGreaterThan(0);
    }
  });

  it('Step 12: Admin replies to ticket (transitions status to waiting_for_user)', async () => {
    const admin = { id: 'admin-1', name: 'Sourav (Dev)', role: 'admin' as const };
    const replyRes = await supportService.addMessage(
      {
        ticketId: 'ticket-101',
        message: 'Fixed the formula SHA in v1.2.1. Please run brew update and try again.',
      },
      admin
    );

    expect(replyRes.success).toBe(true);
    if (replyRes.success && replyRes.data) {
      expect(replyRes.data.senderRole).toBe('admin');
    }
    expect(mockSupportRepo.updateTicketStatus).toHaveBeenCalledWith(
      'ticket-101',
      'waiting_for_user'
    );
  });

  it('Step 13: Admin updates ticket status to in_progress', async () => {
    const admin = { id: 'admin-1', role: 'admin' as const };
    const statusRes = await supportService.updateTicketStatus('ticket-101', 'in_progress', admin);

    expect(statusRes.success).toBe(true);
    if (statusRes.success && statusRes.data) {
      expect(statusRes.data.status).toBe('in_progress');
    }
  });

  it('Step 14: User sees updated status on ticket', async () => {
    const admin = { id: 'admin-1', role: 'admin' as const };
    await supportService.updateTicketStatus('ticket-101', 'in_progress', admin);

    const userAlice = { id: 'user-alice', role: 'user' as const };
    const ticketRes = await supportService.getTicket('ticket-101', userAlice);

    expect(ticketRes.success).toBe(true);
    if (ticketRes.success && ticketRes.data) {
      expect(ticketRes.data.status).toBe('in_progress');
    }
  });

  it('Step 15: User marks ticket resolved/closed when issue is solved', async () => {
    const userAlice = { id: 'user-alice', role: 'user' as const };
    const resolveRes = await supportService.updateTicketStatus('ticket-101', 'resolved', userAlice);

    expect(resolveRes.success).toBe(true);
    expect(mockSupportRepo.updateTicketStatus).toHaveBeenCalledWith('ticket-101', 'resolved');
  });

  it('Step 16: Admin can reopen ticket if needed', async () => {
    const admin = { id: 'admin-1', role: 'admin' as const };
    const reopenRes = await supportService.reopenTicket('ticket-101', admin);

    expect(reopenRes.success).toBe(true);
    expect(mockSupportRepo.reopenTicket).toHaveBeenCalledWith('ticket-101');
  });

  it("Step 17: User cannot access another user's ticket (FORBIDDEN)", async () => {
    const userBob = { id: 'user-bob', role: 'user' as const };
    const forbiddenRes = await supportService.getTicket('ticket-101', userBob);

    expect(forbiddenRes.success).toBe(false);
    if (!forbiddenRes.success) {
      expect(forbiddenRes.error.code).toBe('FORBIDDEN');
    }
  });

  it('Step 18: Public discovery filters out non-existent/invalid articles', async () => {
    const notFoundRes = await helpService.getArticleBySlug('non-existent-article');
    expect(notFoundRes.success).toBe(true);
    if (notFoundRes.success) {
      expect(notFoundRes.data).toBeNull();
    }
  });

  it('Step 19: App-specific support context preselection works with relational IDs', async () => {
    const userAlice = { id: 'user-alice', role: 'user' as const };
    const appTicketRes = await supportService.createTicket(
      {
        subject: 'Issue with app: Terminal Pro',
        description: 'Encountering crash on startup.',
        category: 'app_issue',
        relatedAppId: 'app-terminal-pro',
      },
      userAlice
    );

    expect(appTicketRes.success).toBe(true);
    if (appTicketRes.success && appTicketRes.data) {
      expect(appTicketRes.data.relatedAppId).toBe('app-terminal-pro');
      expect(appTicketRes.data.category).toBe('app_issue');
    }
  });

  it('Step 20: Global Navigation routes (Home, Apps, Blog, Help, Support, About) remain fully functional', () => {
    expect(PRIMARY_NAVIGATION.map((n) => n.path)).toEqual([
      ROUTES.HOME,
      ROUTES.APPS,
      ROUTES.BLOG,
      ROUTES.HELP,
      ROUTES.SUPPORT,
      ROUTES.ABOUT,
    ]);
  });
});
