import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, LifeBuoy, ArrowRight } from 'lucide-react';
import { SEO, Badge, Button } from '@/components';
import { ROUTES } from '@/constants/routes';
import './LegalPage.css';

export const AccessibilityPage: React.FC = () => {
  return (
    <main className="legal-page">
      <SEO
        title="Accessibility Statement"
        description="Learn about our commitment to digital accessibility and WCAG 2.2 AA standards on ElseSourav."
        canonicalPath={ROUTES.ACCESSIBILITY}
      />

      <header className="legal-header">
        <div className="legal-header__badge-row">
          <Badge variant="accent" size="md" icon={<Eye size={14} />}>
            Accessibility Statement
          </Badge>
        </div>

        <h1 className="legal-header__title">Accessibility Statement</h1>
        <p className="legal-header__subtitle">
          ElseSourav is committed to making software tools and web documentation accessible to
          everyone, including individuals with disabilities.
        </p>

        <div className="legal-header__meta">
          <span>Effective Date: January 1, 2026</span>
          <span>•</span>
          <span>Last Updated: August 2026</span>
        </div>
      </header>

      <div className="legal-content">
        {/* 1. Commitment */}
        <section className="legal-section">
          <h2 className="legal-section__title">1. Our Commitment &amp; Standards</h2>
          <p>
            We strive to ensure that all web interfaces, navigation flows, and technical documentation
            conform to the <strong>Web Content Accessibility Guidelines (WCAG) 2.2 Level AA</strong>{' '}
            specifications. Our goal is to provide a seamless, dignified experience for all users
            regardless of technology or ability.
          </p>
        </section>

        {/* 2. Implementation Measures */}
        <section className="legal-section">
          <h2 className="legal-section__title">2. Accessibility Features on ElseSourav</h2>

          <div className="legal-grid">
            <div className="legal-card">
              <h3 className="legal-card__title">Semantic Structure &amp; Landmarks</h3>
              <p className="legal-card__desc">
                Pages use semantic HTML5 elements (<code>&lt;header&gt;</code>,{' '}
                <code>&lt;nav&gt;</code>, <code>&lt;main&gt;</code>, <code>&lt;article&gt;</code>,{' '}
                <code>&lt;footer&gt;</code>) with skip-to-content links.
              </p>
            </div>

            <div className="legal-card">
              <h3 className="legal-card__title">Full Keyboard Navigation</h3>
              <p className="legal-card__desc">
                All interactive elements (buttons, links, search inputs, dialogs, and drawer menus)
                are operable via keyboard with logical tab order and Escape key dismissal.
              </p>
            </div>

            <div className="legal-card">
              <h3 className="legal-card__title">High-Visibility Focus Indicators</h3>
              <p className="legal-card__desc">
                A standardized 2px high-contrast focus ring ensures focused elements are clearly
                visible across all light and dark background surfaces.
              </p>
            </div>

            <div className="legal-card">
              <h3 className="legal-card__title">Screen Reader Compatibility</h3>
              <p className="legal-card__desc">
                Descriptive <code>aria-label</code> attributes, form error announcements via{' '}
                <code>aria-describedby</code>, and status badges provide full auditory context.
              </p>
            </div>

            <div className="legal-card">
              <h3 className="legal-card__title">WCAG Color Contrast</h3>
              <p className="legal-card__desc">
                Typography in both Dark Mode and Light Mode satisfies or exceeds the WCAG AA 4.5:1
                contrast ratio for body text and 3:1 for large display headings.
              </p>
            </div>

            <div className="legal-card">
              <h3 className="legal-card__title">Reduced Motion Support</h3>
              <p className="legal-card__desc">
                All animations, spinners, and transitions automatically respect the user&apos;s{' '}
                <code>prefers-reduced-motion: reduce</code> system preference.
              </p>
            </div>
          </div>
        </section>

        {/* 3. Feedback & Remediation */}
        <section className="legal-section">
          <h2 className="legal-section__title">3. Reporting Accessibility Barriers</h2>
          <p>
            We view accessibility as an ongoing responsibility. If you encounter an accessibility
            barrier, experience difficulty navigating with assistive technology, or have
            suggestions for improvement, please let us know.
          </p>
        </section>

        {/* 4. Contact Box */}
        <div className="legal-footer-contact">
          <h3 className="legal-footer-contact__title">Need Accessibility Assistance?</h3>
          <p className="legal-footer-contact__desc">
            Submit an accessibility support request or contact us directly. We will review your
            feedback promptly and work to provide the information or fix you require.
          </p>
          <div className="legal-footer-contact__actions">
            <Link to={`${ROUTES.SUPPORT}?category=general_inquiry&subject=Accessibility%20Feedback`}>
              <Button variant="primary" size="md" leftIcon={<LifeBuoy size={16} />}>
                Submit Accessibility Feedback
              </Button>
            </Link>
            <Link to={ROUTES.HELP}>
              <Button variant="secondary" size="md" rightIcon={<ArrowRight size={14} />}>
                Help Center
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
};
