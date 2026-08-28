import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Mail, ExternalLink } from 'lucide-react';
import { SEO, Badge, Button } from '@/components';
import { ROUTES } from '@/constants/routes';
import './LegalPage.css';

export const PrivacyPage: React.FC = () => {
  return (
    <main className="legal-page">
      <SEO
        title="Privacy Policy"
        description="Learn how your data and privacy are respected and protected on the ElseSourav platform."
        canonicalPath={ROUTES.PRIVACY}
      />

      <header className="legal-header">
        <div className="legal-header__badge-row">
          <Badge variant="accent" size="md" icon={<Shield size={14} />}>
            Legal & Transparency
          </Badge>
        </div>

        <h1 className="legal-header__title">Privacy Policy</h1>
        <p className="legal-header__subtitle">
          ElseSourav is built with a commitment to privacy, data minimization, and transparency.
          This policy explains what information is collected, how it is used, and your controls.
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
          <h2 className="legal-section__title">1. Introduction & Overview</h2>
          <p>
            ElseSourav (&quot;we&quot;, &quot;our&quot;, or &quot;the platform&quot;) is an
            independent software platform and portfolio created and maintained by Sourav. We provide
            web applications, developer utilities, browser extensions, and technical articles.
          </p>
          <p>
            We believe in data minimization: we only collect information necessary to operate the
            platform, enable your saved application library, and provide developer support.
          </p>
        </section>

        {/* 2. Information Collected */}
        <section className="legal-section">
          <h2 className="legal-section__title">2. Information We Collect</h2>
          <p>Depending on how you interact with ElseSourav, we may process the following data:</p>

          <div className="legal-grid">
            <div className="legal-card">
              <h3 className="legal-card__title">Account Information</h3>
              <p className="legal-card__desc">
                When you create an account, we store your email address, display name, and avatar
                initials via Firebase Authentication.
              </p>
            </div>

            <div className="legal-card">
              <h3 className="legal-card__title">Library & Bookmarks</h3>
              <p className="legal-card__desc">
                When authenticated, your saved applications and personal preferences are stored in
                Cloud Firestore associated with your User ID.
              </p>
            </div>

            <div className="legal-card">
              <h3 className="legal-card__title">Support Tickets</h3>
              <p className="legal-card__desc">
                If you submit a support ticket or inquiry, we store your subject, message thread,
                and contact email to assist you.
              </p>
            </div>

            <div className="legal-card">
              <h3 className="legal-card__title">Aggregate Telemetry</h3>
              <p className="legal-card__desc">
                Anonymous page views and app launch events to understand catalog popularity without
                capturing personal identifiers or tracking across websites.
              </p>
            </div>
          </div>
        </section>

        {/* 3. Information We Do NOT Collect */}
        <section className="legal-section">
          <h2 className="legal-section__title">3. What We Do NOT Collect</h2>
          <div className="legal-callout legal-callout--accent">
            <ul>
              <li>
                <strong>No Data Selling:</strong> We never sell, rent, or monetize your personal
                information or browsing activity.
              </li>
              <li>
                <strong>No Payment or Card Data:</strong> The software catalog is free and open
                access; we do not collect credit cards or bank details.
              </li>
              <li>
                <strong>No Cross-Site Tracking:</strong> We do not deploy third-party advertising
                networks or cross-site tracking pixels.
              </li>
            </ul>
          </div>
        </section>

        {/* 4. Local Storage & Client State */}
        <section className="legal-section">
          <h2 className="legal-section__title">4. Browser Storage & Preferences</h2>
          <p>
            We use your browser&apos;s <code>localStorage</code> to store client-side preferences
            for faster loading and offline resilience:
          </p>
          <ul>
            <li>
              <strong>Theme Preference:</strong> Remembers your chosen UI mode (dark or light).
            </li>
            <li>
              <strong>Recent Search Queries:</strong> Stored locally on your device to provide
              instant search recommendations.
            </li>
            <li>
              <strong>Authentication Session:</strong> Firebase Web SDK stores authentication
              tokens in browser storage to keep you securely signed in across sessions.
            </li>
          </ul>
          <p>
            For more details, see our <Link to={ROUTES.COOKIES}>Cookie &amp; Storage Notice</Link>.
          </p>
        </section>

        {/* 5. Third-Party Infrastructure */}
        <section className="legal-section">
          <h2 className="legal-section__title">5. Third-Party Infrastructure</h2>
          <p>We rely on trusted cloud infrastructure providers to operate the platform:</p>
          <ul>
            <li>
              <strong>Google Firebase / Google Cloud:</strong> Provides user authentication,
              Firestore database hosting, and secure asset delivery under Google Cloud&apos;s
              security standards.
            </li>
            <li>
              <strong>External Application Links:</strong> Catalog entries linking to third-party
              destinations (e.g. GitHub, Chrome Web Store, Google Play) are governed by the
              respective external platform&apos;s terms and privacy policies.
            </li>
          </ul>
        </section>

        {/* 6. Data Retention & Account Deletion */}
        <section className="legal-section">
          <h2 className="legal-section__title">6. Data Retention &amp; User Controls</h2>
          <p>
            You have full control over your personal data on ElseSourav:
          </p>
          <ul>
            <li>
              <strong>Profile Updates:</strong> You can edit your display name and preferences at
              any time in <Link to={ROUTES.SETTINGS}>Settings</Link>.
            </li>
            <li>
              <strong>Self-Serve Account Deletion:</strong> You can permanently delete your account
              and associated library bookmarks in{' '}
              <Link to={ROUTES.SETTINGS_SECURITY}>Account Security Settings</Link>.
            </li>
            <li>
              <strong>Support Records:</strong> Closed support tickets are retained for technical
              reference and troubleshooting unless deletion is requested.
            </li>
          </ul>
        </section>

        {/* 7. Security */}
        <section className="legal-section">
          <h2 className="legal-section__title">7. Security Measures</h2>
          <p>
            We protect your data through server-enforced Firestore security rules, strict role-based
            access control, encrypted HTTPS transport, and input sanitization to prevent unauthorized
            access and cross-site scripting.
          </p>
        </section>

        {/* 8. Contact Box */}
        <div className="legal-footer-contact">
          <h3 className="legal-footer-contact__title">Questions About Your Privacy?</h3>
          <p className="legal-footer-contact__desc">
            If you have questions about this Privacy Policy, wish to request data deletion, or have
            feedback on platform transparency, reach out through our support portal.
          </p>
          <div className="legal-footer-contact__actions">
            <Link to={ROUTES.SUPPORT}>
              <Button variant="primary" size="md" leftIcon={<Mail size={16} />}>
                Contact Support
              </Button>
            </Link>
            <Link to={ROUTES.TERMS}>
              <Button variant="secondary" size="md" rightIcon={<ExternalLink size={14} />}>
                Terms of Service
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
};
