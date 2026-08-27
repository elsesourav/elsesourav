import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AppGallery } from '../AppGallery';
import type { AppMedia } from '@/types/media.types';

const mockMedia: AppMedia[] = [
  {
    id: 'm1',
    appId: 'app-flow',
    type: 'screenshot',
    url: 'https://cdn.elsesourav.com/shot1.png',
    altText: 'Editor workspace screen',
    title: 'Code Editor',
    orderIndex: 0,
    isActive: true,
    createdAt: 100,
    updatedAt: 100,
  },
  {
    id: 'm2',
    appId: 'app-flow',
    type: 'screenshot',
    url: 'https://cdn.elsesourav.com/shot2.png',
    altText: 'Terminal and debugger preview',
    title: 'Integrated Terminal',
    orderIndex: 1,
    isActive: true,
    createdAt: 100,
    updatedAt: 100,
  },
];

describe('AppGallery Component', () => {
  it('1. Renders screenshot strip with images and alt labels', () => {
    render(<AppGallery media={mockMedia} appName="CodeFlow IDE" />);

    expect(screen.getByRole('region', { name: /screenshots scroll strip/i })).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /view screenshot/i })).toHaveLength(2);
  });

  it('2. Opens lightbox dialog on thumbnail click and allows navigation', () => {
    render(<AppGallery media={mockMedia} appName="CodeFlow IDE" />);

    const firstThumbnail = screen.getByRole('button', {
      name: /view screenshot 1 of 2: editor workspace screen/i,
    });
    fireEvent.click(firstThumbnail);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Editor workspace screen')).toBeInTheDocument();

    const nextBtn = screen.getByRole('button', { name: /next screenshot/i });
    fireEvent.click(nextBtn);

    expect(screen.getByText('Terminal and debugger preview')).toBeInTheDocument();
  });

  it('3. Supports keyboard navigation inside lightbox', () => {
    render(<AppGallery media={mockMedia} appName="CodeFlow IDE" />);

    const firstThumbnail = screen.getByRole('button', {
      name: /view screenshot 1 of 2: editor workspace screen/i,
    });
    fireEvent.click(firstThumbnail);

    fireEvent.keyDown(window, { key: 'ArrowRight' });
    expect(screen.getByText('Terminal and debugger preview')).toBeInTheDocument();

    fireEvent.keyDown(window, { key: 'ArrowLeft' });
    expect(screen.getByText('Editor workspace screen')).toBeInTheDocument();
  });

  it('4. Returns null when no screenshot or hero media exists', () => {
    const { container } = render(<AppGallery media={[]} appName="Empty App" />);
    expect(container.firstChild).toBeNull();
  });
});
