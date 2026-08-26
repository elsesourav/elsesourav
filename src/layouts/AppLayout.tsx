import React from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import './AppLayout.css';

export interface AppLayoutProps {
  readonly children: React.ReactNode;
  readonly currentPath?: string;
  readonly onNavigate?: (path: string) => void;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children, currentPath, onNavigate }) => {
  return (
    <div className="app-shell">
      <Header currentPath={currentPath} onNavigate={onNavigate} />
      <main className="app-shell__content">{children}</main>
      <Footer />
    </div>
  );
};
