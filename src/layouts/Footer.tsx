import React from 'react';
import { appConfig } from '@/config';
import './Footer.css';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="global-footer">
      <div className="global-footer__inner">
        <div className="global-footer__info">
          <span className="global-footer__brand">{appConfig.name}</span>
          <span className="global-footer__tagline">{appConfig.tagline}</span>
        </div>

        <div className="global-footer__meta">
          <span className="global-footer__copyright">
            &copy; {currentYear} {appConfig.name}. All rights reserved.
          </span>
        </div>
      </div>
    </footer>
  );
};
