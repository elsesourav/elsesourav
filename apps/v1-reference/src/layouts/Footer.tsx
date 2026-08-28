import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Globe, Code2, Share2, ShieldCheck } from 'lucide-react';
import { appConfig } from '@/config';
import { FOOTER_NAVIGATION, SOCIAL_LINKS } from '@/constants/navigation';
import { ROUTES } from '@/constants/routes';
import { Text, Badge } from '@/components';
import './Footer.css';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const getSocialIcon = (iconName: string) => {
    switch (iconName) {
      case 'github':
        return <Code2 size={16} />;
      case 'twitter':
        return <Share2 size={16} />;
      case 'linkedin':
        return <Globe size={16} />;
      default:
        return <Globe size={16} />;
    }
  };

  return (
    <footer className="global-footer">
      <div className="global-footer__inner">
        {/* Brand & Socials Column */}
        <div className="global-footer__brand-col">
          <Link to={ROUTES.HOME} className="global-footer__brand-link">
            <div className="global-footer__brand-icon">
              <Sparkles size={16} />
            </div>
            <span className="global-footer__brand-name">{appConfig.name}</span>
          </Link>

          <Text variant="muted" size="sm" className="global-footer__tagline">
            {appConfig.tagline}
          </Text>

          <div className="global-footer__socials">
            {SOCIAL_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="global-footer__social-btn"
                aria-label={`Visit ElseSourav on ${link.label}`}
              >
                {getSocialIcon(link.icon)}
              </a>
            ))}
          </div>
        </div>

        {/* Navigation Columns */}
        <div className="global-footer__nav-grid">
          {FOOTER_NAVIGATION.map((group) => (
            <div key={group.title} className="global-footer__nav-col">
              <span className="global-footer__col-title">{group.title}</span>
              <ul className="global-footer__links">
                {group.items.map((item) => (
                  <li key={item.path}>
                    {item.isExternal ? (
                      <a
                        href={item.path}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="global-footer__link"
                      >
                        {item.label}
                      </a>
                    ) : (
                      <Link to={item.path} className="global-footer__link">
                        {item.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="global-footer__bottom">
        <div className="global-footer__bottom-inner">
          <Text variant="muted" size="xs">
            &copy; {currentYear} {appConfig.name}. Designed & built by Sourav. All rights reserved.
          </Text>

          <div className="global-footer__meta-badges">
            <div className="global-footer__status-badge" title="Platform online">
              <span className="global-footer__status-dot" />
              <span>Production Live</span>
            </div>
            <Badge variant="mono" size="sm">
              <ShieldCheck size={12} style={{ marginRight: '4px' }} /> Strict Type Safety
            </Badge>
          </div>
        </div>
      </div>
    </footer>
  );
};
