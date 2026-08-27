import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AppLayout } from '@/layouts';
import { ProtectedRoute } from '@/components/routes/ProtectedRoute';
import { AdminRoute } from '@/components/routes/AdminRoute';
import { ROUTES } from '@/constants/routes';
import {
  HomePage,
  AppsPage,
  AppDetailPage,
  CategoriesPage,
  CategoryDetailPage,
  BlogPage,
  BlogPostPage,
  AboutPage,
  SupportPage,
  HelpPage,
  LoginPage,
  SignUpPage,
  ForgotPasswordPage,
  PrivacyPage,
  TermsPage,
  SitemapPage,
  LibraryPage,
  SettingsPage,
  AdminDashboardPage,
  AdminAppsPage,
  AdminCategoriesPage,
  AdminBlogPage,
  AdminBlogEditorPage,
  AdminHelpPage,
  AdminSupportPage,
  AdminAnalyticsPage,
  AdminThemePage,
  AdminAuditLogsPage,
  NotFoundPage,
} from '@/pages';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        {/* Public Routes */}
        <Route path={ROUTES.HOME} element={<HomePage />} />
        <Route path={ROUTES.APPS} element={<AppsPage />} />
        <Route path={ROUTES.APP_DETAIL} element={<AppDetailPage />} />
        <Route path={ROUTES.CATEGORIES} element={<CategoriesPage />} />
        <Route path={ROUTES.CATEGORY_DETAIL} element={<CategoryDetailPage />} />
        <Route path={ROUTES.BLOG} element={<BlogPage />} />
        <Route path={ROUTES.BLOG_POST} element={<BlogPostPage />} />
        <Route path={ROUTES.ABOUT} element={<AboutPage />} />
        <Route path={ROUTES.SUPPORT} element={<SupportPage />} />
        <Route path={ROUTES.HELP} element={<HelpPage />} />
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />
        <Route path={ROUTES.SIGNUP} element={<SignUpPage />} />
        <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
        <Route path={ROUTES.PRIVACY} element={<PrivacyPage />} />
        <Route path={ROUTES.TERMS} element={<TermsPage />} />
        <Route path={ROUTES.SITEMAP} element={<SitemapPage />} />

        {/* Authenticated User Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path={ROUTES.LIBRARY} element={<LibraryPage />} />
          <Route path={ROUTES.SETTINGS} element={<SettingsPage />} />
        </Route>

        {/* Admin Portal Routes */}
        <Route element={<AdminRoute />}>
          <Route path={ROUTES.ADMIN.ROOT} element={<AdminDashboardPage />} />
          <Route path={ROUTES.ADMIN.APPS} element={<AdminAppsPage />} />
          <Route path={ROUTES.ADMIN.CATEGORIES} element={<AdminCategoriesPage />} />
          <Route path={ROUTES.ADMIN.BLOG} element={<AdminBlogPage />} />
          <Route path={ROUTES.ADMIN.BLOG_NEW} element={<AdminBlogEditorPage />} />
          <Route path={ROUTES.ADMIN.BLOG_EDIT} element={<AdminBlogEditorPage />} />
          <Route path={ROUTES.ADMIN.HELP} element={<AdminHelpPage />} />
          <Route path={ROUTES.ADMIN.SUPPORT} element={<AdminSupportPage />} />
          <Route path={ROUTES.ADMIN.ANALYTICS} element={<AdminAnalyticsPage />} />
          <Route path={ROUTES.ADMIN.THEME} element={<AdminThemePage />} />
          <Route path={ROUTES.ADMIN.AUDIT_LOGS} element={<AdminAuditLogsPage />} />
        </Route>

        {/* 404 Catch-All */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};
