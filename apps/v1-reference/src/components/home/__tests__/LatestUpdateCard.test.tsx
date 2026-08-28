import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { LatestUpdateCard, type LatestUpdateItem } from '../LatestUpdateCard';
import { analyticsService } from '@/services/analytics.service';

const mockItem: LatestUpdateItem = {
  appId: 'app-flow',
  appName: 'CodeFlow IDE',
  appSlug: 'codeflow-ide',
  iconUrl: 'https://cdn.elsesourav.com/flow.png',
  version: '1.2.0',
  title: 'Debugger Integration',
  summary: 'Added integrated breakpoint debugging panel.',
  updatedAt: 1700000000000,
};

describe('LatestUpdateCard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(analyticsService, 'trackView').mockResolvedValue(undefined);
  });

  it('1. Renders app name, version badge, date, and summary', () => {
    render(
      <BrowserRouter>
        <LatestUpdateCard item={mockItem} />
      </BrowserRouter>
    );

    expect(screen.getByText('CodeFlow IDE')).toBeInTheDocument();
    expect(screen.getByText('v1.2.0')).toBeInTheDocument();
    expect(screen.getByText('Added integrated breakpoint debugging panel.')).toBeInTheDocument();
  });

  it('2. Renders fallback initial if icon load triggers error', () => {
    render(
      <BrowserRouter>
        <LatestUpdateCard item={mockItem} />
      </BrowserRouter>
    );

    const img = screen.getByRole('img');
    fireEvent.error(img);

    expect(screen.getByText('C')).toBeInTheDocument();
  });

  it('3. Renders New Release badge if version is omitted', () => {
    render(
      <BrowserRouter>
        <LatestUpdateCard item={{ ...mockItem, version: undefined }} />
      </BrowserRouter>
    );

    expect(screen.getByText('New Release')).toBeInTheDocument();
  });

  it('4. Triggers non-blocking analytics and custom onClick on navigation', () => {
    const mockOnClick = vi.fn();
    render(
      <BrowserRouter>
        <LatestUpdateCard item={mockItem} onClick={mockOnClick} />
      </BrowserRouter>
    );

    const link = screen.getByRole('link', {
      name: /view codeflow ide update: debugger integration/i,
    });
    fireEvent.click(link);

    expect(analyticsService.trackView).toHaveBeenCalledWith('app-flow', {
      source: 'home_latest_updates',
    });
    expect(mockOnClick).toHaveBeenCalled();
  });
});
