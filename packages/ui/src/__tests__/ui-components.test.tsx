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
  FormField,
  Card,
  CardTitle,
  GlassSurface,
  Alert,
  AlertTitle,
  EmptyState,
  ErrorState,
  Dialog,
  DialogContent,
  DialogTitle,
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
} from '../index';

describe('Button & Foundation Primitives', () => {
  it('renders Button correctly and handles click event', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click Me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeDefined();
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders loading state with disabled button', () => {
    render(<Button loading>Processing</Button>);
    const button = screen.getByRole('button');
    expect(button.getAttribute('disabled')).toBeDefined();
  });

  it('renders Badge and Avatar with fallback text', () => {
    render(
      <div>
        <Badge variant="success">Active</Badge>
        <Avatar alt="Sourav" fallback="ES" />
      </div>
    );
    expect(screen.getByText('Active')).toBeDefined();
    expect(screen.getByText('ES')).toBeDefined();
  });
});

describe('Form Primitives', () => {
  it('renders Input with error state', () => {
    render(<Input placeholder="Enter username" error="Username is required" />);
    expect(screen.getByPlaceholderText('Enter username')).toBeDefined();
    expect(screen.getByText('Username is required')).toBeDefined();
  });

  it('renders Textarea and Select components', () => {
    render(
      <div>
        <Textarea placeholder="Enter bio" error="Bio is required" />
        <Select options={[{ value: 'dev', label: 'Developer' }]} />
      </div>
    );
    expect(screen.getByPlaceholderText('Enter bio')).toBeDefined();
    expect(screen.getByText('Developer')).toBeDefined();
  });

  it('renders FormField wrapper', () => {
    render(
      <FormField label="Email" required error="Invalid email">
        <Input placeholder="user@example.com" />
      </FormField>
    );
    expect(screen.getByText('Email')).toBeDefined();
    expect(screen.getByText('*')).toBeDefined();
    expect(screen.getByText('Invalid email')).toBeDefined();
  });

  it('renders Checkbox and handles toggle', () => {
    const handleChange = vi.fn();
    render(<Checkbox label="Accept Terms" onChange={handleChange} />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeDefined();
    fireEvent.click(checkbox);
    expect(handleChange).toHaveBeenCalled();
  });

  it('renders Switch with accessible role and toggles', () => {
    const handleToggle = vi.fn();
    render(<Switch label="Dark Mode" onCheckedChange={handleToggle} />);
    const switchBtn = screen.getByRole('switch');
    expect(switchBtn).toBeDefined();
    fireEvent.click(switchBtn);
    expect(handleToggle).toHaveBeenCalledWith(true);
  });
});

describe('Feedback & Surface Components', () => {
  it('renders Card and GlassSurface containers', () => {
    render(
      <GlassSurface data-testid="glass">
        <Card>
          <CardTitle>System Overview</CardTitle>
        </Card>
      </GlassSurface>
    );
    expect(screen.getByTestId('glass')).toBeDefined();
    expect(screen.getByText('System Overview')).toBeDefined();
  });

  it('renders Alert with title and message', () => {
    render(
      <Alert variant="warning">
        <AlertTitle>Attention</AlertTitle>
        Scheduled maintenance at midnight.
      </Alert>
    );
    expect(screen.getByRole('alert')).toBeDefined();
    expect(screen.getByText('Attention')).toBeDefined();
  });

  it('renders EmptyState with action CTA', () => {
    render(
      <EmptyState
        title="No Applications Found"
        description="Try adjusting your search filters."
        action={<Button>Clear Filters</Button>}
      />
    );
    expect(screen.getByText('No Applications Found')).toBeDefined();
    expect(screen.getByRole('button', { name: /clear filters/i })).toBeDefined();
  });

  it('renders ErrorState and triggers retry', () => {
    const handleRetry = vi.fn();
    render(<ErrorState onRetry={handleRetry} retryLabel="Retry Fetch" />);
    const retryBtn = screen.getByRole('button', { name: /retry fetch/i });
    fireEvent.click(retryBtn);
    expect(handleRetry).toHaveBeenCalledTimes(1);
  });
});

describe('Overlay Components', () => {
  it('renders Dialog when open is true and handles escape key', () => {
    const handleOpenChange = vi.fn();
    render(
      <Dialog open={true} onOpenChange={handleOpenChange}>
        <DialogContent onClose={() => handleOpenChange(false)}>
          <DialogTitle>Confirm Action</DialogTitle>
        </DialogContent>
      </Dialog>
    );
    expect(screen.getByRole('dialog')).toBeDefined();
    expect(screen.getByText('Confirm Action')).toBeDefined();
    fireEvent.keyDown(window, { key: 'Escape', code: 'Escape' });
    expect(handleOpenChange).toHaveBeenCalledWith(false);
  });
});

describe('Navigation & Data Display Components', () => {
  it('switches tabs correctly', () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
      </Tabs>
    );
    expect(screen.getByText('Content 1')).toBeDefined();
    fireEvent.click(screen.getByRole('tab', { name: /tab 2/i }));
    expect(screen.getByText('Content 2')).toBeDefined();
  });

  it('renders Table and StatCard', () => {
    render(
      <div>
        <StatCard label="Total Downloads" value="2.4M" change="+14%" changeType="positive" />
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>Terminal Pro</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    );
    expect(screen.getByText('Total Downloads')).toBeDefined();
    expect(screen.getByText('2.4M')).toBeDefined();
    expect(screen.getByText('+14%')).toBeDefined();
    expect(screen.getByText('Terminal Pro')).toBeDefined();
  });

  it('renders Pagination and handles page switching', () => {
    const handlePageChange = vi.fn();
    render(
      <Pagination
        currentPage={2}
        totalPages={5}
        onPageChange={handlePageChange}
      />
    );
    expect(screen.getByRole('navigation', { name: /pagination/i })).toBeDefined();
    expect(screen.getByText('2')).toBeDefined();
    expect(screen.getByText('5')).toBeDefined();

    const prevBtn = screen.getByRole('button', { name: /go to previous page/i });
    fireEvent.click(prevBtn);
    expect(handlePageChange).toHaveBeenCalledWith(1);

    const nextBtn = screen.getByRole('button', { name: /go to next page/i });
    fireEvent.click(nextBtn);
    expect(handlePageChange).toHaveBeenCalledWith(3);
  });
});
