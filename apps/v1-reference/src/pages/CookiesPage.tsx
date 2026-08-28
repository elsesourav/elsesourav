import React from 'react';
import { Link } from 'react-router-dom';
import { Database, Mail, ArrowRight } from 'lucide-react';
import { SEO, Badge, Button } from '@/components';
import { ROUTES } from '@/constants/routes';
import './LegalPage.css';

export const CookiesPage: React.FC = () => {
  return (
    <main className="legal-page">
      <SEO
        title="Cookie & Storage Notice"
        description="Understand how ElseSourav uses localStorage and client browser storage for preferences and security."
        canonicalPath={ROUTES.COOKIES}
      />

      <header className="legal-header">
        <div className="legal-header__badge-row">
          <Badge variant="accent" size="md" icon={<Database size={14} />}>
            Client Storage Notice
          </Badge>
        </div>

        <h1 className="legal-header__title">Cookie &amp; Storage Notice</h1>
        <p className="legal-header__subtitle">
          This notice explains what client-side browser storage and cookies are used on ElseSourav
          and why they are necessary for platform operation.
        </p>

        <div className="legal-header__meta">
          <span>Effective Date: January 1, 2026</span>
          <span>•</span>
          <span>Last Updated: August 2026</span>
        </div>
      </header>

      <div className="legal-content">
        {/* 1. Overview */}
        <section className="legal-section">
          <h2 className="legal-section__title">1. What Storage Mechanisms Do We Use?</h2>
          <p>
            ElseSourav primarily uses modern HTML5 <strong>localStorage</strong> and{' '}
            <strong>IndexedDB</strong> rather than traditional tracking cookies. These technologies
            store configuration data directly on your device to ensure quick page loads and smooth
            interaction.
          </p>
        </section>

        {/* 2. Itemized Breakdown */}
        <section className="legal-section">
          <h2 className="legal-section__title">2. Itemized Storage Keys &amp; Purposes</h2>
          <p>The following client storage items are utilized on ElseSourav:</p>

          <div className="legal-grid">
            <div className="legal-card">
              <h3 className="legal-card__title">theme</h3>
              <p className="legal-card__desc">
                <strong>Storage:</strong> <code>localStorage</code>
                <br />
                <strong>Purpose:</strong> Stores your preference between Dark Mode and Light Mode so
                your selected theme persists when you navigate or reload.
                <br />
                <strong>Duration:</strong> Persistent until cleared.
              </p>
            </div>

            <div className="legal-card">
              <h3 className="legal-card__title">recent_searches</h3>
              <p className="legal-card__desc">
                <strong>Storage:</strong> <code>localStorage</code>
                <br />
                <strong>Purpose:</strong> Caches your last five search queries locally to provide
                fast search history suggestions.
                <br />
                <strong>Duration:</strong> Persistent until cleared.
              </p>
            </div>

            <div className="legal-card">
              <h3 className="legal-card__title">Firebase Auth Token</h3>
              <p className="legal-card__desc">
                <strong>Storage:</strong> <code>IndexedDB</code>
                <br />
                <strong>Purpose:</strong> Managed by Firebase Authentication to keep you signed in
                securely between visits without re-prompting for credentials.
                <br />
                <strong>Duration:</strong> Valid until sign-out or token expiry.
              </p>
            </div>

            <div className="legal-card">
              <h3 className="legal-card__title">client_session_id</h3>
              <p className="legal-card__desc">
                <strong>Storage:</strong> <code>sessionStorage</code>
                <br />
                <strong>Purpose:</strong> Ephemeral session identifier used solely to prevent
                duplicate feedback and helpfulness votes on documentation articles.
                <br />
                <strong>Duration:</strong> Cleared when the browser tab is closed.
              </p>
            </div>
          </div>
        </section>

        {/* 3. No Advertising Cookies */}
        <section className="legal-section">
          <h2 className="legal-section__title">3. No Advertising or Cross-Site Tracking</h2>
          <div className="legal-callout legal-callout--accent">
            <p>
              <strong>Privacy Invariant:</strong> ElseSourav does <em>not</em> use third-party
              advertising cookies, cross-site tracking pixels, or behavioral profiling tools. All
              storage is strictly functional and limited to operating the website and remembering
              your preferences.
            </p>
          </div>
        </section>

        {/* 4. Managing Storage */}
        <section className="legal-section">
          <h2 className="legal-section__title">4. How to Clear Browser Storage</h2>
          <p>
            You can clear locally stored data at any time via your browser settings:
          </p>
          <ul>
            <li>
              <strong>Google Chrome / Brave:</strong> Settings → Privacy and Security → Clear
              Browsing Data → Cookies and other site data.
            </li>
            <li>
              <strong>Mozilla Firefox:</strong> Settings → Privacy &amp; Security → Cookies and
              Site Data → Clear Data.
            </li>
            <li>
              <strong>Apple Safari:</strong> Settings → Privacy → Manage Website Data → Remove All.
            </li>
          </ul>
        </section>

        {/* 5. Contact Box */}
        <div className="legal-footer-contact">
          <h3 className="legal-footer-contact__title">Questions About Storage?</h3>
          <p className="legal-footer-contact__desc">
            For questions about browser storage, account data, or privacy practices, please contact
            us through the support portal.
          </p>
          <div className="legal-footer-contact__actions">
            <Link to={ROUTES.SUPPORT}>
              <Button variant="primary" size="md" leftIcon={<Mail size={16} />}>
                Contact Support
              </Button>
            </Link>
            <Link to={ROUTES.PRIVACY}>
              <Button variant="secondary" size="md" rightIcon={<ArrowRight size={14} />}>
                Privacy Policy
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
};
