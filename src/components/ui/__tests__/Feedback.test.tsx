import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Alert } from '../Feedback/Alert';
import { Spinner } from '../Feedback/Spinner';
import { Skeleton } from '../Feedback/Skeleton';
import { Progress } from '../Feedback/Progress';

describe('Feedback Components', () => {
  it('renders Alert with variant and calls onDismiss when clicked', async () => {
    const user = userEvent.setup();
    const handleDismiss = vi.fn();

    render(
      <Alert variant="error" title="Payment Failed" onDismiss={handleDismiss}>
        Please verify your card details.
      </Alert>
    );

    expect(screen.getByRole('alert')).toHaveClass('ui-alert--error');
    expect(screen.getByText('Payment Failed')).toBeInTheDocument();
    expect(screen.getByText('Please verify your card details.')).toBeInTheDocument();

    const dismissBtn = screen.getByRole('button', { name: /dismiss alert/i });
    await user.click(dismissBtn);
    expect(handleDismiss).toHaveBeenCalledTimes(1);
  });

  it('renders Spinner with accessible role=status and label', () => {
    render(<Spinner label="Fetching data" />);
    const spinner = screen.getByRole('status');
    expect(spinner).toBeInTheDocument();
    expect(screen.getByText('Fetching data')).toBeInTheDocument();
  });

  it('renders Skeleton with proper class and aria-hidden', () => {
    render(<Skeleton variant="circular" width={48} height={48} data-testid="skeleton" />);
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toHaveClass('ui-skeleton--circular');
    expect(skeleton).toHaveAttribute('aria-hidden', 'true');
    expect(skeleton).toHaveStyle({ width: '48px', height: '48px' });
  });

  it('renders Progress with aria attributes', () => {
    render(<Progress value={65} max={100} label="Storage used" />);
    const progress = screen.getByRole('progressbar');
    expect(progress).toHaveAttribute('aria-valuenow', '65');
    expect(progress).toHaveAttribute('aria-valuemax', '100');
    expect(progress).toHaveAttribute('aria-label', 'Storage used');
  });
});
