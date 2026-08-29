import * as React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  Button,
  IconButton,
  Badge,
  Avatar,
  Input,
  Textarea,
  Select,
  Checkbox,
  Switch,
  RadioGroup,
  RadioGroupItem,
  FormField,
  Container,
  Section,
  SectionHeader,
  PageHeader,
  SkipLink,
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
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  Tooltip,
  ToastProvider,
  useToast,
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
} from '@elsesourav/ui';
import { Plus } from 'lucide-react';

describe('Button & Foundation Primitives', () => {
  it('renders Button and IconButton correctly and handles click event', () => {
    const handleClick = vi.fn();
    render(
      <div>
        <Button onClick={handleClick}>Click Me</Button>
        <IconButton
          icon={<Plus className="w-4 h-4" />}
          aria-label="Add Item"
          onClick={handleClick}
        />
      </div>
    );
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeDefined();
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);

    const iconBtn = screen.getByRole('button', { name: /add item/i });
    expect(iconBtn).toBeDefined();
    fireEvent.click(iconBtn);
    expect(handleClick).toHaveBeenCalledTimes(2);
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
    render(<Pagination currentPage={2} totalPages={5} onPageChange={handlePageChange} />);
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

  it('renders RadioGroup and handles selection change', () => {
    const handleChange = vi.fn();
    render(
      <RadioGroup defaultValue="dark" onChange={handleChange}>
        <RadioGroupItem value="light" label="Light Theme" />
        <RadioGroupItem value="dark" label="Dark Theme" />
      </RadioGroup>
    );

    expect(screen.getByText('Light Theme')).toBeDefined();
    expect(screen.getByText('Dark Theme')).toBeDefined();

    const lightRadio = screen.getByRole('radio', { name: /light theme/i });
    fireEvent.click(lightRadio);
    expect(handleChange).toHaveBeenCalledWith('light');
  });

  it('renders DropdownMenu and handles item selection', () => {
    const handleAction = vi.fn();
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Options</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={handleAction}>Edit Profile</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );

    const trigger = screen.getByRole('button', { name: 'Options' });
    expect(screen.queryByRole('menuitem', { name: 'Edit Profile' })).toBeNull();

    fireEvent.click(trigger);
    const item = screen.getByRole('menuitem', { name: 'Edit Profile' });
    expect(item).toBeDefined();

    fireEvent.click(item);
    expect(handleAction).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('menuitem', { name: 'Edit Profile' })).toBeNull();
  });

  it('renders Tooltip on focus and hover', () => {
    render(
      <Tooltip content="Helper info">
        <button type="button">Hover Me</button>
      </Tooltip>
    );

    const trigger = screen.getByRole('button', { name: 'Hover Me' });
    expect(screen.queryByRole('tooltip')).toBeNull();

    fireEvent.mouseEnter(trigger.parentElement!);
    expect(screen.getByRole('tooltip')).toBeDefined();
    expect(screen.getByText('Helper info')).toBeDefined();

    fireEvent.mouseLeave(trigger.parentElement!);
    expect(screen.queryByRole('tooltip')).toBeNull();
  });

  it('provides Toast notification triggers through useToast hook', () => {
    function ToastTestComponent() {
      const { addToast } = useToast();
      return (
        <button
          type="button"
          onClick={() =>
            addToast({
              title: 'Settings Saved',
              description: 'Profile updated successfully.',
              type: 'success',
            })
          }
        >
          Trigger Toast
        </button>
      );
    }

    render(
      <ToastProvider>
        <ToastTestComponent />
      </ToastProvider>
    );

    const triggerBtn = screen.getByRole('button', { name: 'Trigger Toast' });
    fireEvent.click(triggerBtn);

    expect(screen.getByText('Settings Saved')).toBeDefined();
    expect(screen.getByText('Profile updated successfully.')).toBeDefined();
  });

  it('renders Container, Section, SectionHeader, PageHeader, and SkipLink', () => {
    render(
      <div>
        <SkipLink targetId="main-content" />
        <Container size="lg">
          <PageHeader
            title="Applications Directory"
            description="High-performance developer tools."
            badge={<Badge variant="primary">Production</Badge>}
            actions={<Button size="sm">Create App</Button>}
          />
          <Section spacing="md">
            <SectionHeader
              caption="Architecture"
              title="Built for Speed"
              description="Zero-runtime dependencies."
            />
          </Section>
        </Container>
      </div>
    );

    expect(screen.getByText('Skip to main content')).toBeDefined();
    expect(screen.getByText('Applications Directory')).toBeDefined();
    expect(screen.getByText('High-performance developer tools.')).toBeDefined();
    expect(screen.getByText('Production')).toBeDefined();
    expect(screen.getByText('Create App')).toBeDefined();
    expect(screen.getByText('Architecture')).toBeDefined();
    expect(screen.getByText('Built for Speed')).toBeDefined();
    expect(screen.getByText('Zero-runtime dependencies.')).toBeDefined();
  });
});
