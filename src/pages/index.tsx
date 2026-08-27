import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { PlaceholderPage } from './PlaceholderPage';
import { ErrorState, Button } from '@/components';
import { FileQuestion, Home } from 'lucide-react';
import { ROUTES } from '@/constants/routes';

// =============================================================================
// PUBLIC PAGES
// =============================================================================

export const HomePage: React.FC = () => (
  <PlaceholderPage
    title="ElseSourav Developer & App Platform"
    description="Discover high-quality web applications, Chrome extensions, Android apps, developer utilities, games, and open-source software built by Sourav."
    badge="Home"
  />
);

export { AppsPage } from './AppsPage';

export const AppDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  return (
    <PlaceholderPage
      title={`App: ${slug || 'Detail'}`}
      description={`Overview, platform downloads, media screenshots, and release notes for "${slug}".`}
      badge="App Detail"
    />
  );
};

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

export const BlogPage: React.FC = () => (
  <PlaceholderPage
    title="Blog & Devlogs"
    description="Engineering insights, architecture deep-dives, feature announcements, and product release updates."
    badge="Articles"
  />
);

export const BlogPostPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  return (
    <PlaceholderPage
      title={`Article: ${slug || 'Read'}`}
      description={`Technical article and release notes for "${slug}".`}
      badge="Blog Post"
    />
  );
};

export const AboutPage: React.FC = () => (
  <PlaceholderPage
    title="About ElseSourav"
    description="Learn more about Sourav, the philosophy behind the platform, and the technologies powering these apps."
    badge="About"
  />
);

export const SupportPage: React.FC = () => (
  <PlaceholderPage
    title="Support & Contact"
    description="Get in touch for bug reports, feature suggestions, or custom software inquiries."
    badge="Support Hub"
  />
);

export const HelpPage: React.FC = () => (
  <PlaceholderPage
    title="Help Center & FAQs"
    description="Frequently asked questions, installation guides, documentation, and troubleshooting resources."
    badge="Help Center"
  />
);

export const LoginPage: React.FC = () => (
  <PlaceholderPage
    title="Sign In to Your Account"
    description="Access your personal app library, submit reviews, and manage your account preferences."
    badge="Authentication"
  />
);

export const SignUpPage: React.FC = () => (
  <PlaceholderPage
    title="Create an Account"
    description="Join the ElseSourav platform to pin favorite apps, receive updates, and submit feedback."
    badge="Sign Up"
  />
);

export const ForgotPasswordPage: React.FC = () => (
  <PlaceholderPage
    title="Reset Your Password"
    description="Enter your account email address to receive password reset instructions."
    badge="Recovery"
  />
);

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

export const AdminBlogPage: React.FC = () => (
  <PlaceholderPage
    title="Manage Blog Articles"
    description="Write and publish devlogs, tutorials, and release announcement posts."
    badge="Admin - Blog"
  />
);

export const AdminHelpPage: React.FC = () => (
  <PlaceholderPage
    title="Manage Help Articles"
    description="Maintain knowledge base FAQs and troubleshooting guides."
    badge="Admin - Help"
  />
);

export const AdminSupportPage: React.FC = () => (
  <PlaceholderPage
    title="Manage Support Tickets"
    description="Review incoming bug reports, respond to inquiries, and resolve tickets."
    badge="Admin - Support"
  />
);

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
