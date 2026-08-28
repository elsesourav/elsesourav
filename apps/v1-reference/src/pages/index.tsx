import React from 'react';
import { useParams } from 'react-router-dom';
import { PlaceholderPage } from './PlaceholderPage';
import { SEO } from '@/components';


// =============================================================================
// PUBLIC PAGES
// =============================================================================

export { HomePage } from './HomePage';
export { SearchPage } from './SearchPage';
export { AppsPage } from './AppsPage';
export { AppDetailPage } from './AppDetailPage';

export const CategoriesPage: React.FC = () => (
  <>
    <SEO
      title="Software Categories"
      description="Browse apps categorized by platform, utilities, developer tools, games, and web extensions."
      canonicalPath="/categories"
    />
    <PlaceholderPage
      title="Software Categories"
      description="Browse apps categorized by platform, utilities, developer tools, games, and web extensions."
      badge="Categories"
    />
  </>
);

export const CategoryDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  return (
    <>
      <SEO
        title={`Category: ${slug || 'Browse'}`}
        description={`Software and tools published under the "${slug}" category.`}
        canonicalPath={slug ? `/categories/${slug}` : '/categories'}
      />
      <PlaceholderPage
        title={`Category: ${slug || 'Browse'}`}
        description={`Software and tools published under the "${slug}" category.`}
        badge="Category View"
      />
    </>
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

export { PrivacyPage } from './PrivacyPage';
export { TermsPage } from './TermsPage';
export { CookiesPage } from './CookiesPage';
export { AccessibilityPage } from './AccessibilityPage';

export const SitemapPage: React.FC = () => (
  <>
    <SEO
      title="Site Map & Directory"
      description="Complete index of all public applications, categories, articles, and support links."
      canonicalPath="/sitemap"
    />
    <PlaceholderPage
      title="Site Map"
      description="Complete index of all public applications, categories, articles, and support links."
      badge="Directory"
    />
  </>
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

export { AdminThemePage } from './admin/AdminThemePage';
export { AdminAuditLogsPage } from './admin/AdminAuditLogsPage';
export { NotFoundPage } from './NotFoundPage';

