import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ArticleHelpfulness } from '../ArticleHelpfulness';
import { helpService } from '@/services/help.service';
import type { HelpArticle } from '@/types/help.types';
import { ok, err } from '@/lib/result';
import { AppError } from '@/lib/errors';

const mockArticle: HelpArticle = {
  id: 'art-guide-1',
  categoryId: 'cat-tools',
  title: 'How to Configure Notifications',
  slug: 'configure-notifications',
  content: 'Notification configuration guide content.',
  status: 'published',
  orderIndex: 0,
  createdAt: 100,
  updatedAt: 100,
  publishedAt: 100,
};

describe('ArticleHelpfulness Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  it('1. Renders "Was this article helpful?" with Yes and No buttons', () => {
    render(
      <BrowserRouter>
        <ArticleHelpfulness article={mockArticle} />
      </BrowserRouter>
    );

    expect(screen.getByText('Was this article helpful?')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /yes, this article was helpful/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /no, this article was not helpful/i })
    ).toBeInTheDocument();
  });

  it('2. Clicking "Yes" submits positive feedback and shows success confirmation', async () => {
    vi.spyOn(helpService, 'submitHelpfulness').mockResolvedValue(
      ok({
        id: 'fb-1',
        articleId: mockArticle.id,
        sessionId: 'sess_123',
        helpful: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      })
    );

    render(
      <BrowserRouter>
        <ArticleHelpfulness article={mockArticle} />
      </BrowserRouter>
    );

    const yesBtn = screen.getByRole('button', { name: /yes, this article was helpful/i });
    fireEvent.click(yesBtn);

    await waitFor(() => {
      expect(helpService.submitHelpfulness).toHaveBeenCalledWith(
        expect.objectContaining({
          articleId: mockArticle.id,
          helpful: true,
        })
      );
      expect(screen.getByText('Thank you for your feedback!')).toBeInTheDocument();
    });
  });

  it('3. Clicking "No" submits negative feedback and displays "Contact Support" escalation CTA', async () => {
    vi.spyOn(helpService, 'submitHelpfulness').mockResolvedValue(
      ok({
        id: 'fb-2',
        articleId: mockArticle.id,
        sessionId: 'sess_123',
        helpful: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      })
    );

    render(
      <BrowserRouter>
        <ArticleHelpfulness article={mockArticle} />
      </BrowserRouter>
    );

    const noBtn = screen.getByRole('button', { name: /no, this article was not helpful/i });
    fireEvent.click(noBtn);

    await waitFor(() => {
      expect(helpService.submitHelpfulness).toHaveBeenCalledWith(
        expect.objectContaining({
          articleId: mockArticle.id,
          helpful: false,
        })
      );
      expect(screen.getByText(/sorry this didn't solve your problem/i)).toBeInTheDocument();
      const supportLink = screen.getByRole('link', { name: /contact support/i });
      expect(supportLink).toBeInTheDocument();
      expect(supportLink).toHaveAttribute(
        'href',
        expect.stringContaining('/support?ref=help_article&article=configure-notifications')
      );
    });
  });

  it('4. Prevents duplicate submission when user has already voted in session', async () => {
    sessionStorage.setItem(`elsesourav_help_voted_${mockArticle.id}`, 'yes');

    render(
      <BrowserRouter>
        <ArticleHelpfulness article={mockArticle} />
      </BrowserRouter>
    );

    expect(screen.getByText('Thank you for your feedback!')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /yes/i })).toBeNull();
  });

  it('5. Handles conflict/already-voted gracefully from server response', async () => {
    vi.spyOn(helpService, 'submitHelpfulness').mockResolvedValue(
      err(AppError.conflict('You have already submitted feedback'))
    );

    render(
      <BrowserRouter>
        <ArticleHelpfulness article={mockArticle} />
      </BrowserRouter>
    );

    const yesBtn = screen.getByRole('button', { name: /yes, this article was helpful/i });
    fireEvent.click(yesBtn);

    await waitFor(() => {
      expect(screen.getByText('Thank you for your feedback!')).toBeInTheDocument();
    });
  });
});
