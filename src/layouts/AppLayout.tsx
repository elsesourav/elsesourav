import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import './AppLayout.css';

export interface AppLayoutProps {
  readonly children?: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <div className="app-shell">
      <Header />
      <main className="app-shell__content">{children || <Outlet />}</main>
      <Footer />
    </div>
  );
};
