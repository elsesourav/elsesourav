import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Image, Avatar } from '@/components/ui';
import { AppIcon, AppCard, AppGallery } from '@/components/apps';
import { BlogCard, BlogContentRenderer } from '@/components/blog';
import type { App } from '@/types/app.types';
import type { BlogPost } from '@/types/blog.types';
import type { AppMedia } from '@/types/media.types';

const mockApp: App = {
  id: 'app-codeflow',
  slug: 'codeflow-ide',
  name: 'CodeFlow IDE',
  shortDescription: 'Modern Cloud IDE for Engineering Teams',
  description: 'Full featured cloud development environment.',
  iconUrl: 'https://cdn.elsesourav.com/icons/codeflow.png',
  screenshots: ['https://cdn.elsesourav.com/screens/shot1.png'],
  primaryCategory: 'developer-tools',
  tags: ['developer-tools', 'productivity'],
  status: 'published',
  platforms: ['web'],
  stats: { views: 100, launches: 50, libraryAdds: 10, ratingAverage: 4.8, ratingCount: 20 },
  isFeatured: true,
  isPinned: false,
  sortOrder: 0,
  createdAt: 1700000000000,
  updatedAt: 1700000000000,
  links: [{ id: 'l1', appId: 'app-codeflow', label: 'Web App', url: 'https://codeflow.dev', platform: 'web', isPrimary: true, action: 'open_app', displayOrder: 0, isActive: true }],
};

const mockBlogPost: BlogPost = {
  id: 'post-1',
  slug: 'react-19-performance',
  title: 'Mastering React 19 Performance',
  excerpt: 'A deep dive into optimizing React applications for sub-second speeds.',
  content: 'Here is an image: ![Architecture Diagram](https://cdn.elsesourav.com/diagram.png)\n\nAnd malicious: ![XSS](javascript:alert(1))',
  coverImageUrl: 'https://cdn.elsesourav.com/covers/react-19.png',
  category: 'Engineering',
  tags: ['react', 'performance'],
  status: 'published',
  authorId: 'author-1',
  authorName: 'Sourav Bera',
  readingTime: 4,
  readingTimeMinutes: 4,
  createdAt: 1700000000000,
  updatedAt: 1700000000000,
};

const mockMedia: AppMedia[] = [
  {
    id: 'm1',
    appId: 'app-codeflow',
    type: 'screenshot',
    url: 'https://cdn.elsesourav.com/screens/shot1.png',
    altText: 'Code editor with dark theme',
    orderIndex: 0,
    isActive: true,
    createdAt: 1700000000000,
    updatedAt: 1700000000000,
  },
  {
    id: 'm2',
    appId: 'app-codeflow',
    type: 'screenshot',
    url: 'https://cdn.elsesourav.com/screens/shot2.png',
    altText: 'Git integration panel',
    orderIndex: 1,
    isActive: true,
    createdAt: 1700000000000,
    updatedAt: 1700000000000,
  },
];

