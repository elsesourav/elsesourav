import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DropdownMenu } from '../Overlays/DropdownMenu';
import { Button } from '../Foundation/Button';

describe('DropdownMenu Component', () => {
  it('toggles menu on trigger click and triggers item action', async () => {
    const user = userEvent.setup();
    const handleEdit = vi.fn();

    render(
      <DropdownMenu
        trigger={<Button>Options</Button>}
        items={[
          { id: 'edit', label: 'Edit Project', onClick: handleEdit },
          'divider',
          { id: 'delete', label: 'Delete Project', destructive: true },
        ]}
      />
    );

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();

    const trigger = screen.getByRole('button', { name: /options/i });
    await user.click(trigger);

    expect(screen.getByRole('menu')).toBeInTheDocument();
    const editItem = screen.getByRole('menuitem', { name: /edit project/i });
    expect(editItem).toBeInTheDocument();

    await user.click(editItem);
    expect(handleEdit).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('closes dropdown when Escape key is pressed', async () => {
    const user = userEvent.setup();
    render(
      <DropdownMenu trigger={<Button>Actions</Button>} items={[{ id: 'item1', label: 'Item 1' }]} />
    );

    const trigger = screen.getByRole('button', { name: /actions/i });
    await user.click(trigger);
    expect(screen.getByRole('menu')).toBeInTheDocument();

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });
});
