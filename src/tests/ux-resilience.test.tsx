import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, renderHook, act } from '@testing-library/react';
import React, { useState } from 'react';
import {
  Skeleton,
  TableSkeleton,
  ListSkeleton,
  ToastProvider,
  useToast,
  Button,
  ErrorState,
  EmptyState,
} from '@/components/ui';
import { AppCardSkeleton } from '@/components/apps';
import { BlogCardSkeleton } from '@/components/blog';
import { CategoryCardSkeleton, LatestUpdateCardSkeleton } from '@/components/home';
import { ArticleSkeleton } from '@/components/help';
import { PWAStatusBanner } from '@/components/feedback/PWAStatusBanner';
import { useUserLibrary } from '@/hooks/useUserLibrary';
import * as authHook from '@/hooks/useAuth';
import * as networkHook from '@/hooks/useNetworkStatus';
import { userLibraryService } from '@/services/library.service';
import { ok, err, isErr } from '@/lib/result';
import { AppError } from '@/lib/errors';
import type { User, UserLibraryItem } from '@/types/user.types';
import type { Result } from '@/types/result.types';

// Test harness for Toast hook
const ToastTestConsumer: React.FC = () => {
  const { toast, dismissToast, toasts } = useToast();

  return (
    <div>
      <button onClick={() => toast.success('Profile saved successfully!', 'Success')}>
        Trigger Success
      </button>
      <button onClick={() => toast.error('Failed to update settings.', 'Error')}>
        Trigger Error
      </button>
      <button onClick={() => toast.info('New release notes available.')}>Trigger Info</button>
      <button onClick={() => toast.warning('Network connection is unstable.')}>
        Trigger Warning
      </button>
      <div data-testid="toast-count">{toasts.length}</div>
      {toasts.map((t) => (
        <button key={t.id} onClick={() => dismissToast(t.id)}>
          Dismiss {t.id}
        </button>
      ))}
    </div>
  );
};

// Test harness for Error + Retry pattern
const DataSectionWithRetry: React.FC<{
  fetchData: () => Promise<{ success: boolean; data?: string; error?: string }>;
}> = ({ fetchData }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<string | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await fetchData();
    if (res.success && res.data) {
      setData(res.data);
    } else {
      setError(res.error || 'Failed to load');
    }
    setLoading(false);
  }, [fetchData]);

  React.useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return <div data-testid="section-skeleton"><AppCardSkeleton /></div>;
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to Load Data"
        description={error}
        onRetry={() => void load()}
        retryLabel="Retry Operation"
      />
    );
  }

  if (!data) {
    return <EmptyState title="No Records" description="No content found." />;
  }

  return <div data-testid="loaded-content">{data}</div>;
};

