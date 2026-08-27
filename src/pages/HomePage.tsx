import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, User, Compass, MessageSquareHeart } from 'lucide-react';
import { Button, Badge, Skeleton, ErrorState, SEO } from '@/components';
import { AppCard } from '@/components/apps';
import { LatestUpdateCard, CategoryCard } from '@/components/home';
import { BlogCard } from '@/components/blog';
import {
  useFeaturedApps,
  useTrendingApps,
  useLatestApps,
  useCategories,
  useLatestBlogPosts,
} from '@/hooks';
import { creatorConfig } from '@/config';
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
    apps: trendingApps,
    isLoading: isTrendingLoading,
    error: trendingError,
    refetch: refetchTrending,
  } = useTrendingApps(4);

  const {
    apps: latestApps,
    isLoading: isLatestLoading,
    error: latestError,
    refetch: refetchLatest,
  } = useLatestApps(4);

  const {
    categories,
    isLoading: isCategoriesLoading,
    error: categoriesError,
    refetch: refetchCategories,
  } = useCategories();

  const {
    posts: blogPosts,
    isLoading: isBlogLoading,
    error: blogError,
    refetch: refetchBlog,
  } = useLatestBlogPosts(3);

  return (
    <main className="home-page">
      <SEO
        title="ElseSourav - Serious Software, Built by Someone Who Cares"
        exactTitle
        description="Discover high-performance web applications, developer utilities, browser extensions, and open software built independently with care by Sourav."
        canonicalPath="/"
        structuredData={{
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
        }}
      />
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
          3. Popular / Trending Applications Section
          ========================================================================= */}
      <section className="home-section" aria-labelledby="trending-heading">
        <header className="home-section__header">
          <div className="home-section__title-group">
            <h2 id="trending-heading" className="home-section__title">
              Popular Right Now
            </h2>
            <p className="home-section__subtitle">
              Most explored and active tools across the catalog.
            </p>
          </div>

          <Link to={ROUTES.APPS} className="home-section__link">
            <span>View all apps</span>
            <ArrowRight size={16} />
          </Link>
        </header>

        {isTrendingLoading && (
          <div className="home-apps-grid" data-testid="home-trending-skeleton">
            <Skeleton variant="rounded" height={260} />
            <Skeleton variant="rounded" height={260} />
            <Skeleton variant="rounded" height={260} />
            <Skeleton variant="rounded" height={260} />
          </div>
        )}

        {trendingError && !isTrendingLoading && (
          <ErrorState
            title="Popular Apps Unavailable"
            description="Could not load trending applications at this time."
            action={
              <Button variant="secondary" size="sm" onClick={() => void refetchTrending()}>
                Retry
              </Button>
            }
          />
        )}

        {!isTrendingLoading && !trendingError && trendingApps.length > 0 && (
          <div className="home-apps-grid">
            {trendingApps.map((app, index) => (
              <AppCard key={app.id} app={app} rank={index + 1} />
            ))}
          </div>
        )}
      </section>

      {/* =========================================================================
          4. Latest Updates Section
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
          5. Software Categories Discovery Section
          ========================================================================= */}
      <section className="home-section" aria-labelledby="categories-heading">
        <header className="home-section__header">
          <div className="home-section__title-group">
            <h2 id="categories-heading" className="home-section__title">
              Explore by Category
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

        {isCategoriesLoading && (
          <div className="home-categories-grid" data-testid="home-categories-skeleton">
            <Skeleton variant="rounded" height={72} />
            <Skeleton variant="rounded" height={72} />
            <Skeleton variant="rounded" height={72} />
            <Skeleton variant="rounded" height={72} />
          </div>
        )}

        {categoriesError && !isCategoriesLoading && (
          <ErrorState
            title="Categories Unavailable"
            description="Could not load software categories at this time."
            action={
              <Button variant="secondary" size="sm" onClick={() => void refetchCategories()}>
                Retry
              </Button>
            }
          />
        )}

        {!isCategoriesLoading && !categoriesError && categories.length > 0 && (
          <div className="home-categories-grid">
            {categories.map((cat) => (
              <CategoryCard key={cat.id} category={cat} />
            ))}
          </div>
        )}
      </section>

      {/* =========================================================================
          6. Creator Introduction (20-30% Personal Layer)
          ========================================================================= */}
      <section className="home-section" aria-labelledby="creator-heading">
        <div className="home-creator-card">
          <div className="home-creator-card__avatar" aria-hidden="true">
            {creatorConfig.initials}
          </div>

          <div className="home-creator-card__info">
            <h2 id="creator-heading" className="home-creator-card__title">
              Crafted with Care by {creatorConfig.name}
            </h2>
            <p className="home-creator-card__bio">{creatorConfig.bioParagraphs[0]}</p>

            <div className="home-creator-card__footer">
              <Link to={ROUTES.ABOUT}>
                <Button variant="secondary" size="sm" rightIcon={<Compass size={16} />}>
                  About {creatorConfig.name}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          6. Latest from the Blog (Secondary Editorial Layer)
          ========================================================================= */}
      <section className="home-section" aria-labelledby="home-blog-heading">
        <header className="home-section__header">
          <div className="home-section__title-group">
            <Badge variant="accent" size="sm">
              Engineering Journal
            </Badge>
            <h2 id="home-blog-heading" className="home-section__title">
              Latest from the Blog
            </h2>
            <p className="home-section__subtitle">
              Essays on software architecture, design principles, and release notes.
            </p>
          </div>

          <Link to={ROUTES.BLOG} style={{ textDecoration: 'none' }}>
            <Button variant="ghost" size="sm" rightIcon={<ArrowRight size={16} />}>
              All Articles
            </Button>
          </Link>
        </header>

        {isBlogLoading && (
          <div className="home-blog-grid" data-testid="home-blog-skeleton">
            <Skeleton variant="rounded" height={320} />
            <Skeleton variant="rounded" height={320} />
            <Skeleton variant="rounded" height={320} />
          </div>
        )}

        {blogError && !isBlogLoading && (
          <ErrorState
            title="Articles Unavailable"
            description="Could not load latest articles at this time."
            action={
              <Button variant="secondary" size="sm" onClick={() => void refetchBlog()}>
                Retry
              </Button>
            }
          />
        )}

        {!isBlogLoading && !blogError && blogPosts.length > 0 && (
          <div className="home-blog-grid">
            {blogPosts.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </section>

      {/* =========================================================================
          7. Community Feedback & Support Banner
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
