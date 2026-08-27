import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  User,
  Compass,
  Layers,
  Wrench,
  Globe,
  Puzzle,
  MessageSquareHeart,
} from 'lucide-react';
import { Button, Badge, Skeleton, ErrorState } from '@/components';
import { AppCard } from '@/components/apps';
import { LatestUpdateCard } from '@/components/home';
import { useFeaturedApps, useLatestApps } from '@/hooks/useApps';
import { ROUTES } from '@/constants/routes';
import './HomePage.css';

export const HomePage: React.FC = () => {
  const {
    apps: featuredApps,
    isLoading: isFeaturedLoading,
    error: featuredError,
    refetch: refetchFeatured,
  } = useFeaturedApps(3);

  const {
    apps: latestApps,
    isLoading: isLatestLoading,
    error: latestError,
    refetch: refetchLatest,
  } = useLatestApps(4);

  // Dynamic SEO & Structured Data
  useEffect(() => {
    document.title = 'ElseSourav - Serious Software, Built by Someone Who Cares';

    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute(
        'content',
        'Discover high-performance web applications, developer utilities, browser extensions, and open software built independently with care by Sourav.'
      );
    }

    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'ElseSourav',
      url: 'https://elsesourav.com',
      description: 'Serious software, built by someone who cares.',
      author: {
        '@type': 'Person',
        name: 'Sourav',
        url: 'https://elsesourav.com/about',
      },
    };

    let scriptTag = document.getElementById('json-ld-website') as HTMLScriptElement | null;
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = 'json-ld-website';
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }
    scriptTag.textContent = JSON.stringify(jsonLd);

    return () => {
      const tag = document.getElementById('json-ld-website');
      if (tag) tag.remove();
    };
  }, []);

  return (
    <main className="home-page">
      {/* =========================================================================
          1. Hero Section
          ========================================================================= */}
      <section className="home-hero" aria-labelledby="hero-heading">
        <div className="home-hero__backdrop" aria-hidden="true" />
        <div className="home-hero__content">
          <div className="home-hero__badge-wrapper">
            <Badge variant="accent" size="md" icon={<Sparkles size={14} />}>
              Independent Software Studio
            </Badge>
          </div>

          <h1 id="hero-heading" className="home-hero__title">
            Serious software,{' '}
            <span className="home-hero__title-highlight">built by someone who cares.</span>
          </h1>

          <p className="home-hero__description">
            Explore web applications, developer tools, browser extensions, and experiments designed
            with speed, utility, and refined craftsmanship. Built and maintained independently by
            Sourav.
          </p>

          <div className="home-hero__actions">
            <Link to={ROUTES.APPS} aria-label="Explore all applications">
              <Button variant="primary" size="lg" rightIcon={<ArrowRight size={18} />}>
                Explore Apps
              </Button>
            </Link>

            <Link to={ROUTES.ABOUT} aria-label="Learn more about the creator">
              <Button variant="secondary" size="lg" leftIcon={<User size={18} />}>
                Meet the Creator
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================================
          2. Featured Applications Section
          ========================================================================= */}
      <section className="home-section" aria-labelledby="featured-heading">
        <header className="home-section__header">
          <div className="home-section__title-group">
            <h2 id="featured-heading" className="home-section__title">
              Featured Applications
            </h2>
            <p className="home-section__subtitle">
              Hand-crafted software ready for daily workflow and production use.
            </p>
          </div>

          <Link to={ROUTES.APPS} className="home-section__link">
            <span>View all apps</span>
            <ArrowRight size={16} />
          </Link>
        </header>

        {isFeaturedLoading && (
          <div className="home-apps-grid" data-testid="home-featured-skeleton">
            <Skeleton variant="rounded" height={260} />
            <Skeleton variant="rounded" height={260} />
            <Skeleton variant="rounded" height={260} />
          </div>
        )}

        {featuredError && !isFeaturedLoading && (
          <ErrorState
            title="Featured Apps Unavailable"
            description="Could not load featured applications at this time."
            action={
              <Button variant="secondary" size="sm" onClick={() => void refetchFeatured()}>
                Retry
              </Button>
            }
          />
        )}

        {!isFeaturedLoading && !featuredError && featuredApps.length > 0 && (
          <div className="home-apps-grid">
            {featuredApps.map((app) => (
              <AppCard key={app.id} app={app} variant="featured" />
            ))}
          </div>
        )}
      </section>

      {/* =========================================================================
          3. Latest Updates Section
          ========================================================================= */}
      <section className="home-section" aria-labelledby="updates-heading">
        <header className="home-section__header">
          <div className="home-section__title-group">
            <h2 id="updates-heading" className="home-section__title">
              Latest Releases & Updates
            </h2>
            <p className="home-section__subtitle">
              Recent releases, improvements, and new tools across the catalog.
            </p>
          </div>

          <Link to={ROUTES.APPS} className="home-section__link">
            <span>All updates</span>
            <ArrowRight size={16} />
          </Link>
        </header>

        {isLatestLoading && (
          <div className="home-updates-grid" data-testid="home-updates-skeleton">
            <Skeleton variant="rounded" height={90} />
            <Skeleton variant="rounded" height={90} />
            <Skeleton variant="rounded" height={90} />
            <Skeleton variant="rounded" height={90} />
          </div>
        )}

        {latestError && !isLatestLoading && (
          <ErrorState
            title="Latest Updates Unavailable"
            description="Could not load latest application updates at this time."
            action={
              <Button variant="secondary" size="sm" onClick={() => void refetchLatest()}>
                Retry
              </Button>
            }
          />
        )}

        {!isLatestLoading && !latestError && latestApps.length > 0 && (
          <div className="home-updates-grid">
            {latestApps.map((app) => (
              <LatestUpdateCard
                key={app.id}
                item={{
                  appId: app.id,
                  appName: app.name,
                  appSlug: app.slug,
                  iconUrl: app.iconUrl,
                  version: undefined,
                  title: app.shortDescription,
                  summary: app.shortDescription,
                  updatedAt: app.updatedAt || app.publishedAt || app.createdAt,
                }}
              />
            ))}
          </div>
        )}
      </section>

      {/* =========================================================================
          4. Software Categories Preview
          ========================================================================= */}
      <section className="home-section" aria-labelledby="categories-heading">
        <header className="home-section__header">
          <div className="home-section__title-group">
            <h2 id="categories-heading" className="home-section__title">
              Browse by Category
            </h2>
            <p className="home-section__subtitle">
              Explore purpose-built tools across various software categories.
            </p>
          </div>

          <Link to={ROUTES.CATEGORIES} className="home-section__link">
            <span>All categories</span>
            <ArrowRight size={16} />
          </Link>
        </header>

        <div className="home-categories-grid">
          <Link to={`${ROUTES.APPS}?category=developer-tools`} className="home-category-card">
            <div className="home-category-card__icon">
              <Wrench size={22} />
            </div>
            <div className="home-category-card__info">
              <span className="home-category-card__name">Developer Tools</span>
              <span className="home-category-card__desc">IDEs, CLI utilities, debuggers</span>
            </div>
          </Link>

          <Link to={`${ROUTES.APPS}?category=utilities`} className="home-category-card">
            <div className="home-category-card__icon">
              <Layers size={22} />
            </div>
            <div className="home-category-card__info">
              <span className="home-category-card__name">Productivity & Utilities</span>
              <span className="home-category-card__desc">Calculators, helpers, workflows</span>
            </div>
          </Link>

          <Link to={`${ROUTES.APPS}?category=web-apps`} className="home-category-card">
            <div className="home-category-card__icon">
              <Globe size={22} />
            </div>
            <div className="home-category-card__info">
              <span className="home-category-card__name">Web Applications</span>
              <span className="home-category-card__desc">Browser-first cloud platforms</span>
            </div>
          </Link>

          <Link to={`${ROUTES.APPS}?category=extensions`} className="home-category-card">
            <div className="home-category-card__icon">
              <Puzzle size={22} />
            </div>
            <div className="home-category-card__info">
              <span className="home-category-card__name">Browser Extensions</span>
              <span className="home-category-card__desc">Chrome & Edge enhancements</span>
            </div>
          </Link>
        </div>
      </section>

      {/* =========================================================================
          5. Creator Introduction (20-30% Personal Layer)
          ========================================================================= */}
      <section className="home-section" aria-labelledby="creator-heading">
        <div className="home-creator-card">
          <div className="home-creator-card__avatar" aria-hidden="true">
            S
          </div>

          <div className="home-creator-card__info">
            <h2 id="creator-heading" className="home-creator-card__title">
              Crafted with Care by Sourav
            </h2>
            <p className="home-creator-card__bio">
              ElseSourav is an independent digital laboratory. Every application here is built
              without bloated dependencies, intrusive tracking, or artificial paywalls — focusing on
              speed, clean design, and long-term utility.
            </p>

            <div className="home-creator-card__footer">
              <Link to={ROUTES.ABOUT}>
                <Button variant="secondary" size="sm" rightIcon={<Compass size={16} />}>
                  Read the Creator Story
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          6. Community Feedback & Support Banner
          ========================================================================= */}
      <section className="home-support-banner" aria-label="Support and Feedback">
        <div className="home-support-banner__content">
          <h2 className="home-support-banner__title">Have an idea or need support?</h2>
          <p className="home-support-banner__desc">
            Your feedback directly shapes new features, bug fixes, and future tools.
          </p>
        </div>

        <div className="home-support-banner__action">
          <Link to={ROUTES.SUPPORT}>
            <Button variant="secondary" size="md" leftIcon={<MessageSquareHeart size={16} />}>
              Get Support & Feedback
            </Button>
          </Link>
        </div>
      </section>
    </main>
  );
};
