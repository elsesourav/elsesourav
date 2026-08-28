import React from 'react';
import { Link } from 'react-router-dom';
import {
  Mail,
  Zap,
  Shield,
  Palette,
  Globe,
  Puzzle,
  Wrench,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  MessageSquareHeart,
} from 'lucide-react';
import { Badge, Button, Skeleton, ErrorState, SEO } from '@/components';
import { AppCard } from '@/components/apps';
import { useFeaturedApps } from '@/hooks';
import { creatorConfig, type SocialLink, type BuildCategory } from '@/config/creator.config';
import { ROUTES } from '@/constants/routes';
import './AboutPage.css';

const GithubIcon: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const TwitterIcon: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
    <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
  </svg>
);

const LinkedinIcon: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

export const AboutPage: React.FC = () => {
  const {
    apps: selectedApps,
    isLoading: isAppsLoading,
    error: appsError,
    refetch: refetchApps,
  } = useFeaturedApps(3);

  const renderSocialIcon = (platform: SocialLink['platform']) => {
    switch (platform) {
      case 'github':
        return <GithubIcon size={16} />;
      case 'twitter':
        return <TwitterIcon size={16} />;
      case 'linkedin':
        return <LinkedinIcon size={16} />;
      case 'email':
        return <Mail size={16} />;
      default:
        return <Globe size={16} />;
    }
  };

  const renderBuildIcon = (iconName: BuildCategory['iconName']) => {
    switch (iconName) {
      case 'globe':
        return <Globe size={22} />;
      case 'puzzle':
        return <Puzzle size={22} />;
      case 'wrench':
        return <Wrench size={22} />;
      case 'sparkles':
        return <Sparkles size={22} />;
    }
  };

  return (
    <main className="about-page">
      <SEO
        title={`About ${creatorConfig.name} - Creator & Developer`}
        description={`Learn about ${creatorConfig.name}, the philosophy behind ElseSourav, the technologies used, and the mission to build fast, thoughtful software.`}
        canonicalPath="/about"
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'Person',
          name: creatorConfig.name,
          url: 'https://elsesourav.com/about',
          jobTitle: creatorConfig.role,
          sameAs: creatorConfig.socialLinks
            .filter((l) => l.platform !== 'email')
            .map((l) => l.url),
          description: creatorConfig.tagline,
        }}
      />
      {/* =========================================================================
          1. Hero & Profile Section
          ========================================================================= */}
      <section className="about-hero" aria-labelledby="creator-name-heading">
        <div className="about-hero__backdrop" aria-hidden="true" />
        <div className="about-hero__content">
          <div className="about-hero__avatar" aria-hidden="true">
            {creatorConfig.initials}
          </div>

          <h1 id="creator-name-heading" className="about-hero__title">
            {creatorConfig.name}
          </h1>

          <p className="about-hero__role">{creatorConfig.role}</p>

          <p className="about-hero__tagline">{creatorConfig.tagline}</p>

          <div className="about-hero__social-row" aria-label="Creator Social Profiles">
            {creatorConfig.socialLinks.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target={link.platform === 'email' ? '_self' : '_blank'}
                rel={link.platform === 'email' ? undefined : 'noopener noreferrer'}
                className="about-social-button"
                aria-label={`Connect on ${link.label}`}
              >
                {renderSocialIcon(link.platform)}
                <span>{link.label}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          2. About Narrative & Philosophy
          ========================================================================= */}
      <section className="about-section" aria-labelledby="philosophy-heading">
        <header className="about-section__header">
          <h2 id="philosophy-heading" className="about-section__title">
            Engineering Philosophy
          </h2>
          <p className="about-section__subtitle">
            Core principles guiding every tool, extension, and system built on ElseSourav.
          </p>
        </header>

        <div className="about-narrative">
          {creatorConfig.bioParagraphs.map((paragraph, idx) => (
            <p key={idx}>{paragraph}</p>
          ))}
        </div>

        <div className="about-philosophy-grid">
          <div className="about-pillar-card">
            <div className="about-pillar-card__icon" aria-hidden="true">
              <Zap size={20} />
            </div>
            <h3 className="about-pillar-card__title">{creatorConfig.philosophy[0]?.title}</h3>
            <p className="about-pillar-card__desc">{creatorConfig.philosophy[0]?.description}</p>
          </div>

          <div className="about-pillar-card">
            <div className="about-pillar-card__icon" aria-hidden="true">
              <Palette size={20} />
            </div>
            <h3 className="about-pillar-card__title">{creatorConfig.philosophy[1]?.title}</h3>
            <p className="about-pillar-card__desc">{creatorConfig.philosophy[1]?.description}</p>
          </div>

          <div className="about-pillar-card">
            <div className="about-pillar-card__icon" aria-hidden="true">
              <Shield size={20} />
            </div>
            <h3 className="about-pillar-card__title">{creatorConfig.philosophy[2]?.title}</h3>
            <p className="about-pillar-card__desc">{creatorConfig.philosophy[2]?.description}</p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. What I Build
          ========================================================================= */}
      <section className="about-section" aria-labelledby="what-i-build-heading">
        <header className="about-section__header">
          <h2 id="what-i-build-heading" className="about-section__title">
            What I Build
          </h2>
          <p className="about-section__subtitle">
            Software domains focused on speed, utility, and modern web capabilities.
          </p>
        </header>

        <div className="about-build-grid">
          {creatorConfig.whatIBuild.map((item) => (
            <div key={item.title} className="about-build-card">
              <div className="about-build-card__icon" aria-hidden="true">
                {renderBuildIcon(item.iconName)}
              </div>
              <div className="about-build-card__content">
                <h3 className="about-build-card__title">{item.title}</h3>
                <p className="about-build-card__desc">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          4. Curated Technologies
          ========================================================================= */}
      <section className="about-section" aria-labelledby="technologies-heading">
        <header className="about-section__header">
          <h2 id="technologies-heading" className="about-section__title">
            Technologies & Tools
          </h2>
          <p className="about-section__subtitle">
            A curated view of actual technologies powering ElseSourav applications.
          </p>
        </header>

        <div className="about-tech-grid">
          {creatorConfig.techStack.map((group) => (
            <div key={group.category} className="about-tech-group">
              <h3 className="about-tech-group__title">{group.category}</h3>
              <div className="about-tech-group__badges">
                {group.items.map((tech) => (
                  <Badge key={tech} variant="default" size="md">
                    {tech}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          5. Selected Work
          ========================================================================= */}
      <section className="about-section" aria-labelledby="selected-work-heading">
        <header className="about-section__header">
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <div>
              <h2 id="selected-work-heading" className="about-section__title">
                Selected Work
              </h2>
              <p className="about-section__subtitle">
                Live applications created, published, and maintained independently.
              </p>
            </div>
            <Link to={ROUTES.APPS} style={{ textDecoration: 'none' }}>
              <Button variant="secondary" size="sm" rightIcon={<ArrowRight size={14} />}>
                View All Apps
              </Button>
            </Link>
          </div>
        </header>

        {isAppsLoading && (
          <div className="about-philosophy-grid" data-testid="about-apps-skeleton">
            <Skeleton variant="rounded" height={260} />
            <Skeleton variant="rounded" height={260} />
            <Skeleton variant="rounded" height={260} />
          </div>
        )}

        {appsError && !isAppsLoading && (
          <ErrorState
            title="Selected Work Unavailable"
            description="Could not load featured applications at this time."
            action={
              <Button variant="secondary" size="sm" onClick={() => void refetchApps()}>
                Retry
              </Button>
            }
          />
        )}

        {!isAppsLoading && !appsError && selectedApps.length > 0 && (
          <div className="about-philosophy-grid">
            {selectedApps.map((app) => (
              <AppCard key={app.id} app={app} variant="featured" />
            ))}
          </div>
        )}
      </section>

      {/* =========================================================================
          6. Current Focus
          ========================================================================= */}
      <section className="about-section" aria-labelledby="focus-heading">
        <header className="about-section__header">
          <h2 id="focus-heading" className="about-section__title">
            Current Focus
          </h2>
          <p className="about-section__subtitle">
            What I am actively researching, building, and exploring today.
          </p>
        </header>

        <div className="about-focus-card">
          <ul className="about-focus-list">
            {creatorConfig.currentFocus.map((focus, idx) => (
              <li key={idx} className="about-focus-item">
                <CheckCircle2 size={18} className="about-focus-item__icon" />
                <span>{focus}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* =========================================================================
          7. Connect & Get in Touch
          ========================================================================= */}
      <section className="about-section" aria-labelledby="connect-heading">
        <div className="about-connect-card">
          <div className="about-connect-card__info">
            <h2 id="connect-heading" className="about-connect-card__title">
              Let’s build something meaningful.
            </h2>
            <p className="about-connect-card__desc">
              Whether you have a tool request, bug report, feedback, collaboration idea, or
              professional inquiry — I’d love to hear from you.
            </p>
          </div>

          <div className="about-connect-card__actions">
            <a href={`mailto:${creatorConfig.contactEmail}`} aria-label="Send email to creator">
              <Button variant="primary" size="lg" leftIcon={<Mail size={18} />}>
                Email Sourav
              </Button>
            </a>

            <Link to={ROUTES.SUPPORT} aria-label="Visit support and feedback center">
              <Button variant="secondary" size="lg" leftIcon={<MessageSquareHeart size={18} />}>
                Feedback & Support
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
};
