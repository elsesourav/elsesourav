import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AllReviewsModal } from '../../../../../apps/web/features/apps/components/reviews/AllReviewsModal';
import type { AppFeedbackSummary } from '@elsesourav/types';

// Mock global fetch
global.fetch = vi.fn((url: string | URL | Request) => {
  const urlStr = url.toString();
  if (urlStr.includes('test-app-rated')) {
    return Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve({
          items: [
            {
              id: 'rev-1',
              appId: 'app-1',
              userId: 'user-1',
              rating: 5,
              title: 'Great App',
              comment: 'Love this app!',
              helpfulCount: 0,
              hasLiked: false,
              isAuthor: false,
              createdAt: Date.now(),
              user: { name: 'Alice' },
            },
          ],
          summary: {
            averageRating: 5.0,
            totalCount: 1,
            distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 1 },
          },
          page: 1,
          totalPages: 1,
          hasMore: false,
        }),
    } as unknown as Response);
  }

  return Promise.resolve({
    ok: true,
    json: () =>
      Promise.resolve({
        items: [],
        summary: {
          averageRating: 0,
          totalCount: 0,
          distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        },
        page: 1,
        totalPages: 1,
        hasMore: false,
      }),
  } as unknown as Response);
});

describe('AllReviewsModal Button Layout & States', () => {
  const zeroSummary: AppFeedbackSummary = {
    averageRating: 0,
    totalCount: 0,
    distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  };

  const ratedSummary: AppFeedbackSummary = {
    averageRating: 5.0,
    totalCount: 1,
    distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 1 },
  };

  it('renders ONLY "Write First Review" in the review section when totalCount is 0, with no sort controls or left button', async () => {
    const onOpenWriteReview = vi.fn();

    render(
      <AllReviewsModal
        isOpen={true}
        onClose={vi.fn()}
        appSlug="test-app"
        appName="Test App"
        initialSummary={zeroSummary}
        onOpenWriteReview={onOpenWriteReview}
      />
    );

    // Score display should show 0
    expect(screen.getAllByText('0').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('No ratings yet')).toBeDefined();

    // No sort controls should be displayed when totalCount === 0
    expect(screen.queryByText('Sort:')).toBeNull();
    expect(screen.queryByText('Newest')).toBeNull();

    // Should NOT have the left-side "Write a Review" button
    expect(screen.queryByText('Write a Review')).toBeNull();

    // Should have ONLY "Write First Review" button in the review section once loading finishes
    const firstReviewBtn = await screen.findByRole('button', { name: /Write First Review/i });
    expect(firstReviewBtn).toBeDefined();

    // Clicking "Write First Review" calls onOpenWriteReview
    fireEvent.click(firstReviewBtn);
    expect(onOpenWriteReview).toHaveBeenCalledTimes(1);
  });

  it('renders ONLY "Write a Review" on the left side bottom when reviews exist (totalCount > 0)', async () => {
    const onOpenWriteReview = vi.fn();

    render(
      <AllReviewsModal
        isOpen={true}
        onClose={vi.fn()}
        appSlug="test-app-rated"
        appName="Test App"
        initialSummary={ratedSummary}
        onOpenWriteReview={onOpenWriteReview}
      />
    );

    // Score display should show 5.0
    expect(await screen.findByText('5.0')).toBeDefined();

    // Sort controls should be visible when totalCount > 0
    expect(screen.getByText('Sort:')).toBeDefined();
    expect(screen.getByText('Newest')).toBeDefined();

    // Single review button at left side bottom
    const writeReviewBtn = await screen.findByRole('button', { name: /Write a Review/i });
    expect(writeReviewBtn).toBeDefined();

    // Should NOT have "Write First Review" button
    expect(screen.queryByText('Write First Review')).toBeNull();

    // Clicking "Write a Review" calls onOpenWriteReview
    fireEvent.click(writeReviewBtn);
    expect(onOpenWriteReview).toHaveBeenCalledTimes(1);
  });
});
