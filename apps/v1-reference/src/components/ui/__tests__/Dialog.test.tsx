import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Dialog } from '../Overlays/Dialog';

describe('Dialog Component', () => {
  it('does not render when isOpen is false', () => {
    render(
      <Dialog isOpen={false} onClose={vi.fn()} title="Settings">
        Dialog Content
      </Dialog>
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders title, content, and close button when isOpen is true', () => {
    render(
      <Dialog
        isOpen={true}
        onClose={vi.fn()}
        title="Settings"
        description="Adjust your preferences"
      >
        Dialog Content Body
      </Dialog>
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Adjust your preferences')).toBeInTheDocument();
    expect(screen.getByText('Dialog Content Body')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', async () => {
    const user = userEvent.setup();
    const handleClose = vi.fn();
    render(
      <Dialog isOpen={true} onClose={handleClose} title="Modal Title">
        Content
      </Dialog>
    );

    const closeBtn = screen.getByRole('button', { name: /close dialog/i });
    await user.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when Escape key is pressed', async () => {
    const user = userEvent.setup();
    const handleClose = vi.fn();
    render(
      <Dialog isOpen={true} onClose={handleClose} title="Escape Test">
        Content
      </Dialog>
    );

    await user.keyboard('{Escape}');
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
