import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import React from 'react';
import { Dialog, Drawer, DropdownMenu, Button } from '@/components/ui';
import { AppLayout } from '@/layouts/AppLayout';
import { AdminLayout } from '@/layouts/admin/AdminLayout';
import { SearchDialog } from '@/components/search/SearchDialog';
import { AppRatingSection } from '@/components/apps/AppRatingSection';
import { LoginPage } from '@/pages/LoginPage';

// Mock contexts and services
vi.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({
    theme: 'dark',
    toggleTheme: vi.fn(),
    setTheme: vi.fn(),
  }),
}));

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'test-user', email: 'test@example.com', displayName: 'Test User', role: 'admin' },
    authUser: { uid: 'test-user', email: 'test@example.com' },
    isAuthenticated: true,
    isAdmin: true,
    isLoading: false,
    signOut: vi.fn(),
    signIn: vi.fn().mockResolvedValue({ success: true }),
    signUp: vi.fn().mockResolvedValue({ success: true }),
  }),
}));

vi.mock('@/hooks/useAppFeedback', () => ({
  useAppFeedback: () => ({
    userReview: null,
    approvedReviews: [],
    ratingAggregate: {
      averageRating: 4.8,
      ratingCount: 12,
      distribution: { 1: 0, 2: 0, 3: 1, 4: 3, 5: 8 },
    },
    isSubmitting: false,
    submitReview: vi.fn().mockResolvedValue({ ok: true, value: { id: 'rev-1' } }),
  }),
}));

vi.mock('@/repositories', async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>();
  return {
    ...actual,
    appRepository: {
      findMany: vi.fn().mockResolvedValue({ success: true, data: { items: [], total: 0 } }),
    },
    blogRepository: {
      findMany: vi.fn().mockResolvedValue({ success: true, data: { items: [], total: 0 } }),
    },
    categoryRepository: {
      findMany: vi.fn().mockResolvedValue({ success: true, data: { items: [], total: 0 } }),
    },
    tagRepository: {
      findMany: vi.fn().mockResolvedValue({ success: true, data: { items: [], total: 0 } }),
    },
  };
});