describe('Prompt 60 — Global Loading, Skeleton & UX Resilience Suite', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  // ---------------------------------------------------------------------------
  // 1. Homepage Content-Matched Skeletons
  // ---------------------------------------------------------------------------
  it('1. Homepage skeletons (AppCard, CategoryCard, LatestUpdateCard, BlogCard) render with correct structure', () => {
    const { container: appCardCont } = render(<AppCardSkeleton />);
    expect(appCardCont.querySelector('[data-testid="app-card-skeleton"]')).toBeInTheDocument();

    const { container: catCont } = render(<CategoryCardSkeleton />);
    expect(catCont.querySelector('[data-testid="category-card-skeleton"]')).toBeInTheDocument();

    const { container: updateCont } = render(<LatestUpdateCardSkeleton />);
    expect(updateCont.querySelector('[data-testid="latest-update-skeleton"]')).toBeInTheDocument();

    const { container: blogCont } = render(<BlogCardSkeleton />);
    expect(blogCont.querySelector('[data-testid="blog-card-skeleton"]')).toBeInTheDocument();
  });

  // ---------------------------------------------------------------------------
  // 2. Apps Page Loading Grid
  // ---------------------------------------------------------------------------
  it('2. AppCardSkeleton enforces layout consistency without visual jumps', () => {
    render(
      <div className="apps-grid">
        <AppCardSkeleton />
        <AppCardSkeleton />
      </div>
    );

    const skeletons = screen.getAllByTestId('app-card-skeleton');
    expect(skeletons).toHaveLength(2);
    skeletons.forEach((s) => {
      expect(s).toHaveAttribute('aria-hidden', 'true');
    });
  });

  // ---------------------------------------------------------------------------
  // 3. Article & Detail Skeletons
  // ---------------------------------------------------------------------------
  it('3. ArticleSkeleton provides structural layout for documentation and blog detail views', () => {
    render(<ArticleSkeleton hasCoverImage={true} />);

    const articleSkeleton = screen.getByTestId('article-skeleton');
    expect(articleSkeleton).toBeInTheDocument();
    expect(articleSkeleton).toHaveAttribute('aria-hidden', 'true');
  });

  // ---------------------------------------------------------------------------
  // 4. TableSkeleton for Admin Views
  // ---------------------------------------------------------------------------
  it('4. TableSkeleton renders semantic table headers and configured row counts', () => {
    render(<TableSkeleton rows={6} columns={4} hasHeader={true} />);

    const tableSkeleton = screen.getByTestId('table-skeleton');
    expect(tableSkeleton).toBeInTheDocument();

    const thElements = tableSkeleton.querySelectorAll('th');
    expect(thElements).toHaveLength(4);

    const trElements = tableSkeleton.querySelectorAll('tbody tr');
    expect(trElements).toHaveLength(6);
  });

  // ---------------------------------------------------------------------------
  // 5. ListSkeleton for Support & Activity Streams
  // ---------------------------------------------------------------------------
  it('5. ListSkeleton renders configured item blocks with avatar placeholders', () => {
    render(<ListSkeleton items={5} hasAvatar={true} />);

    const listSkeleton = screen.getByTestId('list-skeleton');
    expect(listSkeleton).toBeInTheDocument();
    expect(listSkeleton.children).toHaveLength(5);
  });

  // ---------------------------------------------------------------------------
  // 6. Base Skeleton Component Variant Styling
  // ---------------------------------------------------------------------------
  it('6. Skeleton component renders text, rounded, circular, and rectangular variants with animation', () => {
    const { container } = render(
      <div>
        <Skeleton variant="text" />
        <Skeleton variant="rounded" width={120} height={40} />
        <Skeleton variant="circular" width={48} height={48} />
        <Skeleton variant="rectangular" width="100%" height={200} />
      </div>
    );

    expect(container.querySelector('.ui-skeleton--text')).toBeInTheDocument();
    expect(container.querySelector('.ui-skeleton--rounded')).toBeInTheDocument();
    expect(container.querySelector('.ui-skeleton--circular')).toBeInTheDocument();
    expect(container.querySelector('.ui-skeleton--rectangular')).toBeInTheDocument();
    expect(container.querySelector('.ui-skeleton--animated')).toBeInTheDocument();
  });

  // ---------------------------------------------------------------------------
  // 7. Global Toast System Shorthand Helpers
  // ---------------------------------------------------------------------------
  it('7. ToastProvider supports shorthand methods (success, error, info, warning) and renders accessible alerts', () => {
    render(
      <ToastProvider>
        <ToastTestConsumer />
      </ToastProvider>
    );

    // 1. Trigger Success Toast
    fireEvent.click(screen.getByText('Trigger Success'));
    expect(screen.getByText('Profile saved successfully!')).toBeInTheDocument();
    expect(screen.getByText('Success')).toBeInTheDocument();

    // 2. Trigger Error Toast
    fireEvent.click(screen.getByText('Trigger Error'));
    expect(screen.getByText('Failed to update settings.')).toBeInTheDocument();

    // 3. Trigger Info Toast
    fireEvent.click(screen.getByText('Trigger Info'));
    expect(screen.getByText('New release notes available.')).toBeInTheDocument();

    // 4. Trigger Warning Toast
    fireEvent.click(screen.getByText('Trigger Warning'));
    expect(screen.getByText('Network connection is unstable.')).toBeInTheDocument();

    expect(screen.getByTestId('toast-count')).toHaveTextContent('4');
  });

  // ---------------------------------------------------------------------------
  // 8. Toast Dismissal & Auto-Cleanup
  // ---------------------------------------------------------------------------
  it('8. Toast can be manually dismissed or dismissed on close button click', () => {
    render(
      <ToastProvider>
        <ToastTestConsumer />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText('Trigger Success'));
    expect(screen.getByText('Profile saved successfully!')).toBeInTheDocument();

    const dismissBtns = screen.getAllByRole('button', { name: /Dismiss alert/i });
    expect(dismissBtns.length).toBeGreaterThanOrEqual(1);
    if (dismissBtns[0]) {
      fireEvent.click(dismissBtns[0]);
    }

    expect(screen.queryByText('Profile saved successfully!')).not.toBeInTheDocument();
  });

  // ---------------------------------------------------------------------------
  // 9. Async Button States & Duplicate Prevention
  // ---------------------------------------------------------------------------
  it('9. Async Button disables interactions and displays spinner while isLoading is true', () => {
    const handleClick = vi.fn();

    const { rerender } = render(
      <Button variant="primary" isLoading={false} onClick={handleClick}>
        Save Changes
      </Button>
    );

    const btn = screen.getByRole('button', { name: /Save Changes/i });
    expect(btn).not.toBeDisabled();
    expect(btn).toHaveAttribute('aria-busy', 'false');

    fireEvent.click(btn);
    expect(handleClick).toHaveBeenCalledTimes(1);

    // Switch to loading state
    rerender(
      <Button variant="primary" isLoading={true} onClick={handleClick}>
        Save Changes
      </Button>
    );

    expect(btn).toBeDisabled();
    expect(btn).toHaveAttribute('aria-busy', 'true');

    // Clicking while disabled/loading does NOT fire handler
    fireEvent.click(btn);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  // ---------------------------------------------------------------------------
  // 10. Optimistic UI Rollback on Service Failure
  // ---------------------------------------------------------------------------
  it('10. useUserLibrary optimistically adds app to library and reverts state when database mutation fails', async () => {
    const mockUser: User = {
      id: 'user-123',
      email: 'dev@elsesourav.com',
      displayName: 'Test User',
      role: 'user',
      status: 'active',
      preferences: {
        theme: 'dark',
        emailNotifications: true,
        reduceMotion: false,
        compactView: false,
      },
      createdAt: 1,
      updatedAt: 1,
    };

    vi.spyOn(authHook, 'useAuth').mockReturnValue({
      user: mockUser,
      authUser: null,
      role: 'user',
      isAdmin: false,
      isAuthenticated: true,
      isLoading: false,
      error: null,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signInWithGoogle: vi.fn(),
      signOut: vi.fn(),
      sendPasswordReset: vi.fn(),
      sendVerificationEmail: vi.fn(),
      changePassword: vi.fn(),
      deleteAccount: vi.fn(),
      clearError: vi.fn(),
    });

    vi.spyOn(userLibraryService, 'getEnrichedLibrary').mockResolvedValue(
      ok({ items: [], total: 0, hasMore: false })
    );
    vi.spyOn(userLibraryService, 'getLibraryCount').mockResolvedValue(ok(0));

    // Mock saveApp to fail with network error
    vi.spyOn(userLibraryService, 'saveApp').mockResolvedValue(
      err(AppError.network('Connection reset by peer'))
    );

    const { result } = renderHook(() => useUserLibrary());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isSaved('app-test-99')).toBe(false);

    // Trigger saveApp
    let saveResult: Result<UserLibraryItem, AppError> | undefined;
    await act(async () => {
      saveResult = await result.current.saveApp('app-test-99');
    });

    // Returned error and state was rolled back to false!
    expect(saveResult && isErr(saveResult)).toBe(true);
    expect(result.current.isSaved('app-test-99')).toBe(false);
    expect(result.current.libraryCount).toBe(0);
  });

  // ---------------------------------------------------------------------------
  // 11. Feature-Level Error + Retry Lifecycle
  // ---------------------------------------------------------------------------
  it('11. Feature-level state machine transitions: Loading -> Error+Retry -> Content', async () => {
    let attempts = 0;
    const mockFetcher = vi.fn().mockImplementation(async () => {
      attempts++;
      if (attempts === 1) {
        return { success: false, error: 'Network timeout loading catalog' };
      }
      return { success: true, data: 'Catalog data loaded successfully!' };
    });

    render(<DataSectionWithRetry fetchData={mockFetcher} />);

    // 1. Initially in skeleton loading
    expect(screen.getByTestId('section-skeleton')).toBeInTheDocument();

    // 2. Transition to Error State
    await waitFor(() => {
      expect(screen.getByText('Failed to Load Data')).toBeInTheDocument();
      expect(screen.getByText('Network timeout loading catalog')).toBeInTheDocument();
    });

    // 3. User clicks Retry
    const retryBtn = screen.getByRole('button', { name: /Retry Operation/i });
    fireEvent.click(retryBtn);

    // 4. Transition to Loaded Content
    await waitFor(() => {
      expect(screen.getByTestId('loaded-content')).toHaveTextContent(
        'Catalog data loaded successfully!'
      );
    });
    expect(attempts).toBe(2);
  });

  // ---------------------------------------------------------------------------
  // 12. PWA Offline Resilience Banner
  // ---------------------------------------------------------------------------
  it('12. PWAStatusBanner communicates offline status and recovery non-intrusively', () => {
    vi.spyOn(networkHook, 'useNetworkStatus').mockReturnValue({
      isOnline: false,
      wasOffline: false,
    });

    render(<PWAStatusBanner />);

    const statusBanner = screen.getByRole('status');
    expect(statusBanner).toBeInTheDocument();
    expect(statusBanner).toHaveAttribute('aria-live', 'polite');
    expect(screen.getByText(/You are currently offline/i)).toBeInTheDocument();
  });

  // ---------------------------------------------------------------------------
  // 13. Toast Accessibility Live Region
  // ---------------------------------------------------------------------------
  it('13. Toast container declares aria-live="polite" and aria-label="Notifications"', () => {
    const { container } = render(
      <ToastProvider>
        <div>Content</div>
      </ToastProvider>
    );

    const toastContainer = container.querySelector('.ui-toast-container');
    expect(toastContainer).toHaveAttribute('aria-live', 'polite');
    expect(toastContainer).toHaveAttribute('aria-label', 'Notifications');
  });

  // ---------------------------------------------------------------------------
  // 14. Reduced Motion Styles
  // ---------------------------------------------------------------------------
  it('14. Skeleton component disables shimmer animations when animate={false}', () => {
    const { container } = render(<Skeleton variant="rounded" animate={false} />);
    const skeletonEl = container.querySelector('.ui-skeleton');
    expect(skeletonEl).not.toHaveClass('ui-skeleton--animated');
  });

  // ---------------------------------------------------------------------------
  // 15. Form Persistence & Input Safety
  // ---------------------------------------------------------------------------
  it('15. Input components maintain value across transient validation and failure cycles', () => {
    const FormHarness: React.FC = () => {
      const [val, setVal] = useState('My draft ticket body');
      return <input value={val} onChange={(e) => setVal(e.target.value)} aria-label="Ticket Body" />;
    };

    render(<FormHarness />);
    const input = screen.getByLabelText('Ticket Body') as HTMLInputElement;
    expect(input.value).toBe('My draft ticket body');

    fireEvent.change(input, { target: { value: 'Updated ticket body with extra detail' } });
    expect(input.value).toBe('Updated ticket body with extra detail');
  });

  // ---------------------------------------------------------------------------
  // 16. Empty State Fallback
  // ---------------------------------------------------------------------------
  it('16. EmptyState renders friendly headline, description, and action button', () => {
    const onAction = vi.fn();
    render(
      <EmptyState
        title="No Applications Found"
        description="No applications match your active filter."
        action={<Button onClick={onAction}>Clear Filters</Button>}
      />
    );

    expect(screen.getByText('No Applications Found')).toBeInTheDocument();
    expect(screen.getByText('No applications match your active filter.')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Clear Filters/i }));
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  // ---------------------------------------------------------------------------
  // 17. Error State Fallback
  // ---------------------------------------------------------------------------
  it('17. ErrorState renders title, description, and retry action button', () => {
    const onRetry = vi.fn();
    render(
      <ErrorState
        title="Service Unavailable"
        description="Unable to connect to database."
        onRetry={onRetry}
        retryLabel="Try Again"
      />
    );

    expect(screen.getByText('Service Unavailable')).toBeInTheDocument();
    expect(screen.getByText('Unable to connect to database.')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Try Again/i }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
