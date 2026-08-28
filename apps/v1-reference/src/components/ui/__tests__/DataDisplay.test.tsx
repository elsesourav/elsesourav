import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EmptyState } from '../DataDisplay/EmptyState';
import { ErrorState } from '../DataDisplay/ErrorState';
import { Stat } from '../DataDisplay/Stat';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '../DataDisplay/Table';
import { Button } from '../Foundation/Button';

describe('DataDisplay Components', () => {
  it('renders EmptyState with title, description, and action button', () => {
    render(
      <EmptyState
        title="No apps installed"
        description="Explore the catalog to add apps to your library."
        action={<Button>Browse Apps</Button>}
      />
    );

    expect(screen.getByText('No apps installed')).toBeInTheDocument();
    expect(
      screen.getByText('Explore the catalog to add apps to your library.')
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /browse apps/i })).toBeInTheDocument();
  });

  it('renders ErrorState with retry button and calls onRetry', async () => {
    const user = userEvent.setup();
    const handleRetry = vi.fn();

    render(
      <ErrorState
        title="Network Error"
        message="Unable to fetch data from the server."
        onRetry={handleRetry}
      />
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Network Error')).toBeInTheDocument();
    expect(screen.getByText('Unable to fetch data from the server.')).toBeInTheDocument();

    const retryBtn = screen.getByRole('button', { name: /try again/i });
    await user.click(retryBtn);
    expect(handleRetry).toHaveBeenCalledTimes(1);
  });

  it('renders Stat card with label, value, and trend', () => {
    render(
      <Stat
        label="Active Users"
        value="12,450"
        change={{ value: '+14.2%', trend: 'up', timeframe: 'vs last month' }}
      />
    );

    expect(screen.getByText('Active Users')).toBeInTheDocument();
    expect(screen.getByText('12,450')).toBeInTheDocument();
    expect(screen.getByText('+14.2%')).toBeInTheDocument();
    expect(screen.getByText('vs last month')).toBeInTheDocument();
  });

  it('renders Table and structure', () => {
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Platform</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>TabFlow</TableCell>
            <TableCell>Chrome Extension</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );

    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByText('TabFlow')).toBeInTheDocument();
    expect(screen.getByText('Chrome Extension')).toBeInTheDocument();
  });
});
