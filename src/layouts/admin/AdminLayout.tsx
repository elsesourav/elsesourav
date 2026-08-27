import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { X } from 'lucide-react';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';
import { SEO } from '@/components';
import './AdminLayout.css';

export interface AdminLayoutProps {
  readonly children?: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileMenuOpen]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  return (
    <div className="admin-layout">
      <SEO title="Admin Control Center" noIndex />
      {/* Desktop Persistent Sidebar */}
      <div className="admin-layout__desktop-sidebar">
        <AdminSidebar />
      </div>

      {/* Mobile Drawer Backdrop & Sheet */}
      {isMobileMenuOpen && (
        <>
          <div
            className="admin-layout__mobile-backdrop"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div
            className="admin-layout__mobile-drawer admin-layout__mobile-drawer--open"
            role="dialog"
            aria-modal="true"
            aria-label="Admin Navigation Menu"
          >
            <button
              type="button"
              className="admin-layout__drawer-close"
              onClick={() => setIsMobileMenuOpen(false)}
              aria-label="Close admin menu"
            >
              <X size={20} aria-hidden="true" />
            </button>
            <AdminSidebar onCloseMobile={() => setIsMobileMenuOpen(false)} />
          </div>
        </>
      )}

      {/* Main Content Area */}
      <div className="admin-layout__main">
        <AdminHeader
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          isMobileOpen={isMobileMenuOpen}
        />
        <main className="admin-layout__content" id="admin-main-content">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
};
