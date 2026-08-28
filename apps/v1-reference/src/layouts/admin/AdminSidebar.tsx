import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Tag,
  FileText,
  HelpCircle,
  LifeBuoy,
  TrendingUp,
  Palette,
  ShieldCheck,
  Sparkles,
  LogOut,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';

export interface AdminSidebarProps {
  readonly onCloseMobile?: () => void;
}

interface NavSection {
  readonly title: string;
  readonly items: readonly {
    readonly label: string;
    readonly path: string;
    readonly icon: React.ReactNode;
    readonly end?: boolean;
  }[];
}

const NAV_SECTIONS: readonly NavSection[] = [
  {
    title: 'Overview',
    items: [
      {
        label: 'Dashboard',
        path: ROUTES.ADMIN.ROOT,
        icon: <LayoutDashboard size={18} aria-hidden="true" />,
        end: true,
      },
    ],
  },
  {
    title: 'Content',
    items: [
      {
        label: 'Apps',
        path: ROUTES.ADMIN.APPS,
        icon: <Package size={18} aria-hidden="true" />,
      },
      {
        label: 'Categories',
        path: ROUTES.ADMIN.CATEGORIES,
        icon: <FolderTree size={18} aria-hidden="true" />,
      },
      {
        label: 'Tags',
        path: ROUTES.ADMIN.TAGS,
        icon: <Tag size={18} aria-hidden="true" />,
      },
      {
        label: 'Blog',
        path: ROUTES.ADMIN.BLOG,
        icon: <FileText size={18} aria-hidden="true" />,
      },
      {
        label: 'Help Center',
        path: ROUTES.ADMIN.HELP,
        icon: <HelpCircle size={18} aria-hidden="true" />,
      },
    ],
  },
  {
    title: 'Operations',
    items: [
      {
        label: 'Support',
        path: ROUTES.ADMIN.SUPPORT,
        icon: <LifeBuoy size={18} aria-hidden="true" />,
      },
      {
        label: 'Analytics',
        path: ROUTES.ADMIN.ANALYTICS,
        icon: <TrendingUp size={18} aria-hidden="true" />,
      },
    ],
  },
  {
    title: 'System',
    items: [
      {
        label: 'Theme',
        path: ROUTES.ADMIN.THEME,
        icon: <Palette size={18} aria-hidden="true" />,
      },
      {
        label: 'Audit Logs',
        path: ROUTES.ADMIN.AUDIT_LOGS,
        icon: <ShieldCheck size={18} aria-hidden="true" />,
      },
    ],
  },
];

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ onCloseMobile }) => {
  const { user, authUser, signOut } = useAuth();

  const displayName = user?.displayName || authUser?.displayName || 'Admin Publisher';
  const email = user?.email || authUser?.email || 'admin@elsesourav.com';

  const initials =
    displayName
      .split(' ')
      .filter(Boolean)
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'AD';

  return (
    <aside className="admin-sidebar" aria-label="Admin Navigation">
      {/* Brand Header */}
      <div className="admin-sidebar__header">
        <Link
          to={ROUTES.ADMIN.ROOT}
          className="admin-sidebar__brand"
          onClick={onCloseMobile}
          aria-label="ElseSourav Admin Dashboard Home"
        >
          <div className="admin-sidebar__brand-icon">
            <Sparkles size={18} aria-hidden="true" />
          </div>
          <div className="admin-sidebar__brand-text">
            <span className="admin-sidebar__brand-title">ElseSourav</span>
            <span className="admin-sidebar__brand-badge">Admin</span>
          </div>
        </Link>
      </div>

      {/* Navigation Sections */}
      <nav className="admin-sidebar__nav" aria-label="Admin Navigation Sections">
        {NAV_SECTIONS.map((section) => (
          <div key={section.title} className="admin-sidebar__section">
            <h2 className="admin-sidebar__section-title">{section.title}</h2>
            <ul className="admin-sidebar__list">
              {section.items.map((item) => (
                <li key={item.path} className="admin-sidebar__item">
                  <NavLink
                    to={item.path}
                    end={item.end}
                    className={({ isActive }) =>
                      `admin-sidebar__link ${isActive ? 'admin-sidebar__link--active' : ''}`
                    }
                    onClick={onCloseMobile}
                  >
                    <span className="admin-sidebar__link-icon">{item.icon}</span>
                    <span className="admin-sidebar__link-label">{item.label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer Profile & Sign Out */}
      <div className="admin-sidebar__footer">
        <div className="admin-sidebar__user-card">
          <div className="admin-sidebar__avatar" aria-hidden="true">
            {initials}
          </div>
          <div className="admin-sidebar__user-details">
            <span className="admin-sidebar__user-name">{displayName}</span>
            <span className="admin-sidebar__user-email">{email}</span>
          </div>
        </div>

        <div className="admin-sidebar__actions">
          <Link
            to={ROUTES.HOME}
            className="admin-sidebar__quick-action"
            title="View Public Site"
            aria-label="View Public Website"
            onClick={onCloseMobile}
          >
            <ExternalLink size={16} aria-hidden="true" />
            <span>Public Site</span>
          </Link>
          <button
            type="button"
            className="admin-sidebar__quick-action admin-sidebar__quick-action--danger"
            onClick={() => {
              onCloseMobile?.();
              void signOut();
            }}
            title="Sign Out"
            aria-label="Sign out of admin session"
          >
            <LogOut size={16} aria-hidden="true" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
