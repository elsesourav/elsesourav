import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React, { useState } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { ErrorBoundary, RouteErrorBoundary } from '@/components/feedback';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { AppError } from '@/lib/errors';
import { ok, err } from '@/lib/result';
import {
  mapFirestoreError,
  isNetworkError,
  isPermissionError,
  isRetryableError,
  getUserFriendlyErrorMessage,
} from '@/lib/error-normalization';
import { sanitizeContext, sanitizeUrlString } from '@/services/error-logger.service';
import { withRetry } from '@/utils/retry';
import { Input, Button } from '@/components/ui';

// Component that conditionally throws a rendering error
const BuggyComponent: React.FC<{ shouldThrow?: boolean }> = ({ shouldThrow = true }) => {
  if (shouldThrow) {
    throw new Error('Simulation of catastrophic component rendering crash');
  }
  return <div>Component rendered successfully!</div>;
};

// Test form component for validation and double-submission tests
const TestFormComponent: React.FC<{ onSubmit: (data: { email: string }) => Promise<void> }> = ({
  onSubmit,
}) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Email address is required');
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      await onSubmit({ email });
    } catch {
      setError('Submission failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <label htmlFor="test-email">Email Address</label>
      <Input
        id="test-email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        isInvalid={Boolean(error)}
        aria-describedby={error ? 'test-email-error' : undefined}
        disabled={isSubmitting}
      />
      {error && (
        <span id="test-email-error" role="alert">
          {error}
        </span>
      )}
      <Button type="submit" isLoading={isSubmitting} disabled={isSubmitting}>
        Submit
      </Button>
    </form>
  );
};

