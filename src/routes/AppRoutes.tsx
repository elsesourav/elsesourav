import React, { Suspense, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { AppLayout, AdminLayout } from '@/layouts';
import { ProtectedRoute } from '@/components/routes/ProtectedRoute';
import { AdminRoute } from '@/components/routes/AdminRoute';
import { LoadingFallback } from '@/components/feedback/LoadingFallback';
import { ROUTES } from '@/constants/routes';
import { nativeBridge } from '@/services/native-bridge.service';

// =============================================================================
// PRIMARY DISCOVERY PAGES (Eagerly loaded for sub-millisecond initial paint)
// =============================================================================
import { HomePage } from '@/pages/HomePage';
import { SearchPage } from '@/pages/SearchPage';
import { AppsPage } from '@/pages/AppsPage';
import { AppDetailPage } from '@/pages/AppDetailPage';
import {
  CategoriesPage,
  CategoryDetailPage,
  PrivacyPage,
  TermsPage,
  CookiesPage,
  AccessibilityPage,
  SitemapPage,
  NotFoundPage,
} from '@/pages';

// =============================================================================
// PUBLIC & SECONDARY PAGES (Lazy-loaded on demand)
// =============================================================================
const BlogPage = React.lazy(() =>
  import('@/pages/BlogPage').then((m) => ({ default: m.BlogPage }))
);
const BlogPostPage = React.lazy(() =>
  import('@/pages/BlogPostPage').then((m) => ({ default: m.BlogPostPage }))
);
const AboutPage = React.lazy(() =>
  import('@/pages/AboutPage').then((m) => ({ default: m.AboutPage }))
);
const SupportPage = React.lazy(() =>
  import('@/pages/SupportPage').then((m) => ({ default: m.SupportPage }))
);
const HelpPage = React.lazy(() =>
  import('@/pages/HelpPage').then((m) => ({ default: m.HelpPage }))
);
const HelpCategoryPage = React.lazy(() =>
  import('@/pages/HelpCategoryPage').then((m) => ({ default: m.HelpCategoryPage }))
);
const HelpArticlePage = React.lazy(() =>
  import('@/pages/HelpArticlePage').then((m) => ({ default: m.HelpArticlePage }))
);
const LoginPage = React.lazy(() =>
  import('@/pages/LoginPage').then((m) => ({ default: m.LoginPage }))
);
const SignUpPage = React.lazy(() =>
  import('@/pages/SignUpPage').then((m) => ({ default: m.SignUpPage }))
);
const ForgotPasswordPage = React.lazy(() =>
  import('@/pages/ForgotPasswordPage').then((m) => ({ default: m.ForgotPasswordPage }))
);

// =============================================================================
// AUTHENTICATED USER PAGES (Lazy-loaded on demand)
// =============================================================================
const LibraryPage = React.lazy(() =>
  import('@/pages/LibraryPage').then((m) => ({ default: m.LibraryPage }))
);
const SettingsPage = React.lazy(() =>
  import('@/pages/SettingsPage').then((m) => ({ default: m.SettingsPage }))
);
const SupportTicketsPage = React.lazy(() =>
  import('@/pages/SupportTicketsPage').then((m) => ({ default: m.SupportTicketsPage }))
);
const SupportTicketDetailPage = React.lazy(() =>
  import('@/pages/SupportTicketDetailPage').then((m) => ({ default: m.SupportTicketDetailPage }))
);

// =============================================================================
// ADMIN PORTAL PAGES (100% Isolated from Public Bundle)
// =============================================================================
const AdminDashboardPage = React.lazy(() =>
  import('@/pages/admin/AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage }))
);
const AdminAppsPage = React.lazy(() =>
  import('@/pages/admin/AdminAppsPage').then((m) => ({ default: m.AdminAppsPage }))
);
const AdminAppEditorPage = React.lazy(() =>
  import('@/pages/admin/AdminAppEditorPage').then((m) => ({ default: m.AdminAppEditorPage }))
);
const AdminCategoriesPage = React.lazy(() =>
  import('@/pages/admin/AdminCategoriesPage').then((m) => ({ default: m.AdminCategoriesPage }))
);
const AdminTagsPage = React.lazy(() =>
  import('@/pages/admin/AdminTagsPage').then((m) => ({ default: m.AdminTagsPage }))
);
const AdminBlogPage = React.lazy(() =>
  import('@/pages/admin/AdminBlogPage').then((m) => ({ default: m.AdminBlogPage }))
);
const AdminBlogEditorPage = React.lazy(() =>
  import('@/pages/admin/AdminBlogEditorPage').then((m) => ({ default: m.AdminBlogEditorPage }))
);
const AdminHelpPage = React.lazy(() =>
  import('@/pages/admin/AdminHelpPage').then((m) => ({ default: m.AdminHelpPage }))
);
const AdminHelpEditorPage = React.lazy(() =>
  import('@/pages/admin/AdminHelpEditorPage').then((m) => ({ default: m.AdminHelpEditorPage }))
);
const AdminSupportPage = React.lazy(() =>
  import('@/pages/admin/AdminSupportPage').then((m) => ({ default: m.AdminSupportPage }))
);
const AdminAnalyticsPage = React.lazy(() =>
  import('@/pages/admin/AdminAnalyticsPage').then((m) => ({ default: m.AdminAnalyticsPage }))
);
const AdminThemePage = React.lazy(() =>
  import('@/pages/admin/AdminThemePage').then((m) => ({ default: m.AdminThemePage }))
);
const AdminAuditLogsPage = React.lazy(() =>
  import('@/pages/admin/AdminAuditLogsPage').then((m) => ({ default: m.AdminAuditLogsPage }))
);

export const AppRoutes: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const cleanup = nativeBridge.initDeepLinkListener((path) => {
      navigate(path);
    });
    return cleanup;
  }, [navigate]);

  return (
    <Suspense fallback={<LoadingFallback message="Loading content..." />}>
      <Routes>
        {/* Public & Authenticated User Routes (Standard AppLayout) */}
        <Route element={<AppLayout />}>
          {/* Public Routes */}
          <Route path={ROUTES.HOME} element={<HomePage />} />
          <Route path={ROUTES.SEARCH} element={<SearchPage />} />
          <Route path={ROUTES.APPS} element={<AppsPage />} />
          <Route path={ROUTES.APP_DETAIL} element={<AppDetailPage />} />
          <Route path={ROUTES.CATEGORIES} element={<CategoriesPage />} />
          <Route path={ROUTES.CATEGORY_DETAIL} element={<CategoryDetailPage />} />
          <Route path={ROUTES.BLOG} element={<BlogPage />} />
          <Route path={ROUTES.BLOG_POST} element={<BlogPostPage />} />
          <Route path={ROUTES.ABOUT} element={<AboutPage />} />
          <Route path={ROUTES.SUPPORT} element={<SupportPage />} />
          <Route path={ROUTES.HELP} element={<HelpPage />} />
          <Route path={ROUTES.HELP_CATEGORY} element={<HelpCategoryPage />} />
          <Route path={ROUTES.HELP_ARTICLE} element={<HelpArticlePage />} />
          <Route path={ROUTES.LOGIN} element={<LoginPage />} />
          <Route path={ROUTES.SIGNUP} element={<SignUpPage />} />
          <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
          <Route path={ROUTES.PRIVACY} element={<PrivacyPage />} />
          <Route path={ROUTES.TERMS} element={<TermsPage />} />
          <Route path={ROUTES.COOKIES} element={<CookiesPage />} />
          <Route path={ROUTES.ACCESSIBILITY} element={<AccessibilityPage />} />
          <Route path={ROUTES.SITEMAP} element={<SitemapPage />} />

          {/* Authenticated User Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path={ROUTES.LIBRARY} element={<LibraryPage />} />
            <Route path={ROUTES.SETTINGS} element={<SettingsPage />} />
            <Route path={ROUTES.SETTINGS_PROFILE} element={<SettingsPage defaultTab="profile" />} />
            <Route
              path={ROUTES.SETTINGS_PREFERENCES}
              element={<SettingsPage defaultTab="preferences" />}
            />
            <Route path={ROUTES.SETTINGS_SECURITY} element={<SettingsPage defaultTab="security" />} />
            <Route path={ROUTES.SUPPORT_TICKETS} element={<SupportTicketsPage />} />
            <Route path={ROUTES.SUPPORT_TICKET_DETAIL} element={<SupportTicketDetailPage />} />
          </Route>
        </Route>

        {/* Admin Portal Routes (Dedicated AdminLayout & Authorization Guard) */}
        <Route element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route path={ROUTES.ADMIN.ROOT} element={<AdminDashboardPage />} />
            <Route path={ROUTES.ADMIN.APPS} element={<AdminAppsPage />} />
            <Route path={ROUTES.ADMIN.APPS_NEW} element={<AdminAppEditorPage />} />
            <Route path={ROUTES.ADMIN.APPS_EDIT} element={<AdminAppEditorPage />} />
            <Route path={ROUTES.ADMIN.CATEGORIES} element={<AdminCategoriesPage />} />
            <Route path={ROUTES.ADMIN.TAGS} element={<AdminTagsPage />} />
            <Route path={ROUTES.ADMIN.BLOG} element={<AdminBlogPage />} />
            <Route path={ROUTES.ADMIN.BLOG_NEW} element={<AdminBlogEditorPage />} />
            <Route path={ROUTES.ADMIN.BLOG_EDIT} element={<AdminBlogEditorPage />} />
            <Route path={ROUTES.ADMIN.HELP} element={<AdminHelpPage />} />
            <Route path={ROUTES.ADMIN.HELP_NEW} element={<AdminHelpEditorPage />} />
            <Route path={ROUTES.ADMIN.HELP_EDIT} element={<AdminHelpEditorPage />} />
            <Route path={ROUTES.ADMIN.SUPPORT} element={<AdminSupportPage />} />
            <Route path={ROUTES.ADMIN.ANALYTICS} element={<AdminAnalyticsPage />} />
            <Route path={ROUTES.ADMIN.THEME} element={<AdminThemePage />} />
            <Route path={ROUTES.ADMIN.AUDIT_LOGS} element={<AdminAuditLogsPage />} />
          </Route>
        </Route>

        {/* 404 Catch-All */}
        <Route element={<AppLayout />}>
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
};
