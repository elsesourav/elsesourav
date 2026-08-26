import React from 'react';
import { Sparkles, Search, User, ShieldCheck, Sun, Moon } from 'lucide-react';
import { appConfig } from '@/config';
import { PRIMARY_NAVIGATION } from '@/constants/navigation';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useTheme } from '@/hooks/useTheme';
import './Header.css';

export interface HeaderProps {
  readonly currentPath?: string;
  readonly onNavigate?: (path: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentPath = '/', onNavigate }) => {
  const { resolvedTheme, toggleTheme } = useTheme();

  return (
    <header className="global-header glass-panel">
      <div className="global-header__left">
        <a
          href="/"
          className="global-header__brand"
          onClick={(e) => {
            if (onNavigate) {
              e.preventDefault();
              onNavigate('/');
            }
          }}
        >
          <div className="global-header__brand-icon">
            <Sparkles size={18} />
          </div>
          <span className="global-header__brand-name">{appConfig.name}</span>
        </a>
        <Badge variant="mono" size="sm">
          v{appConfig.version}
        </Badge>
      </div>

      <nav className="global-header__nav" aria-label="Main Navigation">
        {PRIMARY_NAVIGATION.map((item) => {
          const isActive = currentPath === item.path;
          return (
            <a
              key={item.path}
              href={item.path}
              className={`global-header__nav-link ${isActive ? 'is-active' : ''}`}
              onClick={(e) => {
                if (onNavigate) {
                  e.preventDefault();
                  onNavigate(item.path);
                }
              }}
            >
              {item.label}
            </a>
          );
        })}
      </nav>

      <div className="global-header__actions">
        <Button
          variant="ghost"
          size="sm"
          className="global-header__icon-btn"
          aria-label="Search software and apps"
          leftIcon={<Search size={16} />}
        />

        <Button
          variant="ghost"
          size="sm"
          className="global-header__icon-btn"
          aria-label={resolvedTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          onClick={toggleTheme}
          leftIcon={resolvedTheme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        />

        <div className="global-header__divider" />

        <Button
          variant="glass"
          size="sm"
          leftIcon={<User size={15} />}
          className="global-header__auth-btn"
        >
          Sign In
        </Button>

        <div className="global-header__status-indicator" title="TypeScript Strict Mode Active">
          <ShieldCheck size={16} className="status-icon" />
        </div>
      </div>
    </header>
  );
};