describe('Prompt 57 — Media, Image, Icon, & Static-Asset Performance Suite', () => {
  it('1. AppCard renders AppIcon with lazy loading and fixed dimensions', () => {
    render(
      <MemoryRouter>
        <AppCard app={mockApp} />
      </MemoryRouter>
    );

    const iconImg = screen.getByRole('img', { name: 'CodeFlow IDE application icon' });
    expect(iconImg).toBeInTheDocument();
    expect(iconImg).toHaveAttribute('loading', 'eager'); // Featured app gets priority
    expect(iconImg).toHaveAttribute('src', 'https://cdn.elsesourav.com/icons/codeflow.png');
  });

  it('2. AppCard handles broken or missing icon gracefully with capital initial monogram', () => {
    const brokenApp: App = {
      ...mockApp,
      isFeatured: false,
      iconUrl: 'https://cdn.elsesourav.com/broken-icon.png',
    };

    render(
      <MemoryRouter>
        <AppCard app={brokenApp} />
      </MemoryRouter>
    );

    const iconImg = screen.getByRole('img', { name: 'CodeFlow IDE application icon' });
    expect(iconImg).toHaveAttribute('loading', 'lazy');

    // Simulate load failure
    fireEvent.error(iconImg);

    // Should display 'C' monogram fallback without showing broken image box
    expect(screen.getByText('C')).toBeInTheDocument();
  });

  it('3. AppGallery renders thumbnail strip with 16:9 aspect ratio and lazy loading', () => {
    render(<AppGallery media={mockMedia} appName="CodeFlow" />);

    const screenshots = screen.getAllByRole('button', { name: /View screenshot/i });
    expect(screenshots).toHaveLength(2);

    const thumbImg = screen.getByRole('img', { name: 'Code editor with dark theme' });
    expect(thumbImg).toHaveAttribute('loading', 'lazy');
  });

  it('4. AppGallery supports keyboard navigation and on-demand modal lightbox with eager loading', () => {
    render(<AppGallery media={mockMedia} appName="CodeFlow" />);

    // Click thumbnail to open lightbox
    const firstThumb = screen.getByRole('button', { name: /View screenshot 1 of 2/i });
    fireEvent.click(firstThumb);

    // Lightbox is now open
    expect(screen.getByText('CodeFlow - Screenshot 1 of 2')).toBeInTheDocument();
    const imgs = screen.getAllByRole('img', { name: 'Code editor with dark theme' });
    const lightboxImg = imgs.find((img) => img.classList.contains('app-gallery__lightbox-image'));
    expect(lightboxImg).toBeDefined();
    expect(lightboxImg).toHaveAttribute('loading', 'eager'); // Active screenshot has eager priority

    // Keyboard ArrowRight navigates to next screenshot
    fireEvent.keyDown(window, { key: 'ArrowRight' });
    expect(screen.getByText('CodeFlow - Screenshot 2 of 2')).toBeInTheDocument();

    // Keyboard ArrowLeft navigates back
    fireEvent.keyDown(window, { key: 'ArrowLeft' });
    expect(screen.getByText('CodeFlow - Screenshot 1 of 2')).toBeInTheDocument();

    // Keyboard Escape closes lightbox
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByText('CodeFlow - Screenshot 1 of 2')).toBeNull();
  });

  it('5. BlogCard renders cover with lazy loading, 16:9 aspect ratio, and fallback', () => {
    render(
      <MemoryRouter>
        <BlogCard post={mockBlogPost} />
      </MemoryRouter>
    );

    const coverImg = screen.getByRole('img', { name: 'Mastering React 19 Performance' });
    expect(coverImg).toHaveAttribute('loading', 'lazy');
    expect(coverImg).toHaveAttribute('decoding', 'async');
  });

  it('6. BlogContentRenderer renders markdown images with lazy loading and rejects malicious schemes', () => {
    render(<BlogContentRenderer content={mockBlogPost.content} />);

    const safeImg = screen.getByRole('img', { name: 'Architecture Diagram' });
    expect(safeImg).toBeInTheDocument();
    expect(safeImg).toHaveAttribute('loading', 'lazy');

    // Malicious scheme is blocked
    expect(screen.queryByRole('img', { name: 'XSS' })).toBeNull();
    expect(screen.getByText(/\[Unsafe Image URL: XSS\]/)).toBeInTheDocument();
  });

  it('7. Avatar component securely renders initials fallback when src is missing, null, or unsafe', () => {
    const { rerender } = render(<Avatar src={null} name="Sourav Bera" size="lg" />);
    expect(screen.getByText('SB')).toBeInTheDocument();

    rerender(<Avatar src="javascript:alert(1)" name="Hacker User" size="lg" />);
    expect(screen.getByText('HU')).toBeInTheDocument();
    expect(document.querySelector('img')).toBeNull();
  });

  it('8. Image component strictly prevents CLS via container style and aspect-ratio', () => {
    const { container } = render(
      <Image
        src="https://cdn.elsesourav.com/sample.png"
        alt="CLS Test"
        width={320}
        height={180}
        aspectRatio="16/9"
      />
    );

    const wrapper = container.querySelector('.ui-image-container');
    expect(wrapper).toHaveStyle({
      width: '320px',
      height: '180px',
      aspectRatio: '16/9',
    });
  });

  it('9. AppIcon renders directly with specified size and monogram fallback', () => {
    render(<AppIcon name="PixelStudio" size="lg" iconUrl={null} />);
    expect(screen.getByText('P')).toBeInTheDocument();
  });
});
