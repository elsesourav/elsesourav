import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Mail, ArrowRight } from 'lucide-react';
import { SEO, Badge, Button } from '@/components';
import { ROUTES } from '@/constants/routes';
import './LegalPage.css';

export const TermsPage: React.FC = () => {
  return (
    <main className="legal-page">
      <SEO
        title="Terms of Service"
        description="Terms and conditions governing use of ElseSourav software, tools, and technical articles."
        canonicalPath={ROUTES.TERMS}
      />

      <header className="legal-header">
        <div className="legal-header__badge-row">
          <Badge variant="accent" size="md" icon={<FileText size={14} />}>
            Terms &amp; Guidelines
          </Badge>
        </div>

        <h1 className="legal-header__title">Terms of Service</h1>
        <p className="legal-header__subtitle">
          These Terms of Service govern your use of the ElseSourav website, software catalog,
          developer utilities, and related resources.
        </p>

        <div className="legal-header__meta">
          <span>Effective Date: January 1, 2026</span>
          <span>•</span>
          <span>Last Updated: August 2026</span>
        </div>
      </header>

      <div className="legal-content">
        {/* 1. Acceptance */}
        <section className="legal-section">
          <h2 className="legal-section__title">1. Acceptance of Terms</h2>
          <p>
            By accessing or using ElseSourav (&quot;the platform&quot;), you agree to be bound by
            these Terms of Service. If you do not agree to these terms, please do not use the
            platform or its published software.
          </p>
        </section>

        {/* 2. Platform Description */}
        <section className="legal-section">
          <h2 className="legal-section__title">2. Description of the Platform</h2>
          <p>
            ElseSourav is an independent developer platform created by Sourav that catalogs,
            showcases, and distributes web applications, developer utilities, browser extensions,
            and technical essays. All software catalog browsing and core functionality is provided
            free of charge.
          </p>
        </section>

        {/* 3. Intellectual Property */}
        <section className="legal-section">
          <h2 className="legal-section__title">3. Intellectual Property &amp; Open Source</h2>
          <p>
            The ElseSourav website, brand assets, graphics, and written editorial content are
            authored by Sourav and protected by copyright and intellectual property laws.
          </p>
          <p>
            Individual software applications showcased on the platform may be distributed under
            specific open-source software licenses (such as MIT, Apache 2.0, or GPL) or proprietary
            licenses as specified in each project&apos;s repository or documentation.
          </p>
        </section>

        {/* 4. External Links */}
        <section className="legal-section">
          <h2 className="legal-section__title">4. External Application &amp; Store Links</h2>
          <p>
            The catalog contains links to external platforms including GitHub, Google Chrome Web
            Store, and third-party developer resources. We are not responsible for the availability,
            security, or policies of external websites and stores.
          </p>
        </section>

        {/* 5. Acceptable Use */}
        <section className="legal-section">
          <h2 className="legal-section__title">5. Acceptable Use Policy</h2>
          <p>When using ElseSourav, you agree not to:</p>
          <ul>
            <li>
              Attempt to probe, scan, or exploit vulnerabilities in the platform infrastructure or
              Firestore database.
            </li>
            <li>
              Engage in automated scraping or denial-of-service attacks that degrade platform
              performance for other users.
            </li>
            <li>
              Submit fraudulent, abusive, or spam support tickets through the contact system.
            </li>
            <li>
              Impersonate platform administrators, authors, or other community users.
            </li>
          </ul>
        </section>

        {/* 6. Disclaimers */}
        <section className="legal-section">
          <h2 className="legal-section__title">6. Disclaimers &amp; Limitation of Liability</h2>
          <div className="legal-callout">
            <p>
              <strong>&quot;AS-IS&quot; DISCLAIMER:</strong> All software, tools, code snippets, and
              documentation are provided &quot;as is&quot; and &quot;as available&quot; without
              warranties of any kind, whether express or implied.
            </p>
          </div>
          <p>
            To the maximum extent permitted by applicable law, ElseSourav and its creator shall not
            be liable for any indirect, incidental, or consequential damages resulting from your use
            of or inability to use the platform or any software referenced herein.
          </p>
        </section>

        {/* 7. Modifications */}
        <section className="legal-section">
          <h2 className="legal-section__title">7. Modifications to Terms</h2>
          <p>
            We may revise these Terms of Service periodically. When revisions are made, the &quot;Last
            Updated&quot; date at the top of this document will be updated accordingly. Continued
            use of the platform constitutes acceptance of revised terms.
          </p>
        </section>

        {/* 8. Contact Box */}
        <div className="legal-footer-contact">
          <h3 className="legal-footer-contact__title">Questions or Inquiries?</h3>
          <p className="legal-footer-contact__desc">
            If you have questions regarding these Terms of Service or software licensing, please
            reach out through our support channel.
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
