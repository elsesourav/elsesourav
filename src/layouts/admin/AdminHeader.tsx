import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Menu,
  ExternalLink,
  Sun,
  Moon,
  Laptop,
  Settings,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import { Button, DropdownMenu } from '@/components/ui';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { ROUTES } from '@/constants/routes';

export interface AdminHeaderProps {
  readonly onOpenMobileMenu: () => void;
  readonly isMobileOpen: boolean;
}

const ROUTE_TITLES: Record<string, { title: string; breadcrumb: string }> = {
  [ROUTES.ADMIN.ROOT]: { title: 'Dashboard Overview', breadcrumb: 'Dashboard' },
  [ROUTES.ADMIN.APPS]: { title: 'Manage Applications', breadcrumb: 'Apps' },
  [ROUTES.ADMIN.APPS_NEW]: { title: 'Create Application', breadcrumb: 'Apps / New' },
  [ROUTES.ADMIN.CATEGORIES]: { title: 'Categories & Taxonomy', breadcrumb: 'Categories' },
  [ROUTES.ADMIN.TAGS]: { title: 'Tag Management', breadcrumb: 'Tags' },
  [ROUTES.ADMIN.BLOG]: { title: 'Blog Articles', breadcrumb: 'Blog' },
  [ROUTES.ADMIN.BLOG_NEW]: { title: 'Write Article', breadcrumb: 'Blog / New' },
  [ROUTES.ADMIN.HELP]: { title: 'Help Center Management', breadcrumb: 'Help' },
  [ROUTES.ADMIN.SUPPORT]: { title: 'Support Desk', breadcrumb: 'Support' },
  [ROUTES.ADMIN.ANALYTICS]: { title: 'Platform Analytics', breadcrumb: 'Analytics' },
  [ROUTES.ADMIN.THEME]: { title: 'Theme & Design Config', breadcrumb: 'Theme' },
  [ROUTES.ADMIN.AUDIT_LOGS]: { title: 'Security Audit Logs', breadcrumb: 'Audit Logs' },
};

export const AdminHeader: React.FC<AdminHeaderProps> = ({ onOpenMobileMenu, isMobileOpen }) => {
  const location = useLocation();
  const { user, authUser, signOut } = useAuth();
  const { themeMode, setThemeMode } = useTheme();

  const currentRouteMeta = ROUTE_TITLES[location.pathname] || {
    title: 'Admin Portal',
    breadcrumb: location.pathname.replace('/admin/', '').replace('-', ' '),
  };

  const displayName = user?.displayName || authUser?.displayName || 'Admin';

  const initials =
    displayName
      .split(' ')
      .filter(Boolean)
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'AD';

  const themeOptions = [
    {
      id: 'light',
      label: 'Light Mode',
      icon: <Sun size={15} aria-hidden="true" />,
      onClick: () => setThemeMode('light'),
      isActive: themeMode === 'light',
    },
    {
      id: 'dark',
      label: 'Dark Mode',
      icon: <Moon size={15} aria-hidden="true" />,
      onClick: () => setThemeMode('dark'),
      isActive: themeMode === 'dark',
    },
    {
      id: 'system',
      label: 'System Default',
      icon: <Laptop size={15} aria-hidden="true" />,
      onClick: () => setThemeMode('system'),
      isActive: themeMode === 'system',
    },
  ];

  const accountMenuItems = [
    {
      id: 'view-site',
      label: 'View Public Site',
      icon: <ExternalLink size={15} aria-hidden="true" />,
      onClick: () => {
        window.location.href = ROUTES.HOME;
      },
    },
    {
      id: 'account-settings',
      label: 'Account Settings',
      icon: <Settings size={15} aria-hidden="true" />,
      onClick: () => {
        window.location.href = ROUTES.SETTINGS;
      },
    },
    {
      id: 'divider-1',
      label: '',
      isDivider: true,
      onClick: () => {},
    },
    {
      id: 'sign-out',
      label: 'Sign Out',
      icon: <LogOut size={15} aria-hidden="true" />,
      danger: true,
      onClick: () => {
        void signOut();
      },
    },
  ];

  return (
    <header className="admin-header glass-panel" aria-label="Admin Header">
      <div className="admin-header__left">
        {/* Mobile Hamburger Button */}
        <button
          type="button"
          className="admin-header__mobile-toggle"
          onClick={onOpenMobileMenu}
          aria-label={isMobileOpen ? 'Close admin navigation menu' : 'Open admin navigation menu'}
          aria-expanded={isMobileOpen}
        >
          <Menu size={20} aria-hidden="true" />
        </button>

        {/* Breadcrumb / Title Area */}
        <div className="admin-header__breadcrumbs" aria-label="Breadcrumb navigation">
          <Link to={ROUTES.ADMIN.ROOT} className="admin-header__breadcrumb-root">
            Admin
          </Link>
          <ChevronRight
            size={14}
            className="admin-header__breadcrumb-separator"
            aria-hidden="true"
          />
          <span className="admin-header__breadcrumb-current" aria-current="page">
            {currentRouteMeta.breadcrumb}
          </span>
        </div>
      </div>

      <div className="admin-header__actions">
        {/* View Public Site Quick Link */}
        <Link
          to={ROUTES.HOME}
          className="admin-header__view-site-link"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="View public site in new tab"
        >
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<ExternalLink size={14} aria-hidden="true" />}
          >
            View Site
          </Button>
        </Link>

        {/* Theme Switcher */}
        <DropdownMenu
          trigger={
            <Button
              variant="ghost"
              size="sm"
              aria-label={`Current theme: ${themeMode}. Click to change.`}
              className="admin-header__icon-btn"
              leftIcon={
                themeMode === 'light' ? (
                  <Sun size={16} aria-hidden="true" />
                ) : themeMode === 'dark' ? (
                  <Moon size={16} aria-hidden="true" />
                ) : (
                  <Laptop size={16} aria-hidden="true" />
                )
              }
            />
          }
          items={themeOptions}
          align="end"
        />

        {/* In-App Notifications */}
        <NotificationCenter />

        {/* Admin Account Menu */}
        <DropdownMenu
          trigger={
            <button
              type="button"
              className="admin-header__account-btn"
              aria-label={`Admin profile menu for ${displayName}`}
            >
              <div className="admin-header__avatar" aria-hidden="true">
                {initials}
              </div>
            </button>
          }
          items={accountMenuItems}
          align="end"
        />
      </div>
    </header>
  );
};
