import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Tabs } from '../Navigation/Tabs';

describe('Tabs Component', () => {
  const mockTabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'settings', label: 'Settings' },
  ];

  it('renders tabs with active tab selected', () => {
    render(
      <Tabs tabs={mockTabs} activeTab="overview" onChange={vi.fn()}>
        <div>Overview Content</div>
      </Tabs>
    );

    const activeTab = screen.getByRole('tab', { name: /overview/i });
    const inactiveTab = screen.getByRole('tab', { name: /analytics/i });

    expect(activeTab).toHaveAttribute('aria-selected', 'true');
    expect(inactiveTab).toHaveAttribute('aria-selected', 'false');
    expect(screen.getByText('Overview Content')).toBeInTheDocument();
  });

  it('triggers onChange when a different tab is clicked', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(<Tabs tabs={mockTabs} activeTab="overview" onChange={handleChange} />);

    const analyticsTab = screen.getByRole('tab', { name: /analytics/i });
    await user.click(analyticsTab);

    expect(handleChange).toHaveBeenCalledWith('analytics');
  });

  it('navigates tabs using keyboard arrow keys', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(<Tabs tabs={mockTabs} activeTab="overview" onChange={handleChange} />);

    const overviewTab = screen.getByRole('tab', { name: /overview/i });
    overviewTab.focus();

    await user.keyboard('{ArrowRight}');
    expect(handleChange).toHaveBeenCalledWith('analytics');
  });
});
