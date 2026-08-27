import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { PlaceholderPage } from './PlaceholderPage';
import { ErrorState, Button } from '@/components';
import { FileQuestion, Home } from 'lucide-react';
import { ROUTES } from '@/constants/routes';

// =============================================================================
// PUBLIC PAGES
// =============================================================================

export { HomePage } from './HomePage';
export { AppsPage } from './AppsPage';
export { AppDetailPage } from './AppDetailPage';

export const CategoriesPage: React.FC = () => (
  <PlaceholderPage
    title="Software Categories"
    description="Browse apps categorized by platform, utilities, developer tools, games, and web extensions."
    badge="Categories"
  />
);

export const CategoryDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  return (
    <PlaceholderPage
      title={`Category: ${slug || 'Browse'}`}
      description={`Software and tools published under the "${slug}" category.`}
      badge="Category View"
    />
  );
};

export { BlogPage } from './BlogPage';
export { BlogPostPage } from './BlogPostPage';

export { AboutPage } from './AboutPage';
export { SupportPage } from './SupportPage';
export { SupportTicketsPage } from './SupportTicketsPage';
export { SupportTicketDetailPage } from './SupportTicketDetailPage';

export { HelpPage } from './HelpPage';
export { HelpCategoryPage } from './HelpCategoryPage';
export { HelpArticlePage } from './HelpArticlePage';

export { LoginPage } from './LoginPage';
export { SignUpPage } from './SignUpPage';
export { ForgotPasswordPage } from './ForgotPasswordPage';

export const PrivacyPage: React.FC = () => (
  <PlaceholderPage
    title="Privacy Policy"
    description="How your data and privacy are respected and protected on the ElseSourav platform."
    badge="Legal"
  />
);

export const TermsPage: React.FC = () => (
  <PlaceholderPage
    title="Terms of Service"
    description="Terms and conditions governing use of ElseSourav software and services."
    badge="Legal"
  />
);

export const SitemapPage: React.FC = () => (
  <PlaceholderPage
    title="Site Map"
    description="Complete index of all public applications, categories, articles, and support links."
    badge="Directory"
  />
);

// =============================================================================
// USER PROTECTED PAGES
// =============================================================================

export { LibraryPage } from './LibraryPage';
export { SettingsPage } from './SettingsPage';

// =============================================================================
// ADMIN PROTECTED PAGES
// =============================================================================

export { AdminDashboardPage } from './admin/AdminDashboardPage';
export { AdminAppsPage } from './admin/AdminAppsPage';
export { AdminAppEditorPage } from './admin/AdminAppEditorPage';

export { AdminCategoriesPage } from './admin/AdminCategoriesPage';
export { AdminTagsPage } from './admin/AdminTagsPage';

export { AdminBlogPage } from './admin/AdminBlogPage';
export { AdminBlogEditorPage } from './admin/AdminBlogEditorPage';

export { AdminHelpPage } from './admin/AdminHelpPage';
export { AdminHelpEditorPage } from './admin/AdminHelpEditorPage';

export { AdminSupportPage } from './admin/AdminSupportPage';

export { AdminAnalyticsPage } from './admin/AdminAnalyticsPage';

export const AdminThemePage: React.FC = () => (
  <PlaceholderPage
    title="Theme & Design Config"
    description="Configure active color palettes, typography tokens, and platform presets."
    badge="Admin - Themes"
  />
);

export const AdminAuditLogsPage: React.FC = () => (
  <PlaceholderPage
    title="Security Audit Trail"
    description="Inspect immutable admin publishing actions, record updates, and permission changes."
    badge="Admin - Audit Logs"
  />
);

// =============================================================================
// NOT FOUND (404)
// =============================================================================

export const NotFoundPage: React.FC = () => (
  <div
    style={{
      minHeight: '60vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'var(--space-6)',
    }}
  >
    <ErrorState
      icon={<FileQuestion size={36} />}
      title="Page Not Found (404)"
      description="The page you requested could not be found. It may have been moved, renamed, or is temporarily unavailable."
      action={
        <Link to={ROUTES.HOME}>
          <Button variant="primary" size="sm" leftIcon={<Home size={15} />}>
            Back to Home
          </Button>
        </Link>
      }
    />
  </div>
);
