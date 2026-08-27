import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { CategoryCard, getCategoryIcon } from '../CategoryCard';
import { analyticsService } from '@/services/analytics.service';
import type { Category } from '@/types/category.types';

const mockCategory: Category = {
  id: 'cat-dev',
  slug: 'developer-tools',
  name: 'Developer Tools',
  description: 'IDEs, compilers, and debugging utilities.',
  orderIndex: 0,
  isActive: true,
  createdAt: 100,
  updatedAt: 100,
};

describe('CategoryCard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(analyticsService, 'trackView').mockResolvedValue(undefined);
  });

  it('1. Renders category name, description, and icon', () => {
    render(
      <BrowserRouter>
        <CategoryCard category={mockCategory} />
      </BrowserRouter>
    );

    expect(screen.getByText('Developer Tools')).toBeInTheDocument();
    expect(screen.getByText('IDEs, compilers, and debugging utilities.')).toBeInTheDocument();
  });

  it('2. Directs navigation to /apps?category=<slug>', () => {
    render(
      <BrowserRouter>
        <CategoryCard category={mockCategory} />
      </BrowserRouter>
    );

    const link = screen.getByRole('link', {
      name: /explore developer tools software category/i,
    });
    expect(link).toHaveAttribute('href', '/apps?category=developer-tools');
  });

  it('3. Triggers non-blocking analytics and custom onClick', () => {
    const mockOnClick = vi.fn();
    render(
      <BrowserRouter>
        <CategoryCard category={mockCategory} onClick={mockOnClick} />
      </BrowserRouter>
    );

    const link = screen.getByRole('link', {
      name: /explore developer tools software category/i,
    });
    fireEvent.click(link);

    expect(analyticsService.trackView).toHaveBeenCalledWith('cat-dev', {
      source: 'home_category_discovery',
    });
    expect(mockOnClick).toHaveBeenCalled();
  });

  it('4. Resolves context icons for known and unknown slugs', () => {
    expect(getCategoryIcon('developer-tools', 'Dev')).toBeTruthy();
    expect(getCategoryIcon('utilities', 'Tools')).toBeTruthy();
    expect(getCategoryIcon('web-apps', 'Web')).toBeTruthy();
    expect(getCategoryIcon('extensions', 'Extensions')).toBeTruthy();
    expect(getCategoryIcon('games', 'Games')).toBeTruthy();
    expect(getCategoryIcon('unknown-slug', 'Custom Category')).toBeTruthy();
  });
});
