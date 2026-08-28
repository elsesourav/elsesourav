import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { BlogPostPage } from '../BlogPostPage';
import { blogService } from '@/services/blog.service';
import type { BlogPost } from '@/types/blog.types';
import { ok } from '@/lib/result';

const mockPublishedPost: BlogPost = {
  id: 'post-deep-dive',
  slug: 'crafting-fast-web-apps',
  title: 'Crafting Fast Web Applications',
  excerpt: 'A deep dive into zero-bloat architecture.',
  content:
    '# Introduction\n\nHere is how we build fast web software.\n\n```typescript\nconst speed = 100;\n```',
  authorId: 'sourav-admin',
  authorName: 'Sourav',
  category: 'engineering',
  tags: ['performance', 'web'],
  coverImageUrl: 'https://cdn.elsesourav.com/cover.png',
  status: 'published',
  readingTime: 3,
  createdAt: 1700000000000,
  updatedAt: 1700000000000,
  publishedAt: 1700001000000,
};

const mockRelatedPost: BlogPost = {
  id: 'post-related-1',
  slug: 'state-of-elsesourav',
  title: 'State of ElseSourav Architecture',
  excerpt: 'Overview of system design.',
  content: 'Content',
  authorId: 'sourav-admin',
  authorName: 'Sourav',
  category: 'engineering',
  tags: ['architecture'],
  status: 'published',
  readingTime: 2,
  createdAt: 1700000000000,
  updatedAt: 1700000000000,
  publishedAt: 1700002000000,
};

const mockDraftPost: BlogPost = {
  ...mockPublishedPost,
  id: 'draft-post',
  slug: 'secret-unreleased-post',
  status: 'draft',
};

describe('BlogPostPage Detail Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.spyOn(blogService, 'getPostBySlug').mockImplementation((slug) => {
      if (slug === 'crafting-fast-web-apps') {
        return Promise.resolve(ok(mockPublishedPost));
      }
      if (slug === 'secret-unreleased-post') {
        return Promise.resolve(ok(mockDraftPost));
      }
      return Promise.resolve(ok(null));
    });

    vi.spyOn(blogService, 'listPostsByCategory').mockResolvedValue(
      ok({
        items: [mockPublishedPost, mockRelatedPost],
        hasMore: false,
      })
    );
  });

  it('1. Renders published article header, content, author, and reading time', async () => {
    render(
      <MemoryRouter initialEntries={['/blog/crafting-fast-web-apps']}>
        <Routes>
          <Route path="/blog/:slug" element={<BlogPostPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { level: 1, name: 'Crafting Fast Web Applications' })
      ).toBeInTheDocument();
      expect(screen.getByText('A deep dive into zero-bloat architecture.')).toBeInTheDocument();
      expect(screen.getByText('Introduction')).toBeInTheDocument();
      expect(screen.getByText('Written by Sourav')).toBeInTheDocument();
      expect(screen.getByText(/3 min read/i)).toBeInTheDocument();
    });
  });

  it('2. Injects SEO title, description, and Article JSON-LD into DOM', async () => {
    render(
      <MemoryRouter initialEntries={['/blog/crafting-fast-web-apps']}>
        <Routes>
          <Route path="/blog/:slug" element={<BlogPostPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(document.title).toContain('Crafting Fast Web Applications');
      const jsonLd = document.getElementById('seo-structured-data');
      expect(jsonLd).not.toBeNull();
      expect(jsonLd?.textContent).toContain('Article');
      expect(jsonLd?.textContent).toContain('Crafting Fast Web Applications');
    });
  });

  it('3. Copies code block content to clipboard', async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    render(
      <MemoryRouter initialEntries={['/blog/crafting-fast-web-apps']}>
        <Routes>
          <Route path="/blog/:slug" element={<BlogPostPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /copy code to clipboard/i })).toBeInTheDocument();
    });

    const copyBtn = screen.getByRole('button', { name: /copy code to clipboard/i });
    fireEvent.click(copyBtn);

    expect(writeTextMock).toHaveBeenCalledWith('const speed = 100;');
    await waitFor(() => {
      expect(screen.getByText('Copied!')).toBeInTheDocument();
    });
  });

  it('4. Fetches and renders related articles in the same category', async () => {
    render(
      <MemoryRouter initialEntries={['/blog/crafting-fast-web-apps']}>
        <Routes>
          <Route path="/blog/:slug" element={<BlogPostPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { level: 2, name: 'Related Articles' })
      ).toBeInTheDocument();
      expect(screen.getByText('State of ElseSourav Architecture')).toBeInTheDocument();
    });
  });

  it('5. Renders polished 404 state for non-existent or unpublished/draft slug', async () => {
    render(
      <MemoryRouter initialEntries={['/blog/secret-unreleased-post']}>
        <Routes>
          <Route path="/blog/:slug" element={<BlogPostPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('blog-post-not-found')).toBeInTheDocument();
      expect(screen.getByText('Article Not Found')).toBeInTheDocument();
    });
  });
});
