import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { RouteErrorBoundary } from '@/components/feedback/RouteErrorBoundary';
import { PWAStatusBanner } from '@/components/feedback/PWAStatusBanner';
import './AppLayout.css';

export interface AppLayoutProps {
  readonly children?: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <div className="app-shell">
      <PWAStatusBanner />
      <Header />
      <main className="app-shell__content">
        <RouteErrorBoundary>{children || <Outlet />}</RouteErrorBoundary>
      </main>
      <Footer />
    </div>
  );
};
