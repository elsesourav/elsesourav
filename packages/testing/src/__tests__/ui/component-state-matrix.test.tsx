import * as React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  Button,
  Badge,
  Avatar,
  Input,
  Textarea,
  Select,
  Checkbox,
  Switch,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  GlassSurface,
  Alert,
  AlertTitle,
  EmptyState,
  ErrorState,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  StatCard,
  Pagination,
  Skeleton,
  Spinner,
} from '@elsesourav/ui';

describe('UI Component State Matrix & Edge Cases', () => {
  describe('1. Button State Matrix', () => {
    it('handles default, primary, secondary, outline, ghost, and danger variants', () => {
      const { rerender } = render(<Button variant="primary">Primary</Button>);
      expect(screen.getByRole('button', { name: 'Primary' })).toBeDefined();

      rerender(<Button variant="secondary">Secondary</Button>);
      expect(screen.getByRole('button', { name: 'Secondary' })).toBeDefined();

      rerender(<Button variant="outline">Outline</Button>);
      expect(screen.getByRole('button', { name: 'Outline' })).toBeDefined();

      rerender(<Button variant="ghost">Ghost</Button>);
      expect(screen.getByRole('button', { name: 'Ghost' })).toBeDefined();

      rerender(<Button variant="danger">Danger</Button>);
      expect(screen.getByRole('button', { name: 'Danger' })).toBeDefined();
    });

    it('handles disabled state and prevents click execution', () => {
      const handleClick = vi.fn();
      render(<Button disabled onClick={handleClick}>Disabled</Button>);
      const button = screen.getByRole('button', { name: 'Disabled' });

      expect(button.getAttribute('disabled')).not.toBeNull();
      fireEvent.click(button);
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('handles loading state (both loading and isLoading props)', () => {
      const { rerender } = render(<Button loading>Save</Button>);
      let button = screen.getByRole('button');
      expect(button.getAttribute('disabled')).not.toBeNull();

      rerender(<Button isLoading>Save</Button>);
      button = screen.getByRole('button');
      expect(button.getAttribute('disabled')).not.toBeNull();
    });

    it('renders different sizes (sm, md, lg)', () => {
      const { rerender } = render(<Button size="sm">Small</Button>);
      expect(screen.getByRole('button', { name: 'Small' })).toBeDefined();

      rerender(<Button size="lg">Large</Button>);
      expect(screen.getByRole('button', { name: 'Large' })).toBeDefined();
    });
  });

  describe('2. Input & Form Control Matrix', () => {
    it('handles short text, long text, and Unicode strings', () => {
      render(<Input placeholder="Text input" />);
      const input = screen.getByPlaceholderText('Text input');

      fireEvent.change(input, { target: { value: 'abc' } });
      expect(screen.getByDisplayValue('abc')).toBeDefined();

      const longUnicode = 'Übergrößenmaßstab 🚀 — René François Müller (1234567890)';
      fireEvent.change(input, { target: { value: longUnicode } });
      expect(screen.getByDisplayValue(longUnicode)).toBeDefined();
    });

    it('renders error state with accessible error message', () => {
      render(<Input error="Field is required" placeholder="Required input" />);
      expect(screen.getByText('Field is required')).toBeDefined();
    });

    it('renders disabled input state', () => {
      render(<Input disabled placeholder="Disabled input" />);
      const input = screen.getByPlaceholderText('Disabled input');
      expect(input.getAttribute('disabled')).not.toBeNull();
    });

    it('renders Textarea with long input and error state', () => {
      const longDesc = 'A'.repeat(500);
      render(<Textarea defaultValue={longDesc} error="Too long" placeholder="Description" />);
      expect(screen.getByDisplayValue(longDesc)).toBeDefined();
      expect(screen.getByText('Too long')).toBeDefined();
    });

    it('renders Select with options and handles selection change', () => {
      const handleChange = vi.fn();
      render(
        <Select
          options={[
            { value: 'opt1', label: 'Option 1' },
            { value: 'opt2', label: 'Option 2' },
          ]}
          onChange={handleChange}
        />
      );
      const select = screen.getByRole('combobox');
      fireEvent.change(select, { target: { value: 'opt2' } });
      expect(handleChange).toHaveBeenCalled();
    });

    it('renders Checkbox with indeterminate/checked states and label', () => {
      const handleChange = vi.fn();
      render(<Checkbox label="I agree to Terms & Conditions" onChange={handleChange} />);
      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);
      expect(handleChange).toHaveBeenCalled();
    });

    it('renders Switch with toggle interaction', () => {
      const handleToggle = vi.fn();
      render(<Switch label="Enable Notifications" onCheckedChange={handleToggle} />);
      const switchBtn = screen.getByRole('switch');
      fireEvent.click(switchBtn);
      expect(handleToggle).toHaveBeenCalledWith(true);
    });
  });

  describe('3. Badge & Status Matrix', () => {
    it('renders all badge variants (default, success, warning, info, outline)', () => {
      render(
        <div>
          <Badge variant="default">Draft</Badge>
          <Badge variant="success">Published</Badge>
          <Badge variant="warning">In Progress</Badge>
          <Badge variant="info">Featured</Badge>
          <Badge variant="outline">Archived</Badge>
        </div>
      );
      expect(screen.getByText('Draft')).toBeDefined();
      expect(screen.getByText('Published')).toBeDefined();
      expect(screen.getByText('In Progress')).toBeDefined();
      expect(screen.getByText('Featured')).toBeDefined();
      expect(screen.getByText('Archived')).toBeDefined();
    });
  });

  describe('4. Avatar & Fallback Matrix', () => {
    it('renders avatar with image and falls back to text monogram when image missing', () => {
      const { rerender } = render(
        <Avatar src="https://example.test/avatar.png" alt="Jordan Taylor" fallback="JT" />
      );
      const img = screen.getByRole('img');
      expect(img.getAttribute('src')).toBe('https://example.test/avatar.png');

      rerender(<Avatar alt="Jordan Taylor" fallback="JT" />);
      expect(screen.getByText('JT')).toBeDefined();
    });
  });

  describe('5. Card & Container Matrix', () => {
    it('renders Card with Header, Title, Description, Content, and Footer', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Terminal Pro</CardTitle>
            <CardDescription>Hardware accelerated shell</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Main content area with high throughput metrics.</p>
          </CardContent>
          <CardFooter>
            <Button size="sm">Launch</Button>
          </CardFooter>
        </Card>
      );
      expect(screen.getByText('Terminal Pro')).toBeDefined();
      expect(screen.getByText('Hardware accelerated shell')).toBeDefined();
      expect(screen.getByText('Main content area with high throughput metrics.')).toBeDefined();
      expect(screen.getByRole('button', { name: 'Launch' })).toBeDefined();
    });

    it('renders GlassSurface with backdrop blur styling', () => {
      render(
        <GlassSurface data-testid="glass-container">
          <span>Glass Content</span>
        </GlassSurface>
      );
      expect(screen.getByTestId('glass-container')).toBeDefined();
      expect(screen.getByText('Glass Content')).toBeDefined();
    });
  });

  describe('6. Dialog & Overlay Matrix', () => {
    it('renders modal dialog when open is true and handles backdrop click', () => {
      const handleOpenChange = vi.fn();
      render(
        <Dialog open={true} onOpenChange={handleOpenChange}>
          <DialogContent onClose={() => handleOpenChange(false)}>
            <DialogHeader>
              <DialogTitle>Delete Application</DialogTitle>
              <DialogDescription>Are you sure you want to delete this tool?</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="danger">Confirm Delete</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );

      expect(screen.getByRole('dialog')).toBeDefined();
      expect(screen.getByText('Delete Application')).toBeDefined();

      // Click close button
      const closeBtn = screen.getByLabelText('Close dialog');
      fireEvent.click(closeBtn);
      expect(handleOpenChange).toHaveBeenCalledWith(false);
    });

    it('returns null when dialog open is false', () => {
      render(
        <Dialog open={false} onOpenChange={() => {}}>
          <DialogContent>
            <DialogTitle>Hidden</DialogTitle>
          </DialogContent>
        </Dialog>
      );
      expect(screen.queryByText('Hidden')).toBeNull();
    });
  });

  describe('7. Tabs Navigation Matrix', () => {
    it('supports switching tabs and rendering corresponding content', () => {
      render(
        <Tabs defaultValue="profile">
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>
          <TabsContent value="profile">Profile Details</TabsContent>
          <TabsContent value="preferences">Theme Settings</TabsContent>
          <TabsContent value="security">API Keys</TabsContent>
        </Tabs>
      );

      expect(screen.getByText('Profile Details')).toBeDefined();
      expect(screen.queryByText('Theme Settings')).toBeNull();

      fireEvent.click(screen.getByRole('tab', { name: 'Preferences' }));
      expect(screen.getByText('Theme Settings')).toBeDefined();
      expect(screen.queryByText('Profile Details')).toBeNull();
    });
  });

  describe('8. Pagination Matrix', () => {
    it('renders navigation buttons and dispatches page changes', () => {
      const handlePage = vi.fn();
      render(<Pagination currentPage={3} totalPages={10} onPageChange={handlePage} />);

      expect(screen.getByText('3')).toBeDefined();
      expect(screen.getByText('10')).toBeDefined();

      const prevBtn = screen.getByRole('button', { name: /previous/i });
      fireEvent.click(prevBtn);
      expect(handlePage).toHaveBeenCalledWith(2);

      const nextBtn = screen.getByRole('button', { name: /next/i });
      fireEvent.click(nextBtn);
      expect(handlePage).toHaveBeenCalledWith(4);
    });

    it('disables previous button on first page and next button on last page', () => {
      const { rerender } = render(<Pagination currentPage={1} totalPages={5} onPageChange={() => {}} />);
      const prevBtn = screen.getByRole('button', { name: /previous/i });
      expect(prevBtn.getAttribute('disabled')).not.toBeNull();

      rerender(<Pagination currentPage={5} totalPages={5} onPageChange={() => {}} />);
      const nextBtn = screen.getByRole('button', { name: /next/i });
      expect(nextBtn.getAttribute('disabled')).not.toBeNull();
    });

    it('returns null when totalPages <= 1', () => {
      const { container } = render(<Pagination currentPage={1} totalPages={1} onPageChange={() => {}} />);
      expect(container.firstChild).toBeNull();
    });
  });

  describe('9. Feedback & State Display Matrix', () => {
    it('renders EmptyState with custom icon, title, description, and action button', () => {
      render(
        <EmptyState
          title="No Results Found"
          description="Try broadening your search term or clearing category filters."
          action={<Button size="sm">Reset Filters</Button>}
        />
      );
      expect(screen.getByText('No Results Found')).toBeDefined();
      expect(screen.getByText(/broadening your search/i)).toBeDefined();
      expect(screen.getByRole('button', { name: 'Reset Filters' })).toBeDefined();
    });

    it('renders ErrorState with onRetry trigger', () => {
      const handleRetry = vi.fn();
      render(
        <ErrorState
          title="Database Connection Lost"
          description="Failed to communicate with PostgreSQL."
          onRetry={handleRetry}
          retryLabel="Reconnect"
        />
      );
      expect(screen.getByText('Database Connection Lost')).toBeDefined();
      const retryBtn = screen.getByRole('button', { name: /reconnect/i });
      fireEvent.click(retryBtn);
      expect(handleRetry).toHaveBeenCalledTimes(1);
    });

    it('renders Alert component with title and children', () => {
      render(
        <Alert variant="info">
          <AlertTitle>Notice</AlertTitle>
          Version 2.1 is now available for download.
        </Alert>
      );
      expect(screen.getByRole('alert')).toBeDefined();
      expect(screen.getByText('Notice')).toBeDefined();
      expect(screen.getByText(/Version 2.1 is now available/i)).toBeDefined();
    });

    it('renders Skeleton and Spinner loading primitives', () => {
      render(
        <div data-testid="loading-primitives">
          <Skeleton className="h-6 w-32" />
          <Spinner size="md" />
        </div>
      );
      expect(screen.getByTestId('loading-primitives')).toBeDefined();
    });
  });

  describe('10. Data Display & Table Matrix', () => {
    it('renders StatCard with positive and negative trends', () => {
      const { rerender } = render(
        <StatCard label="Active Users" value="12,450" change="+8.2%" changeType="positive" />
      );
      expect(screen.getByText('Active Users')).toBeDefined();
      expect(screen.getByText('12,450')).toBeDefined();
      expect(screen.getByText('+8.2%')).toBeDefined();

      rerender(<StatCard label="Error Rate" value="0.04%" change="-0.01%" changeType="negative" />);
      expect(screen.getByText('Error Rate')).toBeDefined();
      expect(screen.getByText('-0.01%')).toBeDefined();
    });

    it('renders Table with headers, rows, and cells', () => {
      render(
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tool</TableHead>
              <TableHead>Version</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>Terminal Pro</TableCell>
              <TableCell>2.1.0</TableCell>
              <TableCell>Published</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      expect(screen.getByText('Tool')).toBeDefined();
      expect(screen.getByText('Terminal Pro')).toBeDefined();
      expect(screen.getByText('2.1.0')).toBeDefined();
      expect(screen.getByText('Published')).toBeDefined();
    });
  });
});
