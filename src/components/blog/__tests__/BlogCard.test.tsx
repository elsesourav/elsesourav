import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { BlogCard } from '../BlogCard';
import type { BlogPost } from '@/types/blog.types';

const mockPost: BlogPost = {
  id: 'post-101',
  slug: 'zero-bloat-architecture',
  title: 'Zero-Bloat Web Architecture',
  excerpt: 'How we build applications with instant load times and minimal dependencies.',
  content: 'Article content here.',
  authorId: 'sourav-admin',
  authorName: 'Sourav',
  category: 'architecture',
  tags: ['performance', 'web'],
  coverImageUrl: 'https://cdn.elsesourav.com/zero-bloat.png',
  status: 'published',
  readingTime: 3,
  createdAt: 1700000000000,
  updatedAt: 1700000000000,
  publishedAt: 1700001000000,
};

describe('BlogCard Component', () => {
  it('1. Renders title, excerpt, category badge, and reading time', () => {
    render(
      <BrowserRouter>
        <BlogCard post={mockPost} />
      </BrowserRouter>
    );

    expect(
      screen.getByRole('heading', { level: 2, name: 'Zero-Bloat Web Architecture' })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/how we build applications with instant load times/i)
    ).toBeInTheDocument();
    expect(screen.getByText('architecture')).toBeInTheDocument();
    expect(screen.getByText(/3 min read/i)).toBeInTheDocument();
    expect(screen.getByText('#performance')).toBeInTheDocument();
  });

  it('2. Renders cover image with appropriate alt text and links to /blog/:slug', () => {
    render(
      <BrowserRouter>
        <BlogCard post={mockPost} />
      </BrowserRouter>
    );

    const coverImg = screen.getByAltText('Zero-Bloat Web Architecture');
    expect(coverImg).toHaveAttribute('src', 'https://cdn.elsesourav.com/zero-bloat.png');

    const cardLink = screen.getByRole('link', {
      name: /read article: zero-bloat web architecture/i,
    });
    expect(cardLink).toHaveAttribute('href', '/blog/zero-bloat-architecture');
  });

  it('3. Renders fallback icon when no cover image is provided', () => {
    const postWithoutCover: BlogPost = {
      ...mockPost,
      coverImageUrl: undefined,
    };

    render(
      <BrowserRouter>
        <BlogCard post={postWithoutCover} />
      </BrowserRouter>
    );

    expect(screen.queryByAltText('Zero-Bloat Web Architecture')).toBeNull();
  });

  it('4. Supports featured spotlight variant', () => {
    const { container } = render(
      <BrowserRouter>
        <BlogCard post={mockPost} featured />
      </BrowserRouter>
    );

    expect(container.querySelector('.blog-card--featured')).toBeInTheDocument();
  });
});
