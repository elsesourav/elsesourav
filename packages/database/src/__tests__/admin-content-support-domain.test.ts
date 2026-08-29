import { describe, it, expect, vi } from 'vitest';
import {
  BlogService,
  BlogRepository,
  HelpService,
  HelpRepository,
  SupportService,
  SupportRepository,
} from '../index';
import { AppError } from '@elsesourav/types';
import type {
  BlogPost,
  HelpArticle,
  SupportTicketDetail,
  SupportTicketListItem,
} from '@elsesourav/types';

describe('Admin Content (Blog & Help) and Support Domain Security', () => {
  // ==========================================
  // Blog Admin & Security
  // ==========================================
  describe('Blog Admin CMS', () => {
    const mockPost: BlogPost = {
      id: 'post-1',
      title: 'Building ElseSourav',
      slug: 'building-elsesourav',
      excerpt: 'Comprehensive architectural deep dive.',
      content: 'Detailed markdown content explaining Next.js 15 architecture.',
      status: 'draft',
      categoryId: 'cat-eng',
      tags: [],
      readingTime: 3,
      viewsCount: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    it('allows ADMIN to create and publish a blog article', async () => {
      const mockRepo = {
        createPost: vi.fn().mockResolvedValue(mockPost),
        publishPost: vi.fn().mockResolvedValue({ ...mockPost, status: 'published' }),
      } as unknown as BlogRepository;

      const service = new BlogService(mockRepo);

      const created = await service.createBlogPost('admin-1', 'ADMIN', {
        title: 'Building ElseSourav',
        excerpt: 'Comprehensive architectural deep dive.',
        content: 'Detailed markdown content explaining Next.js 15 architecture.',
        categoryId: 'cat-eng',
      });
      expect(created.id).toBe('post-1');

      const published = await service.publishBlogPost('ADMIN', 'post-1');
      expect(published.status).toBe('published');
    });

    it('strictly forbids normal USER from creating a blog article', async () => {
      const mockRepo = { createPost: vi.fn() } as unknown as BlogRepository;
      const service = new BlogService(mockRepo);

      await expect(
        service.createBlogPost('user-1', 'USER', {
          title: 'Unauthorized Post',
          excerpt: 'Short description text here.',
          content: 'Detailed content text with more than 50 characters required for validation.',
          categoryId: 'cat-1',
        })
      ).rejects.toThrowError(AppError);
    });

    it('strictly forbids normal USER from publishing or deleting a blog article', async () => {
      const mockRepo = {
        publishPost: vi.fn(),
        deletePost: vi.fn(),
      } as unknown as BlogRepository;

      const service = new BlogService(mockRepo);

      await expect(service.publishBlogPost('USER', 'post-1')).rejects.toThrowError(AppError);
      await expect(service.deleteBlogPost('USER', 'post-1')).rejects.toThrowError(AppError);
    });
  });

  // ==========================================
  // Help Desk Admin & Security
  // ==========================================
  describe('Help Desk Knowledge Base CMS', () => {
    const mockArticle: HelpArticle = {
      id: 'help-1',
      title: 'How to install extensions',
      slug: 'how-to-install-extensions',
      content: 'Step by step installation guide.',
      categoryId: 'cat-help',
      status: 'draft',
      orderIndex: 0,
      helpfulCount: 0,
      unhelpfulCount: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    it('allows ADMIN to create, update, and publish help articles', async () => {
      const mockRepo = {
        createArticle: vi.fn().mockResolvedValue(mockArticle),
        updateArticle: vi.fn().mockResolvedValue({ ...mockArticle, orderIndex: 5 }),
        publishArticle: vi.fn().mockResolvedValue({ ...mockArticle, status: 'published' }),
      } as unknown as HelpRepository;

      const service = new HelpService(mockRepo);

      const created = await service.createArticle('admin-1', 'ADMIN', {
        title: 'How to install extensions',
        content: 'Step by step installation guide with enough characters.',
        categoryId: 'cat-help',
      });
      expect(created.id).toBe('help-1');

      const updated = await service.updateArticle('ADMIN', 'help-1', {
        orderIndex: 5,
      });
      expect(updated.orderIndex).toBe(5);

      const published = await service.publishArticle('ADMIN', 'help-1');
      expect(published.status).toBe('published');
    });

    it('strictly forbids normal USER from creating or publishing help articles', async () => {
      const mockRepo = {
        createArticle: vi.fn(),
        publishArticle: vi.fn(),
      } as unknown as HelpRepository;

      const service = new HelpService(mockRepo);

      await expect(
        service.createArticle('user-1', 'USER', {
          title: 'Unauthorized Help',
          content: 'Content here with enough characters for validation.',
          categoryId: 'cat-1',
        })
      ).rejects.toThrowError(AppError);

      await expect(service.publishArticle('USER', 'help-1')).rejects.toThrowError(AppError);
    });
  });

  // ==========================================
  // Support Admin & Security
  // ==========================================
  describe('Support Admin Workspace', () => {
    const mockTicketItem: SupportTicketListItem = {
      id: 'ticket-1',
      ticketNumber: 'TICK-987654',
      userId: 'user-regular',
      subject: 'Login issues with OAuth',
      category: 'account',
      priority: 'high',
      status: 'open',
      lastMessageAt: Date.now(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const mockTicketDetail: SupportTicketDetail = {
      ...mockTicketItem,
      description: 'Cannot login with Google account.',
      messages: [],
    };

    it('allows ADMIN to query all tickets and change status', async () => {
      const mockRepo = {
        findAllTickets: vi.fn().mockResolvedValue([mockTicketItem]),
        updateTicketStatus: vi.fn().mockResolvedValue(undefined),
      } as unknown as SupportRepository;

      const service = new SupportService(mockRepo);

      const allTickets = await service.getAllTicketsAdmin('ADMIN');
      expect(allTickets.length).toBe(1);
      expect(allTickets[0]?.ticketNumber).toBe('TICK-987654');

      await expect(
        service.updateTicketStatusAdmin('ADMIN', 'ticket-1', 'in_progress')
      ).resolves.not.toThrow();

      expect(mockRepo.updateTicketStatus).toHaveBeenCalledWith('ticket-1', 'in_progress');
    });

    it('strictly blocks normal USER from retrieving all support tickets', async () => {
      const mockRepo = { findAllTickets: vi.fn() } as unknown as SupportRepository;
      const service = new SupportService(mockRepo);

      await expect(service.getAllTicketsAdmin('USER')).rejects.toThrowError(AppError);
      expect(mockRepo.findAllTickets).not.toHaveBeenCalled();
    });

    it('strictly blocks normal USER from viewing another user ticket', async () => {
      const mockRepo = {
        findTicketDetail: vi.fn().mockResolvedValue(mockTicketDetail),
      } as unknown as SupportRepository;

      const service = new SupportService(mockRepo);

      // Caller is 'other-user-99' trying to view 'user-regular' ticket
      await expect(
        service.getTicketDetail('other-user-99', 'USER', 'ticket-1')
      ).rejects.toThrowError(AppError);
    });

    it('forces isInternalNote to false if a normal USER attempts to send internal notes', async () => {
      const mockRepo = {
        findTicketDetail: vi.fn().mockResolvedValue(mockTicketDetail),
        addMessage: vi.fn().mockResolvedValue({
          id: 'msg-1',
          ticketId: 'ticket-1',
          senderUserId: 'user-regular',
          senderRole: 'USER',
          message: 'Hello support',
          isInternalNote: false,
          createdAt: Date.now(),
        }),
      } as unknown as SupportRepository;

      const service = new SupportService(mockRepo);

      await service.replyToTicket(
        'user-regular',
        'USER',
        'ticket-1',
        'Hello support',
        [],
        true // normal user trying to post as internal note
      );

      // Verified effectiveInternalNote is forced to false
      expect(mockRepo.addMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          isInternalNote: false,
        })
      );
    });
  });
});
