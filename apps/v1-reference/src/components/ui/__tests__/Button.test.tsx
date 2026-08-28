import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '../Foundation/Button';
import { IconButton } from '../Foundation/IconButton';
import { Sparkles } from 'lucide-react';

describe('Button Component', () => {
  it('renders button with label and responds to clicks', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click Me</Button>);

    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
    await user.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('supports variants and sizes', () => {
    const { rerender } = render(
      <Button variant="primary" size="lg">
        Primary Action
      </Button>
    );
    let button = screen.getByRole('button');
    expect(button).toHaveClass('ui-btn--primary');
    expect(button).toHaveClass('ui-btn--lg');

    rerender(
      <Button variant="destructive" size="sm">
        Delete
      </Button>
    );
    button = screen.getByRole('button');
    expect(button).toHaveClass('ui-btn--destructive');
    expect(button).toHaveClass('ui-btn--sm');
  });

  it('disables button and blocks clicks when disabled is true', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(
      <Button disabled onClick={handleClick}>
        Disabled
      </Button>
    );

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    await user.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('renders loading spinner and sets aria-busy when isLoading is true', () => {
    render(<Button isLoading>Save Changes</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(button).toBeDisabled();
  });

  it('IconButton requires accessible aria-label', () => {
    render(<IconButton icon={<Sparkles />} aria-label="Generate magic" />);
    const iconBtn = screen.getByRole('button', { name: /generate magic/i });
    expect(iconBtn).toBeInTheDocument();
  });
});
