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

export const LibraryPage: React.FC = () => (
  <PlaceholderPage
    title="My Software Library"
    description="Your bookmarked, pinned, and favorited applications in one quick dashboard."
    badge="User Library"
  />
);

export const SettingsPage: React.FC = () => (
  <PlaceholderPage
    title="Account & Preferences"
    description="Manage your display theme, notification alerts, and profile details."
    badge="Settings"
  />
);

// =============================================================================
// ADMIN PROTECTED PAGES
// =============================================================================

export const AdminDashboardPage: React.FC = () => (
  <PlaceholderPage
    title="Admin Dashboard"
    description="Publisher portal for managing apps, categories, blog posts, support tickets, and system audit logs."
    badge="Admin Portal"
  />
);

export const AdminAppsPage: React.FC = () => (
  <PlaceholderPage
    title="Manage Applications"
    description="Create, publish, update, and manage app versions, links, and screenshots."
    badge="Admin - Apps"
  />
);

export const AdminCategoriesPage: React.FC = () => (
  <PlaceholderPage
    title="Manage Categories & Taxonomy"
    description="Reorder categories, update slugs, and configure software classification."
    badge="Admin - Categories"
  />
);

export { AdminBlogPage } from './admin/AdminBlogPage';
export { AdminBlogEditorPage } from './admin/AdminBlogEditorPage';

export const AdminHelpPage: React.FC = () => (
  <PlaceholderPage
    title="Manage Help Articles"
    description="Maintain knowledge base FAQs and troubleshooting guides."
    badge="Admin - Help"
  />
);

export { AdminSupportPage } from './admin/AdminSupportPage';

export const AdminAnalyticsPage: React.FC = () => (
  <PlaceholderPage
    title="Platform Analytics"
    description="Monitor app launch volume, library adds, page views, and visitor trends."
    badge="Admin - Analytics"
  />
);

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
