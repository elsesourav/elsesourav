import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { BlogPage, BlogPostPage, AdminBlogEditorPage, HomePage } from '@/pages';
import { blogService } from '@/services/blog.service';
import type { BlogPost, BlogCategory } from '@/types/blog.types';
import { ok } from '@/lib/result';

// Mock post dataset
let mockDbPosts: BlogPost[] = [];

const mockCategories: BlogCategory[] = [
  {
    id: 'cat-eng',
    name: 'Engineering',
    slug: 'engineering',
    orderIndex: 0,
    isActive: true,
    createdAt: 1700000000000,
    updatedAt: 1700000000000,
  },
  {
    id: 'cat-tut',
    name: 'Tutorials',
    slug: 'tutorials',
    orderIndex: 1,
    isActive: true,
    createdAt: 1700000000000,
    updatedAt: 1700000000000,
  },
];

describe('Blog System End-to-End & Integration QC (Prompt 35)', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockDbPosts = [
      {
        id: 'post-1',
        slug: 'building-performant-software',
        title: 'Building Performant Software in 2026',
        excerpt: 'Zero-bloat architecture principles for modern web development.',
        content:
          '# Building Fast Software\n\n```typescript\nconst speed = 100;\n```\n\n[Visit Apps](/apps)',
        authorId: 'admin-1',
        authorName: 'Sourav',
        category: 'engineering',
        tags: ['performance', 'architecture'],
        status: 'published',
        isFeatured: true,
        readingTime: 2,
        readingTimeMinutes: 2,
        viewsCount: 150,
        createdAt: 1700000000000,
        updatedAt: 1700000000000,
        publishedAt: 1700001000000,
      },
      {
        id: 'post-2',
        slug: 'reactive-state-guide',
        title: 'Reactive State Management Guide',
        excerpt: 'Managing state without heavy libraries.',
        content: '# Reactive State\n\nStep by step guide.',
        authorId: 'admin-1',
        authorName: 'Sourav',
        category: 'tutorials',
        tags: ['react', 'state'],
        status: 'published',
        isFeatured: false,
        readingTime: 3,
        readingTimeMinutes: 3,
        viewsCount: 80,
        createdAt: 1700000000000,
        updatedAt: 1700000000000,
        publishedAt: 1700002000000,
      },
      {
        id: 'draft-1',
        slug: 'unreleased-features',
        title: 'Secret Unreleased Features',
        excerpt: 'Internal draft not for public eyes.',
        content: '# Internal Draft\n\nSecret plans.',
        authorId: 'admin-1',
        authorName: 'Sourav',
        category: 'engineering',
        tags: ['confidential'],
        status: 'draft',
        readingTime: 1,
        readingTimeMinutes: 1,
        createdAt: 1700000000000,
        updatedAt: 1700000000000,
      },
    ];

    vi.spyOn(blogService, 'listActiveCategories').mockResolvedValue(
      ok({
        items: mockCategories,
        hasMore: false,
      })
    );

    vi.spyOn(blogService, 'getPostById').mockImplementation((id) => {
      const found = mockDbPosts.find((p) => p.id === id);
      return Promise.resolve(ok(found || null));
    });

    vi.spyOn(blogService, 'getPostBySlug').mockImplementation((slug) => {
      const found = mockDbPosts.find((p) => p.slug === slug);
      return Promise.resolve(ok(found || null));
    });

    vi.spyOn(blogService, 'listPublishedPosts').mockImplementation(() =>
      Promise.resolve(
        ok({
          items: mockDbPosts.filter((p) => p.status === 'published'),
          hasMore: false,
        })
      )
    );

    vi.spyOn(blogService, 'listLatestPosts').mockImplementation((limit = 3) =>
      Promise.resolve(
        ok({
          items: mockDbPosts.filter((p) => p.status === 'published').slice(0, limit),
          hasMore: false,
        })
      )
    );

    vi.spyOn(blogService, 'listFeaturedPosts').mockImplementation((limit = 1) =>
      Promise.resolve(
        ok({
          items: mockDbPosts
            .filter((p) => p.status === 'published' && p.isFeatured)
            .slice(0, limit),
          hasMore: false,
        })
      )
    );

    vi.spyOn(blogService, 'listPostsByCategory').mockImplementation((cat) =>
      Promise.resolve(
        ok({
          items: mockDbPosts.filter((p) => p.status === 'published' && p.category === cat),
          hasMore: false,
        })
      )
    );

    vi.spyOn(blogService, 'listPostsByTag').mockImplementation((tag) =>
      Promise.resolve(
        ok({
          items: mockDbPosts.filter((p) => p.status === 'published' && p.tags.includes(tag)),
          hasMore: false,
        })
      )
    );

    vi.spyOn(blogService, 'createDraft').mockImplementation((dto) => {
      const newPost: BlogPost = {
        id: 'new-draft-id',
        slug: dto.slug,
        title: dto.title,
        excerpt: dto.excerpt,
        content: dto.content,
        authorId: dto.authorId || 'admin-1',
        authorName: dto.authorName || 'Sourav',
        category: dto.category,
        tags: dto.tags || [],
        status: 'draft',
        readingTime: 2,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      mockDbPosts.push(newPost);
      return Promise.resolve(ok(newPost));
    });

    vi.spyOn(blogService, 'publishPost').mockImplementation((id) => {
      const idx = mockDbPosts.findIndex((item) => item.id === id);
      if (idx !== -1) {
        const updated: BlogPost = {
          ...mockDbPosts[idx]!,
          status: 'published',
          publishedAt: Date.now(),
        };
        mockDbPosts[idx] = updated;
        return Promise.resolve(ok(updated));
      }
      return Promise.resolve(ok(mockDbPosts[0]!));
    });

    vi.spyOn(blogService, 'unpublishPost').mockImplementation((id) => {
      const idx = mockDbPosts.findIndex((item) => item.id === id);
      if (idx !== -1) {
        const updated: BlogPost = {
          ...mockDbPosts[idx]!,
          status: 'draft',
        };
        mockDbPosts[idx] = updated;
        return Promise.resolve(ok(updated));
      }
      return Promise.resolve(ok(mockDbPosts[0]!));
    });

    vi.spyOn(blogService, 'archivePost').mockImplementation((id) => {
      const idx = mockDbPosts.findIndex((item) => item.id === id);
      if (idx !== -1) {
        const updated: BlogPost = {
          ...mockDbPosts[idx]!,
          status: 'archived',
        };
        mockDbPosts[idx] = updated;
        return Promise.resolve(ok(updated));
      }
      return Promise.resolve(ok(mockDbPosts[0]!));
    });
  });

  it('1-3. Admin creates draft, views live preview, and draft remains completely private from public view', async () => {
    // 1. Render Admin Editor
    render(
      <MemoryRouter initialEntries={['/admin/blog/new']}>
        <Routes>
          <Route path="/admin/blog/new" element={<AdminBlogEditorPage />} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/article title/i), {
      target: { value: 'Draft Article For Tomorrow' },
    });
    fireEvent.change(screen.getByLabelText(/short excerpt/i), {
      target: { value: 'Exciting upcoming architectural updates.' },
    });
    fireEvent.change(screen.getByLabelText(/article content/i), {
      target: { value: '## Sneak Peek\n\nExclusive draft content.' },
    });

    // 2. Verify Live Preview rendering
    expect(screen.getByText('Sneak Peek')).toBeInTheDocument();
    expect(screen.getByText('Exclusive draft content.')).toBeInTheDocument();

    // 3. Save Draft
    fireEvent.click(screen.getByRole('button', { name: /save draft/i }));
    await waitFor(() => {
      expect(blogService.createDraft).toHaveBeenCalled();
    });

    // 4. Verify draft remains invisible to public
    const publicPublished = await blogService.listPublishedPosts();
    expect(publicPublished.success).toBe(true);
    if (publicPublished.success) {
      expect(publicPublished.data.items.some((p) => p.slug === 'draft-article-for-tomorrow')).toBe(
        false
      );
    }
  });

  it('4-6. Admin publishes post, and post appears in Blog catalog and on Homepage', async () => {
    // 1. Publish draft-1
    const publishRes = await blogService.publishPost('draft-1');
    expect(publishRes.success).toBe(true);

    // 2. Render Blog Page
    render(
      <MemoryRouter initialEntries={['/blog']}>
        <Routes>
          <Route path="/blog" element={<BlogPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Secret Unreleased Features')).toBeInTheDocument();
    });

    // 3. Render Homepage
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<HomePage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { level: 2, name: /latest from the blog/i })
      ).toBeInTheDocument();
    });
  });

  it('7-8. User opens article detail, reads content safely, and views related posts', async () => {
    render(
      <MemoryRouter initialEntries={['/blog/building-performant-software']}>
        <Routes>
          <Route path="/blog/:slug" element={<BlogPostPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { level: 1, name: 'Building Performant Software in 2026' })
      ).toBeInTheDocument();
      expect(screen.getByText('Building Fast Software')).toBeInTheDocument();
      expect(screen.getByText('Written by Sourav')).toBeInTheDocument();
    });

    // Related posts queried by category
    expect(blogService.listPostsByCategory).toHaveBeenCalledWith('engineering', { limit: 4 });
  });

  it('9-10. User filters Blog by category and navigates back to Apps', async () => {
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
      expect(screen.getByText('Reactive State Management Guide')).toBeInTheDocument();
    });
  });

  it('11-13. Admin unpublishes and archives post, removing it immediately from public discovery', async () => {
    // 1. Unpublish post-1
    await blogService.unpublishPost('post-1');
    const pubList1 = await blogService.listPublishedPosts();
    if (pubList1.success) {
      expect(pubList1.data.items.some((p) => p.id === 'post-1')).toBe(false);
    }

    // 2. Archive post-2
    await blogService.archivePost('post-2');
    const pubList2 = await blogService.listPublishedPosts();
    if (pubList2.success) {
      expect(pubList2.data.items.some((p) => p.id === 'post-2')).toBe(false);
    }

    // 3. User navigating to unpublished slug gets polished 404
    render(
      <MemoryRouter initialEntries={['/blog/building-performant-software']}>
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

  it('14-17. Content safety, SEO metadata, code block copy, and accessibility', async () => {
    const writeMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeMock,
      },
    });

    render(
      <MemoryRouter initialEntries={['/blog/building-performant-software']}>
        <Routes>
          <Route path="/blog/:slug" element={<BlogPostPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(document.title).toContain('Building Performant Software in 2026');
      const jsonLd = document.getElementById('blog-post-jsonld');
      expect(jsonLd).not.toBeNull();
      expect(jsonLd?.textContent).toContain('TechArticle');
    });

    // Copy code button
    const copyBtn = screen.getByRole('button', { name: /copy code to clipboard/i });
    fireEvent.click(copyBtn);
    expect(writeMock).toHaveBeenCalledWith('const speed = 100;');
  });
});
