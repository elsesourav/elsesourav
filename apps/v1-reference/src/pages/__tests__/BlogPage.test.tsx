import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { BlogPage } from '../BlogPage';
import { blogService } from '@/services/blog.service';
import type { BlogPost, BlogCategory } from '@/types/blog.types';
import { ok } from '@/lib/result';

const mockPosts: BlogPost[] = [
  {
    id: 'post-1',
    slug: 'post-one',
    title: 'First Architecture Article',
    excerpt: 'Deep dive into performant web engines.',
    content: '# Content One\n\nDiscussion on engines.',
    authorId: 'admin',
    category: 'engineering',
    tags: ['performance'],
    status: 'published',
    isFeatured: true,
    readingTime: 2,
    createdAt: 1700000000000,
    updatedAt: 1700000000000,
    publishedAt: 1700001000000,
  },
  {
    id: 'post-2',
    slug: 'post-two',
    title: 'Second Tutorial Article',
    excerpt: 'Step-by-step guide to React 19.',
    content: '# Content Two\n\nTutorial details.',
    authorId: 'admin',
    category: 'tutorials',
    tags: ['react'],
    status: 'published',
    isFeatured: false,
    readingTime: 4,
    createdAt: 1700000000000,
    updatedAt: 1700000000000,
    publishedAt: 1700002000000,
  },
];

const mockCategories: BlogCategory[] = [
  {
    id: 'cat-1',
    name: 'Engineering',
    slug: 'engineering',
    orderIndex: 0,
    isActive: true,
    createdAt: 1700000000000,
    updatedAt: 1700000000000,
  },
  {
    id: 'cat-2',
    name: 'Tutorials',
    slug: 'tutorials',
    orderIndex: 1,
    isActive: true,
    createdAt: 1700000000000,
    updatedAt: 1700000000000,
  },
];

describe('BlogPage Catalog Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.spyOn(blogService, 'listActiveCategories').mockResolvedValue(
      ok({
        items: mockCategories,
        hasMore: false,
      })
    );

    vi.spyOn(blogService, 'listFeaturedPosts').mockResolvedValue(
      ok({
        items: [mockPosts[0]!],
        hasMore: false,
      })
    );

    vi.spyOn(blogService, 'listPublishedPosts').mockResolvedValue(
      ok({
        items: mockPosts,
        hasMore: true,
        nextCursor: 'cursor-doc-2',
      })
    );

    vi.spyOn(blogService, 'listPostsByCategory').mockImplementation((cat) =>
      Promise.resolve(
        ok({
          items: mockPosts.filter((p) => p.category === cat),
          hasMore: false,
        })
      )
    );

    vi.spyOn(blogService, 'listPostsByTag').mockImplementation((tag) =>
      Promise.resolve(
        ok({
          items: mockPosts.filter((p) => p.tags.includes(tag)),
          hasMore: false,
        })
      )
    );
  });

  it('1. Renders page header, categories, and published articles', async () => {
    render(
      <MemoryRouter initialEntries={['/blog']}>
        <Routes>
          <Route path="/blog" element={<BlogPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(
      screen.getByRole('heading', { level: 1, name: 'Engineering Notes & Articles' })
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: 'Engineering' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Tutorials' })).toBeInTheDocument();
      expect(screen.getAllByText('First Architecture Article')[0]).toBeInTheDocument();
      expect(screen.getByText('Second Tutorial Article')).toBeInTheDocument();
    });
  });

  it('2. Filters articles by category when category tab is clicked', async () => {
    render(
      <MemoryRouter initialEntries={['/blog']}>
        <Routes>
          <Route path="/blog" element={<BlogPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: 'Tutorials' })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('tab', { name: 'Tutorials' }));

    await waitFor(() => {
      expect(blogService.listPostsByCategory).toHaveBeenCalledWith('tutorials', { limit: 9 });
      expect(screen.getByText('Second Tutorial Article')).toBeInTheDocument();
    });
  });

  it('3. Filters articles by tag when tag is in search params', async () => {
    render(
      <MemoryRouter initialEntries={['/blog?tag=performance']}>
        <Routes>
          <Route path="/blog" element={<BlogPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(blogService.listPostsByTag).toHaveBeenCalledWith('performance', { limit: 9 });
      expect(screen.getByText(/filtering by tag:/i)).toBeInTheDocument();
    });
  });

  it('4. Real-time client search filters articles on current page', async () => {
    render(
      <MemoryRouter initialEntries={['/blog']}>
        <Routes>
          <Route path="/blog" element={<BlogPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Second Tutorial Article')).toBeInTheDocument();
    });

    const searchInput = screen.getByLabelText(/search articles/i);
    fireEvent.change(searchInput, { target: { value: 'Tutorial' } });

    expect(screen.getByText('Second Tutorial Article')).toBeInTheDocument();
    expect(screen.queryByText('First Architecture Article')).toBeNull();
  });

  it('5. Cursor pagination loads more articles when clicked', async () => {
    render(
      <MemoryRouter initialEntries={['/blog']}>
        <Routes>
          <Route path="/blog" element={<BlogPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /load more articles/i })).toBeInTheDocument();
    });

    const loadMoreBtn = screen.getByRole('button', { name: /load more articles/i });
    fireEvent.click(loadMoreBtn);

    await waitFor(() => {
      expect(blogService.listPublishedPosts).toHaveBeenCalledWith({
        limit: 9,
        startAfterCursor: 'cursor-doc-2',
      });
    });
  });
});