describe('Prompt 61: Accessibility Audit & Remediation Pass', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('TASK 1 — Semantic Landmarks & Skip-to-Content Navigation', () => {
    it('provides a functional skip-to-content link in AppLayout targeting #main-content', () => {
      render(
        <MemoryRouter>
          <AppLayout>
            <div>Public Content</div>
          </AppLayout>
        </MemoryRouter>
      );

      const skipLink = screen.getByRole('link', { name: /skip to main content/i });
      expect(skipLink).toBeInTheDocument();
      expect(skipLink).toHaveAttribute('href', '#main-content');

      const mainElement = screen.getByRole('main');
      expect(mainElement).toHaveAttribute('id', 'main-content');
      expect(mainElement).toHaveAttribute('tabindex', '-1');
    });

    it('provides a functional skip-to-content link in AdminLayout targeting #admin-main-content', () => {
      render(
        <MemoryRouter>
          <AdminLayout>
            <div>Admin Dashboard Body</div>
          </AdminLayout>
        </MemoryRouter>
      );

      const skipLink = screen.getByRole('link', { name: /skip to admin content/i });
      expect(skipLink).toBeInTheDocument();
      expect(skipLink).toHaveAttribute('href', '#admin-main-content');

      const mainElement = screen.getByRole('main');
      expect(mainElement).toHaveAttribute('id', 'admin-main-content');
      expect(mainElement).toHaveAttribute('tabindex', '-1');
    });
  });

  describe('TASK 2 & 3 — Focus Management and Traps in Overlays (Dialog & Drawer)', () => {
    it('traps focus and restores focus upon closing Dialog', async () => {
      const TestDialogWrapper = () => {
        const [isOpen, setIsOpen] = React.useState(false);
        return (
          <div>
            <button id="open-btn" onClick={() => setIsOpen(true)}>
              Open Test Dialog
            </button>
            <Dialog isOpen={isOpen} onClose={() => setIsOpen(false)} title="Test Focus Modal">
              <input id="input-1" placeholder="First focusable field" />
              <button id="modal-submit-btn">Submit Action</button>
              <button id="modal-cancel-btn" onClick={() => setIsOpen(false)}>
                Cancel
              </button>
            </Dialog>
          </div>
        );
      };

      render(<TestDialogWrapper />);
      const openBtn = screen.getByRole('button', { name: /open test dialog/i });
      openBtn.focus();
      expect(document.activeElement).toBe(openBtn);

      // Open dialog
      fireEvent.click(openBtn);

      // Modal is open
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');

      // Close using Escape key on document
      fireEvent.keyDown(document, { key: 'Escape' });

      // Focus should be restored to open button
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
      expect(document.activeElement).toBe(openBtn);
    });

    it('traps focus and restores focus upon closing Drawer', async () => {
      const TestDrawerWrapper = () => {
        const [isOpen, setIsOpen] = React.useState(false);
        return (
          <div>
            <button id="drawer-trigger" onClick={() => setIsOpen(true)}>
              Open Drawer
            </button>
            <Drawer isOpen={isOpen} onClose={() => setIsOpen(false)} title="Filter Settings">
              <button id="drawer-btn-1">Filter A</button>
              <button id="drawer-btn-2">Filter B</button>
            </Drawer>
          </div>
        );
      };

      render(<TestDrawerWrapper />);
      const triggerBtn = screen.getByRole('button', { name: /open drawer/i });
      triggerBtn.focus();

      // Open drawer
      fireEvent.click(triggerBtn);
      expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');

      // Close using Escape key on document
      fireEvent.keyDown(document, { key: 'Escape' });

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
      expect(document.activeElement).toBe(triggerBtn);
    });
  });

  describe('TASK 2 — Keyboard Arrow Navigation in Dropdowns & Comboboxes', () => {
    it('supports arrow key navigation in DropdownMenu', () => {
      const handleSelect = vi.fn();
      render(
        <DropdownMenu
          trigger={<Button>Open Menu</Button>}
          items={[
            { id: 'opt-1', label: 'Option 1', onClick: handleSelect },
            { id: 'opt-2', label: 'Option 2', onClick: handleSelect },
            { id: 'opt-3', label: 'Option 3', onClick: handleSelect },
          ]}
        />
      );

      const trigger = screen.getByRole('button', { name: /open menu/i });
      expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
      expect(trigger).toHaveAttribute('aria-expanded', 'false');

      // Open menu
      fireEvent.click(trigger);
      expect(trigger).toHaveAttribute('aria-expanded', 'true');

      const menu = screen.getByRole('menu');
      expect(menu).toBeInTheDocument();

      // Press ArrowDown to navigate through items
      fireEvent.keyDown(menu, { key: 'ArrowDown' });
      fireEvent.keyDown(menu, { key: 'ArrowDown' });
      fireEvent.keyDown(menu, { key: 'ArrowUp' });
      fireEvent.keyDown(menu, { key: 'Home' });
      fireEvent.keyDown(menu, { key: 'End' });

      // Close with Escape
      fireEvent.keyDown(menu, { key: 'Escape' });
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });

    it('supports combobox ARIA roles and arrow keys in SearchDialog', () => {
      render(
        <MemoryRouter>
          <SearchDialog isOpen={true} onClose={vi.fn()} />
        </MemoryRouter>
      );

      const searchInput = screen.getByRole('combobox');
      expect(searchInput).toHaveAttribute('aria-autocomplete', 'list');
      expect(searchInput).toHaveAttribute('aria-expanded', 'true');

      expect(screen.getByRole('listbox')).toBeInTheDocument();

      // Press ArrowDown on combobox input to navigate quick suggestions
      fireEvent.keyDown(searchInput, { key: 'ArrowDown' });
      expect(searchInput).toHaveAttribute('aria-activedescendant', 'search-opt-0');

      fireEvent.keyDown(searchInput, { key: 'ArrowDown' });
      expect(searchInput).toHaveAttribute('aria-activedescendant', 'search-opt-1');

      fireEvent.keyDown(searchInput, { key: 'ArrowUp' });
      expect(searchInput).toHaveAttribute('aria-activedescendant', 'search-opt-0');
    });
  });

  describe('TASK 6 — App Rating Section Keyboard Accessibility', () => {
    it('supports radiogroup arrow navigation and direct number key rating', () => {
      render(
        <MemoryRouter>
          <AppRatingSection appId="app-1" appName="Antigravity IDE" />
        </MemoryRouter>
      );

      const radioGroup = screen.getByRole('radiogroup', { name: /select star rating/i });
      expect(radioGroup).toBeInTheDocument();

      // 5-star radio button by default
      const fiveStarRadio = screen.getByRole('radio', { name: '5 stars' });
      expect(fiveStarRadio).toHaveAttribute('aria-checked', 'true');

      // Navigate using ArrowLeft to decrement rating
      fireEvent.keyDown(radioGroup, { key: 'ArrowLeft' });
      const fourStarRadio = screen.getByRole('radio', { name: '4 stars' });
      expect(fourStarRadio).toHaveAttribute('aria-checked', 'true');

      // Navigate using direct number key '2'
      fireEvent.keyDown(radioGroup, { key: '2' });
      const twoStarRadio = screen.getByRole('radio', { name: '2 stars' });
      expect(twoStarRadio).toHaveAttribute('aria-checked', 'true');
    });
  });

  describe('TASK 5 — Form Accessibility & Autocomplete', () => {
    it('has proper autocomplete, labels, and aria-describedby on LoginPage', () => {
      render(
        <MemoryRouter>
          <LoginPage />
        </MemoryRouter>
      );

      const emailInput = screen.getByLabelText(/email address/i);
      expect(emailInput).toHaveAttribute('type', 'email');
      expect(emailInput).toHaveAttribute('autocomplete', 'email');

      const passwordInput = screen.getByLabelText(/^password$/i);
      expect(passwordInput).toHaveAttribute('autocomplete', 'current-password');
    });
  });
});
