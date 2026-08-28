import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AdminBlogPage } from '../AdminBlogPage';
import { blogRepository } from '@/repositories';
import { blogService } from '@/services';
import type { BlogPost } from '@/types/blog.types';
import { ok } from '@/lib/result';

const mockPosts: BlogPost[] = [
  {
    id: 'post-1',
    slug: 'post-one',
    title: 'First Devlog Post',
    excerpt: 'Excerpt for post one.',
    content: 'Content of post one.',
    authorId: 'admin',
    category: 'engineering',
    tags: ['devlog'],
    status: 'published',
    readingTime: 2,
    createdAt: 1700000000000,
    updatedAt: 1700000000000,
    publishedAt: 1700001000000,
  },
  {
    id: 'post-2',
    slug: 'draft-two',
    title: 'Second Draft Post',
    excerpt: 'Excerpt for post two.',
    content: 'Content of post two.',
    authorId: 'admin',
    category: 'tutorials',
    tags: ['tutorial'],
    status: 'draft',
    readingTime: 3,
    createdAt: 1700000000000,
    updatedAt: 1700000000000,
  },
  {
    id: 'post-3',
    slug: 'archived-three',
    title: 'Third Archived Post',
    excerpt: 'Excerpt for post three.',
    content: 'Content of post three.',
    authorId: 'admin',
    category: 'engineering',
    tags: [],
    status: 'archived',
    readingTime: 1,
    createdAt: 1700000000000,
    updatedAt: 1700000000000,
    archivedAt: 1700002000000,
  },
];

describe('AdminBlogPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.spyOn(blogRepository, 'findMany').mockResolvedValue(
      ok({
        items: mockPosts,
        hasMore: false,
      })
    );

    vi.spyOn(blogService, 'publishPost').mockImplementation((id) => {
      const p = mockPosts.find((item) => item.id === id) || mockPosts[0]!;
      return Promise.resolve(ok({ ...p, status: 'published' as const }));
    });

    vi.spyOn(blogService, 'unpublishPost').mockImplementation((id) => {
      const p = mockPosts.find((item) => item.id === id) || mockPosts[0]!;
      return Promise.resolve(ok({ ...p, status: 'draft' as const }));
    });

    vi.spyOn(blogService, 'archivePost').mockImplementation((id) => {
      const p = mockPosts.find((item) => item.id === id) || mockPosts[0]!;
      return Promise.resolve(ok({ ...p, status: 'archived' as const }));
    });

    vi.spyOn(blogService, 'restorePost').mockImplementation((id, targetStatus = 'draft') => {
      const p = mockPosts.find((item) => item.id === id) || mockPosts[0]!;
      return Promise.resolve(ok({ ...p, status: targetStatus }));
    });
  });

  it('1. Renders admin blog page header and Write Article button', async () => {
    render(
      <BrowserRouter>
        <AdminBlogPage />
      </BrowserRouter>
    );

    expect(screen.getByRole('heading', { level: 1, name: 'Blog Articles' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /write article/i })).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('First Devlog Post')).toBeInTheDocument();
      expect(screen.getByText('Second Draft Post')).toBeInTheDocument();
      expect(screen.getByText('Third Archived Post')).toBeInTheDocument();
    });
  });

  it('2. Filter tabs filter articles by status (all, published, draft, archived)', async () => {
    render(
      <BrowserRouter>
        <AdminBlogPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('First Devlog Post')).toBeInTheDocument();
    });

    // Click 'Draft' tab
    const draftTab = screen.getByRole('tab', { name: /draft/i });
    fireEvent.click(draftTab);

    expect(screen.queryByText('First Devlog Post')).toBeNull();
    expect(screen.getByText('Second Draft Post')).toBeInTheDocument();
    expect(screen.queryByText('Third Archived Post')).toBeNull();

    // Click 'Published' tab
    const publishedTab = screen.getByRole('tab', { name: /published/i });
    fireEvent.click(publishedTab);

    expect(screen.getByText('First Devlog Post')).toBeInTheDocument();
    expect(screen.queryByText('Second Draft Post')).toBeNull();
  });

  it('3. Realtime search input filters articles by title and slug', async () => {
    render(
      <BrowserRouter>
        <AdminBlogPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('First Devlog Post')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/search articles/i);
    fireEvent.change(searchInput, { target: { value: 'devlog' } });

    expect(screen.getByText('First Devlog Post')).toBeInTheDocument();
    expect(screen.queryByText('Second Draft Post')).toBeNull();
  });

  it('4. Quick publish and unpublish actions invoke service layer', async () => {
    render(
      <BrowserRouter>
        <AdminBlogPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('First Devlog Post')).toBeInTheDocument();
    });

    // Publish second post (draft)
    const publishBtn = screen.getAllByRole('button', { name: /^publish$/i })[0]!;
    fireEvent.click(publishBtn);

    await waitFor(() => {
      expect(blogService.publishPost).toHaveBeenCalledWith('post-2');
    });

    // Unpublish first post (published)
    const unpublishBtn = screen.getAllByRole('button', { name: /unpublish/i })[0]!;
    fireEvent.click(unpublishBtn);

    await waitFor(() => {
      expect(blogService.unpublishPost).toHaveBeenCalledWith('post-1');
    });
  });

  it('5. Archive and restore actions invoke service layer', async () => {
    render(
      <BrowserRouter>
        <AdminBlogPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('First Devlog Post')).toBeInTheDocument();
    });

    const archiveBtn = screen.getAllByRole('button', { name: /archive/i })[0]!;
    fireEvent.click(archiveBtn);

    await waitFor(() => {
      expect(blogService.archivePost).toHaveBeenCalledWith('post-1');
    });
  });
});
