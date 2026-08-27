import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Search,
  User as UserIcon,
  Sun,
  Moon,
  Menu,
  X,
  Bookmark,
  LifeBuoy,
  Settings,
  ShieldAlert,
  LogOut,
  ChevronDown,
} from 'lucide-react';
import { appConfig } from '@/config';
import { PRIMARY_NAVIGATION } from '@/constants/navigation';
import { ROUTES } from '@/constants/routes';
import {
  Button,
  Badge,
  Avatar,
  DropdownMenu,
  type DropdownMenuItem,
  Drawer,
  Separator,
  Text,
} from '@/components';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';
import { SearchDialog } from '@/components/search/SearchDialog';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import './Header.css';

export const Header: React.FC = () => {
  const { resolvedTheme, toggleTheme, themeMode, setThemeMode } = useTheme();
  const { authUser, user, isAuthenticated, isAdmin, isLoading, signOut } = useAuth();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate(ROUTES.HOME);
    setIsMobileMenuOpen(false);
  };

  const displayName =
    authUser?.displayName || user?.displayName || authUser?.email?.split('@')[0] || 'User';

  const themeMenuItems: readonly DropdownMenuItem[] = [
    {
      id: 'theme-light',
      label: 'Light Mode',
      icon: <Sun size={14} />,
      onClick: () => setThemeMode('light'),
    },
    {
      id: 'theme-dark',
      label: 'Dark Mode',
      icon: <Moon size={14} />,
      onClick: () => setThemeMode('dark'),
    },
    {
      id: 'theme-system',
      label: `System (${resolvedTheme})`,
      icon: <Sparkles size={14} />,
      onClick: () => setThemeMode('system'),
    },
  ];

  const userMenuItems: readonly (DropdownMenuItem | 'divider')[] = [
    {
      id: 'user-library',
      label: 'My Library',
      icon: <Bookmark size={14} />,
      onClick: () => navigate(ROUTES.LIBRARY),
    },
    {
      id: 'user-tickets',
      label: 'My Support Tickets',
      icon: <LifeBuoy size={14} />,
      onClick: () => navigate(ROUTES.SUPPORT_TICKETS),
    },
    {
      id: 'user-settings',
      label: 'Settings',
      icon: <Settings size={14} />,
      onClick: () => navigate(ROUTES.SETTINGS),
    },
    ...(isAdmin
      ? ([
          {
            id: 'user-admin',
            label: 'Admin Portal',
            icon: <ShieldAlert size={14} />,
            onClick: () => navigate(ROUTES.ADMIN.ROOT),
          },
        ] as const)
      : []),
    'divider',
    {
      id: 'user-signout',
      label: 'Sign Out',
      icon: <LogOut size={14} />,
      destructive: true,
      onClick: handleSignOut,
    },
  ];

  return (
    <>
      <header className="global-header glass-panel">
        <div className="global-header__left">
          <Link to={ROUTES.HOME} className="global-header__brand" aria-label="ElseSourav Home">
            <div className="global-header__brand-icon">
              <Sparkles size={18} />
            </div>
            <span className="global-header__brand-name">{appConfig.name}</span>
          </Link>
          <Badge variant="mono" size="sm">
            v{appConfig.version}
          </Badge>
        </div>

        {/* Desktop Navigation */}
        <nav className="global-header__nav" aria-label="Main Navigation">
          {PRIMARY_NAVIGATION.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `global-header__nav-link ${isActive ? 'is-active' : ''}`}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="global-header__actions">
          {/* Global Search Trigger */}
          <Button
            variant="ghost"
            size="sm"
            className="global-header__icon-btn"
            aria-label="Search apps, tools, and documentation"
            onClick={() => setIsSearchOpen(true)}
            leftIcon={<Search size={16} />}
          />

          {/* Theme Toggle Dropdown */}
          <DropdownMenu
            items={themeMenuItems}
            trigger={
              <Button
                variant="ghost"
                size="sm"
                className="global-header__icon-btn"
                aria-label={`Current theme: ${themeMode}. Click to change.`}
                leftIcon={resolvedTheme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
              />
            }
          />

          <div className="global-header__divider" />

          {/* Authentication & User Controls */}
          {isLoading ? (
            <div className="global-header__auth-loading" aria-label="Loading authentication..." />
          ) : isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <NotificationCenter />
              <DropdownMenu
                items={userMenuItems}
                trigger={
                  <button
                    type="button"
                    className="global-header__user-trigger"
                    aria-label="Open user account menu"
                  >
                    <Avatar name={displayName} src={authUser?.photoURL || undefined} size="sm" />
                    <span className="global-header__user-name">{displayName}</span>
                    <ChevronDown size={14} className="global-header__user-chevron" />
                  </button>
                }
              />
            </div>
          ) : (
            <Link to={ROUTES.LOGIN}>
              <Button
                variant="glass"
                size="sm"
                leftIcon={<UserIcon size={15} />}
                className="global-header__auth-btn"
              >
                Sign In
              </Button>
            </Link>
          )}

          {/* Mobile Menu Trigger */}
          <button
            type="button"
            className="global-header__mobile-toggle"
            aria-label={isMobileMenuOpen ? 'Close mobile menu' : 'Open mobile menu'}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      <Drawer
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        position="right"
        title="Navigation Menu"
      >
        <div className="mobile-drawer-content">
          <div className="mobile-drawer-search">
            <Button
              variant="secondary"
              size="sm"
              style={{ width: '100%', justifyContent: 'flex-start' }}
              leftIcon={<Search size={16} />}
              onClick={() => {
                setIsMobileMenuOpen(false);
                setIsSearchOpen(true);
              }}
            >
              Search software...
            </Button>
          </div>

          <Separator style={{ margin: 'var(--space-4) 0' }} />

          <nav className="mobile-drawer-nav" aria-label="Mobile Navigation">
            {PRIMARY_NAVIGATION.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `mobile-drawer-link ${isActive ? 'is-active' : ''}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <Separator style={{ margin: 'var(--space-4) 0' }} />

          {/* Mobile Auth Actions */}
          <div className="mobile-drawer-auth">
            {isAuthenticated ? (
              <div className="mobile-drawer-user">
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <Avatar name={displayName} src={authUser?.photoURL || undefined} size="md" />
                  <div>
                    <Text size="sm" weight="semibold">
                      {displayName}
                    </Text>
                    <Text size="xs" variant="muted">
                      {authUser?.email}
                    </Text>
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--space-2)',
                    marginTop: 'var(--space-4)',
                  }}
                >
                  <Link to={ROUTES.LIBRARY} onClick={() => setIsMobileMenuOpen(false)}>
                    <Button
                      variant="secondary"
                      size="sm"
                      style={{ width: '100%', justifyContent: 'flex-start' }}
                      leftIcon={<Bookmark size={15} />}
                    >
                      My Library
                    </Button>
                  </Link>
                  <Link to={ROUTES.SUPPORT_TICKETS} onClick={() => setIsMobileMenuOpen(false)}>
                    <Button
                      variant="secondary"
                      size="sm"
                      style={{ width: '100%', justifyContent: 'flex-start' }}
                      leftIcon={<LifeBuoy size={15} />}
                    >
                      My Support Tickets
                    </Button>
                  </Link>
                  <Link to={ROUTES.SETTINGS} onClick={() => setIsMobileMenuOpen(false)}>
                    <Button
                      variant="secondary"
                      size="sm"
                      style={{ width: '100%', justifyContent: 'flex-start' }}
                      leftIcon={<Settings size={15} />}
                    >
                      Settings
                    </Button>
                  </Link>
                  {isAdmin && (
                    <Link to={ROUTES.ADMIN.ROOT} onClick={() => setIsMobileMenuOpen(false)}>
                      <Button
                        variant="secondary"
                        size="sm"
                        style={{ width: '100%', justifyContent: 'flex-start' }}
                        leftIcon={<ShieldAlert size={15} />}
                      >
                        Admin Portal
                      </Button>
                    </Link>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    style={{
                      width: '100%',
                      justifyContent: 'flex-start',
                      color: 'var(--color-error)',
                    }}
                    leftIcon={<LogOut size={15} />}
                    onClick={handleSignOut}
                  >
                    Sign Out
                  </Button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                <Link to={ROUTES.LOGIN} onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="primary" size="sm" style={{ width: '100%' }}>
                    Sign In
                  </Button>
                </Link>
                <Link to={ROUTES.SIGNUP} onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="secondary" size="sm" style={{ width: '100%' }}>
                    Create Account
                  </Button>
                </Link>
              </div>
            )}
          </div>

          <Separator style={{ margin: 'var(--space-4) 0' }} />

          {/* Mobile Theme Toggle */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text size="sm" variant="muted">
              Appearance
            </Text>
            <Button
              variant="secondary"
              size="sm"
              leftIcon={resolvedTheme === 'dark' ? <Moon size={15} /> : <Sun size={15} />}
              onClick={toggleTheme}
            >
              {resolvedTheme === 'dark' ? 'Dark' : 'Light'}
            </Button>
          </div>
        </div>
      </Drawer>

      {/* Global Search Dialog Modal */}
      <SearchDialog isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
};
