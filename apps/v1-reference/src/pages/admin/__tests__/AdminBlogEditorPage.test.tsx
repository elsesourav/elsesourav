import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AdminBlogEditorPage } from '../AdminBlogEditorPage';
import { blogService } from '@/services/blog.service';
import type { BlogPost, BlogCategory } from '@/types/blog.types';
import { ok } from '@/lib/result';

const mockExistingPost: BlogPost = {
  id: 'edit-post-1',
  slug: 'crafting-fast-web-apps',
  title: 'Crafting Fast Web Applications',
  excerpt: 'A deep dive into performance.',
  content: '# Heading One\n\nThis is content with **bold** and *italic*.',
  authorId: 'admin',
  category: 'engineering',
  tags: ['performance', 'web'],
  status: 'draft',
  readingTime: 1,
  createdAt: 1700000000000,
  updatedAt: 1700000000000,
};

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

describe('AdminBlogEditorPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.spyOn(blogService, 'listActiveCategories').mockResolvedValue(
      ok({
        items: mockCategories,
        hasMore: false,
      })
    );

    vi.spyOn(blogService, 'getPostById').mockResolvedValue(ok(mockExistingPost));

    vi.spyOn(blogService, 'createDraft').mockResolvedValue(
      ok({
        ...mockExistingPost,
        id: 'newly-created-post-id',
      })
    );

    vi.spyOn(blogService, 'updatePost').mockResolvedValue(ok(mockExistingPost));

    vi.spyOn(blogService, 'publishPost').mockResolvedValue(
      ok({
        ...mockExistingPost,
        status: 'published',
        publishedAt: 1700001000000,
      })
    );

    vi.spyOn(blogService, 'unpublishPost').mockResolvedValue(
      ok({
        ...mockExistingPost,
        status: 'draft',
      })
    );

    vi.spyOn(blogService, 'archivePost').mockResolvedValue(
      ok({
        ...mockExistingPost,
        status: 'archived',
      })
    );
  });

  it('1. Renders new article form with empty inputs and auto slug suggestion', async () => {
    render(
      <MemoryRouter initialEntries={['/admin/blog/new']}>
        <Routes>
          <Route path="/admin/blog/new" element={<AdminBlogEditorPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(
      screen.getByRole('heading', { level: 1, name: 'Write New Article' })
    ).toBeInTheDocument();

    const titleInput = screen.getByLabelText(/article title/i);
    const slugInput = screen.getByLabelText(/url slug/i);

    fireEvent.change(titleInput, { target: { value: 'How to Build Fast PWAs' } });

    expect(slugInput).toHaveValue('how-to-build-fast-pwas');
  });

  it('2. Inserts Markdown formatting tags via toolbar buttons', async () => {
    render(
      <MemoryRouter initialEntries={['/admin/blog/new']}>
        <Routes>
          <Route path="/admin/blog/new" element={<AdminBlogEditorPage />} />
        </Routes>
      </MemoryRouter>
    );

    const textarea = screen.getByLabelText(/article content/i);
    fireEvent.change(textarea, { target: { value: '' } });

    const boldBtn = screen.getByLabelText(/bold/i);
    fireEvent.click(boldBtn);

    expect(textarea).toHaveValue('**text**');
  });

  it('3. Adds and removes tags chips', async () => {
    render(
      <MemoryRouter initialEntries={['/admin/blog/new']}>
        <Routes>
          <Route path="/admin/blog/new" element={<AdminBlogEditorPage />} />
        </Routes>
      </MemoryRouter>
    );

    const tagInput = screen.getByPlaceholderText(/add tag\.\.\./i);
    fireEvent.change(tagInput, { target: { value: 'react-19' } });
    fireEvent.keyDown(tagInput, { key: 'Enter', code: 'Enter' });

    expect(screen.getByText('#react-19')).toBeInTheDocument();

    const removeTagBtn = screen.getByLabelText(/remove tag react-19/i);
    fireEvent.click(removeTagBtn);

    expect(screen.queryByText('#react-19')).toBeNull();
  });

  it('4. Saves new draft via blogService.createDraft', async () => {
    render(
      <MemoryRouter initialEntries={['/admin/blog/new']}>
        <Routes>
          <Route path="/admin/blog/new" element={<AdminBlogEditorPage />} />
          <Route path="/admin/blog/:id/edit" element={<AdminBlogEditorPage />} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/article title/i), {
      target: { value: 'New Test Draft Article' },
    });
    fireEvent.change(screen.getByLabelText(/short excerpt/i), {
      target: { value: 'Excerpt for test draft.' },
    });
    fireEvent.change(screen.getByLabelText(/article content/i), {
      target: { value: 'Content body of test draft.' },
    });

    const saveDraftBtn = screen.getByRole('button', { name: /save draft/i });
    fireEvent.click(saveDraftBtn);

    await waitFor(() => {
      expect(blogService.createDraft).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'New Test Draft Article',
          slug: 'new-test-draft-article',
          excerpt: 'Excerpt for test draft.',
          content: 'Content body of test draft.',
        })
      );
    });
  });

  it('5. Loads existing post in edit mode and publishes article', async () => {
    render(
      <MemoryRouter initialEntries={['/admin/blog/edit-post-1/edit']}>
        <Routes>
          <Route path="/admin/blog/:id/edit" element={<AdminBlogEditorPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/article title/i)).toHaveValue('Crafting Fast Web Applications');
      expect(screen.getByLabelText(/url slug/i)).toHaveValue('crafting-fast-web-apps');
    });

    const publishBtn = screen.getByRole('button', { name: /^publish$/i });
    fireEvent.click(publishBtn);

    await waitFor(() => {
      expect(blogService.publishPost).toHaveBeenCalledWith('edit-post-1');
      expect(screen.getByText(/article published successfully!/i)).toBeInTheDocument();
    });
  });

  it('6. Unpublishes and archives article', async () => {
    vi.spyOn(blogService, 'getPostById').mockResolvedValue(
      ok({
        ...mockExistingPost,
        status: 'published',
      })
    );

    render(
      <MemoryRouter initialEntries={['/admin/blog/edit-post-1/edit']}>
        <Routes>
          <Route path="/admin/blog/:id/edit" element={<AdminBlogEditorPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /unpublish/i })).toBeInTheDocument();
    });

    // Unpublish
    fireEvent.click(screen.getByRole('button', { name: /unpublish/i }));
    await waitFor(() => {
      expect(blogService.unpublishPost).toHaveBeenCalledWith('edit-post-1');
    });

    // Archive
    fireEvent.click(screen.getByRole('button', { name: /archive/i }));
    await waitFor(() => {
      expect(blogService.archivePost).toHaveBeenCalledWith('edit-post-1');
    });
  });
});