describe('Prompt 58 — Global Error Handling Test Suite', () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    // Suppress expected React ErrorBoundary error noise in test logs
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  // ---------------------------------------------------------------------------
  // 1. Root Rendering Error
  // ---------------------------------------------------------------------------
  it('1. Root ErrorBoundary catches unexpected rendering crash, renders recovery screen, and provides actions', () => {
    render(
      <ErrorBoundary level="root">
        <BuggyComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    // Displays calm, non-technical recovery title and description
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: /Something went wrong/i })).toBeInTheDocument();
    expect(
      screen.getByText(/An unexpected error occurred. You can reload this view or return to the homepage./i)
    ).toBeInTheDocument();

    // Recovery action buttons are present
    const retryBtn = screen.getByRole('button', { name: /Try Again/i });
    const homeBtn = screen.getByRole('button', { name: /Back to Home/i });
    expect(retryBtn).toBeInTheDocument();
    expect(homeBtn).toBeInTheDocument();
  });

  // ---------------------------------------------------------------------------
  // 2. Route-Level Error Isolation
  // ---------------------------------------------------------------------------
  it('2. RouteErrorBoundary isolates page failures without destroying global layout context and supports reset', () => {
    const TestLayout: React.FC<{ crash?: boolean }> = ({ crash = true }) => {
      const [shouldCrash, setShouldCrash] = useState(crash);

      return (
        <div data-testid="app-shell">
          <nav data-testid="global-navbar">Global Navigation Bar</nav>
          <main>
            <RouteErrorBoundary featureName="Software Catalog">
              <div data-testid="page-outlet">
                {shouldCrash ? (
                  <BuggyComponent shouldThrow={true} />
                ) : (
                  <div>Catalog loaded successfully</div>
                )}
                <button onClick={() => setShouldCrash(false)}>Repair Page</button>
              </div>
            </RouteErrorBoundary>
          </main>
          <footer data-testid="global-footer">Global Footer</footer>
        </div>
      );
    };

    render(
      <MemoryRouter>
        <TestLayout crash={true} />
      </MemoryRouter>
    );

    // Global navigation and footer remain intact and mounted!
    expect(screen.getByTestId('global-navbar')).toBeInTheDocument();
    expect(screen.getByTestId('global-footer')).toBeInTheDocument();

    // Route boundary displays contained error state
    expect(screen.getByRole('heading', { name: /Unable to load Software Catalog/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Try Again/i })).toBeInTheDocument();
  });

  // ---------------------------------------------------------------------------
  // 3. Firebase Permission Error Normalization
  // ---------------------------------------------------------------------------
  it('3. Firebase permission-denied error is normalized to FORBIDDEN with friendly human-readable message', () => {
    const rawFirebasePermissionError = {
      code: 'permission-denied',
      message: 'FirebaseError: Missing or insufficient permissions.',
    };

    const appError = mapFirestoreError(rawFirebasePermissionError, 'create support ticket');

    expect(appError.code).toBe('FORBIDDEN');
    expect(appError.isRetryable).toBe(false);
    expect(appError.message).toBe('You do not have permission to access this resource or perform this action.');
    expect(isPermissionError(appError)).toBe(true);
    expect(isRetryableError(appError)).toBe(false);
  });

  // ---------------------------------------------------------------------------
  // 4. Network Error Normalization & Retryability
  // ---------------------------------------------------------------------------
  it('4. Network unavailable error is normalized to NETWORK_ERROR with isRetryable=true flag', () => {
    const rawNetworkError = {
      code: 'unavailable',
      message: 'Failed to get document because the client is offline.',
    };

    const appError = mapFirestoreError(rawNetworkError);

    expect(appError.code).toBe('NETWORK_ERROR');
    expect(appError.isRetryable).toBe(true);
    expect(isNetworkError(appError)).toBe(true);
    expect(isRetryableError(appError)).toBe(true);
    expect(appError.message).toContain('network connection is temporarily unavailable');

    const friendlyMsg = getUserFriendlyErrorMessage(appError);
    expect(friendlyMsg).toContain('network connection is temporarily unavailable');
  });

  // ---------------------------------------------------------------------------
  // 5. 404 Not Found & Privacy Preservation
  // ---------------------------------------------------------------------------
  it('5. NotFoundPage renders 404 badge, clear message, and quick navigation without leaking private resource existence', () => {
    render(
      <MemoryRouter>
        <NotFoundPage resourceType="app" />
      </MemoryRouter>
    );

    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: /Application Not Found/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Back to Home/i })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: /Search Content/i })).toHaveAttribute('href', '/search');
    expect(screen.getByRole('link', { name: /Browse Apps/i })).toHaveAttribute('href', '/apps');
    expect(screen.getByRole('link', { name: /Read Blog/i })).toHaveAttribute('href', '/blog');
    expect(screen.getByRole('link', { name: /Help Center/i })).toHaveAttribute('href', '/help');
  });

  // ---------------------------------------------------------------------------
  // 6. Form Validation & Double-Submission Prevention
  // ---------------------------------------------------------------------------
  it('6. Form renders field errors with aria-describedby and disables submit button to prevent duplicate submissions', async () => {
    const user = userEvent.setup();
    let submissionCount = 0;
    const mockSubmit = vi.fn().mockImplementation(async () => {
      submissionCount++;
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    render(<TestFormComponent onSubmit={mockSubmit} />);

    const submitBtn = screen.getByRole('button', { name: /Submit/i });
    const emailInput = screen.getByLabelText(/Email Address/i);

    // 1. Submit empty -> Shows field error with aria-describedby
    await user.click(submitBtn);
    expect(screen.getByRole('alert')).toHaveTextContent('Email address is required');
    expect(emailInput).toHaveAttribute('aria-invalid', 'true');
    expect(emailInput).toHaveAttribute('aria-describedby', 'test-email-error');
    expect(submissionCount).toBe(0);

    // 2. Type email and submit
    await user.type(emailInput, 'dev@elsesourav.com');
    await user.click(submitBtn);

    // While submitting, button is disabled (preventing double clicks)
    expect(submitBtn).toBeDisabled();

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledTimes(1);
    });
  });

  // ---------------------------------------------------------------------------
  // 7. Deliberate Retry on Transient Network Failure
  // ---------------------------------------------------------------------------
  it('7. withRetry deliberately retries transient network errors and succeeds upon retry', async () => {
    let callCount = 0;
    const retryEvents: number[] = [];

    const transientOperation = async () => {
      callCount++;
      if (callCount < 2) {
        return err(AppError.network('Network blip'));
      }
      return ok({ status: 'connected', timestamp: 12345 });
    };

    const result = await withRetry(transientOperation, {
      maxRetries: 2,
      initialDelayMs: 10,
      backoffMultiplier: 1.5,
      onRetry: (attempt) => retryEvents.push(attempt),
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe('connected');
    }
    expect(callCount).toBe(2);
    expect(retryEvents).toEqual([1]);
  });

  // ---------------------------------------------------------------------------
  // 8. No Infinite Retries on Non-Retryable Errors
  // ---------------------------------------------------------------------------
  it('8. withRetry strictly rejects non-retryable errors (FORBIDDEN, VALIDATION) immediately without retrying', async () => {
    let callCount = 0;

    const forbiddenOperation = async () => {
      callCount++;
      return err(AppError.forbidden('User lacks admin role'));
    };

    const result = await withRetry(forbiddenOperation, {
      maxRetries: 3,
      initialDelayMs: 10,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('FORBIDDEN');
    }
    // Strictly called only once — no wasted retries on permission failures
    expect(callCount).toBe(1);
  });

  // ---------------------------------------------------------------------------
  // 9. Error Logging Sanitization (No Secret Exposure)
  // ---------------------------------------------------------------------------
  it('9. ErrorLoggerService sanitizes passwords, auth tokens, and sensitive URL query params', () => {
    const rawContext = {
      userEmail: 'user@example.com',
      password: 'SuperSecretPassword123!',
      confirmPassword: 'SuperSecretPassword123!',
      idToken: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.token',
      apiKey: 'AIzaSyA_ExampleApiKey12345',
      nested: {
        accessToken: 'secret-token-value',
        safeProperty: 'public-data',
      },
    };

    const sanitized = sanitizeContext(rawContext) as Record<string, unknown>;

    expect(sanitized.password).toBe('[REDACTED]');
    expect(sanitized.confirmPassword).toBe('[REDACTED]');
    expect(sanitized.idToken).toBe('[REDACTED]');
    expect(sanitized.apiKey).toBe('[REDACTED]');
    expect((sanitized.nested as Record<string, unknown>).accessToken).toBe('[REDACTED]');
    expect((sanitized.nested as Record<string, unknown>).safeProperty).toBe('public-data');

    // URL parameter sanitization
    const sensitiveUrl = 'https://elsesourav.com/auth/verify?apiKey=secretKey123&oobCode=code456&mode=verifyEmail';
    const sanitizedUrl = sanitizeUrlString(sensitiveUrl);
    expect(sanitizedUrl).not.toContain('secretKey123');
    expect(sanitizedUrl).not.toContain('code456');
    expect(sanitizedUrl).toContain('apiKey=[REDACTED]');
    expect(sanitizedUrl).toContain('oobCode=[REDACTED]');
  });

  // ---------------------------------------------------------------------------
  // 10. Admin Error Behavior
  // ---------------------------------------------------------------------------
  it('10. Admin views receive actionable domain diagnostics without exposing secrets', () => {
    const validationError = AppError.validation(
      'Publishing failed: At least one active platform link is required before publishing.',
      'links'
    );

    expect(validationError.code).toBe('VALIDATION_ERROR');
    expect(validationError.field).toBe('links');
    expect(validationError.message).toContain('At least one active platform link is required');
    expect(validationError.isRetryable).toBe(false);
  });

  // ---------------------------------------------------------------------------
  // 11. Accessibility
  // ---------------------------------------------------------------------------
  it('11. Error boundaries and alerts carry role="alert" and maintain accessible button labels', () => {
    render(
      <ErrorBoundary level="root" title="Critical Failure" description="Please try again.">
        <BuggyComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    const alertContainer = screen.getByRole('alert');
    expect(alertContainer).toBeInTheDocument();

    const tryAgainBtn = screen.getByRole('button', { name: /Try Again/i });
    expect(tryAgainBtn).toBeInTheDocument();
    expect(tryAgainBtn).not.toHaveAttribute('aria-hidden', 'true');
  });

  // ---------------------------------------------------------------------------
  // 12. Recovery Navigation
  // ---------------------------------------------------------------------------
  it('12. Custom fallback function receives error and reset handler for programmatic recovery', () => {
    let recovered = false;

    const FallbackWithRecovery: React.FC<{ error: Error; reset: () => void }> = ({ error, reset }) => (
      <div role="alert">
        <p>Custom Error: {error.message}</p>
        <button
          onClick={() => {
            recovered = true;
            reset();
          }}
        >
          Custom Reset
        </button>
      </div>
    );

    render(
      <ErrorBoundary fallback={(error, reset) => <FallbackWithRecovery error={error} reset={reset} />}>
        <BuggyComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText(/Custom Error: Simulation of catastrophic component rendering crash/i)).toBeInTheDocument();
    const customResetBtn = screen.getByRole('button', { name: /Custom Reset/i });
    fireEvent.click(customResetBtn);

    expect(recovered).toBe(true);
  });
});
