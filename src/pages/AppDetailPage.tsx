import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Star,
  Bookmark,
  ExternalLink,
  Download,
  ArrowUpRight,
  Code2,
  Smartphone,
  Layers,
  Sparkles,
  RefreshCw,
  ArrowLeft,
  FileQuestion,
} from 'lucide-react';
import { Badge, Button, IconButton, EmptyState, ErrorState, Skeleton } from '@/components/ui';
import { AppCard, AppGallery, AppRatingSection, AppVersionHistory } from '@/components/apps';
import { useAppDetails } from '@/hooks/useAppDetails';
import { useUserLibrary } from '@/hooks/useUserLibrary';
import { useAuth } from '@/hooks/useAuth';
import { analyticsService } from '@/services/analytics.service';
import { resolveSmartAction, type SmartAction } from '@/utils/smart-action';
import { ROUTES } from '@/constants/routes';
import type { AppLink } from '@/types/app.types';
import './AppDetailPage.css';

export const AppDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { data, isLoading, error, refetch } = useAppDetails(slug);
  const { isAuthenticated, isAdmin } = useAuth();
  const { isSaved, toggleSave } = useUserLibrary();

  const [imageError, setImageError] = useState(false);

  const app = data?.app;
  const isPublicVisitor = !isAdmin;
  const isUnpublished = app && app.status !== 'published' && isPublicVisitor;

  // SEO dynamic updates
  useEffect(() => {
    if (app && !isUnpublished) {
      document.title = `${app.name} - Applications | ElseSourav`;

      // Set meta description
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', app.shortDescription);
      }

      // Track non-blocking page view analytics
      void analyticsService.trackView(app.id);

      // JSON-LD structured data for SEO rich snippets
      const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: app.name,
        description: app.shortDescription,
        applicationCategory: app.primaryCategory,
        operatingSystem: app.platforms.join(', '),
        author: {
          '@type': 'Person',
          name: 'Sourav',
          url: 'https://elsesourav.com',
        },
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
        aggregateRating: app.stats.ratingAverage
          ? {
              '@type': 'AggregateRating',
              ratingValue: app.stats.ratingAverage.toFixed(1),
              bestRating: '5',
              ratingCount: data?.ratings.aggregate?.ratingCount || 1,
            }
          : undefined,
      };

      let scriptTag = document.getElementById('json-ld-app-data') as HTMLScriptElement | null;
      if (!scriptTag) {
        scriptTag = document.createElement('script');
        scriptTag.id = 'json-ld-app-data';
        scriptTag.type = 'application/ld+json';
        document.head.appendChild(scriptTag);
      }
      scriptTag.textContent = JSON.stringify(jsonLd);
    }

    return () => {
      const tag = document.getElementById('json-ld-app-data');
      if (tag) tag.remove();
    };
  }, [app, isUnpublished, data?.ratings.aggregate?.ratingCount]);

  const saved = app ? isSaved(app.id) : false;
  const smartAction: SmartAction | null = app ? resolveSmartAction(app) : null;

  const handleBookmarkToggle = async () => {
    if (!app) return;
    if (!isAuthenticated) {
      navigate(ROUTES.LOGIN);
      return;
    }
    await toggleSave(app.id);
  };

  const handleSmartActionClick = () => {
    if (!app || !smartAction) return;

    void analyticsService.trackPrimaryAction(app.id, smartAction.actionType, {
      platform: smartAction.platform === 'internal' ? 'web' : smartAction.platform,
      linkId: smartAction.linkId,
    });

    if (smartAction.isExternal && smartAction.url && smartAction.isSafeUrl) {
      window.open(smartAction.url, smartAction.target, 'noopener,noreferrer');
    } else {
      navigate(smartAction.url || ROUTES.APPS);
    }
  };

  const handleSecondaryLinkClick = (link: AppLink) => {
    if (!app) return;

    void analyticsService.trackExternalLink(app.id, link.id, {
      platform: link.platform,
      linkId: link.id,
    });

    window.open(link.url, '_blank', 'noopener,noreferrer');
  };

  const renderSmartActionIcon = () => {
    if (!smartAction) return <ArrowUpRight size={16} />;
    switch (smartAction.iconType) {
      case 'download':
        return <Download size={16} />;
      case 'chrome':
        return <Layers size={16} />;
      case 'play':
      case 'apple':
        return <Smartphone size={16} />;
      case 'github':
        return <Code2 size={16} />;
      case 'external':
      case 'globe':
        return <ExternalLink size={16} />;
      default:
        return <ArrowUpRight size={16} />;
    }
  };

  // Loading State
  if (isLoading) {
    return (
      <main className="app-detail" data-testid="app-detail-loading">
        <div className="app-detail__skeleton-hero">
          <Skeleton variant="rounded" width={104} height={104} />
          <div style={{ flex: 1 }}>
            <Skeleton variant="text" width="40%" height={36} style={{ marginBottom: 12 }} />
            <Skeleton variant="text" width="70%" height={20} style={{ marginBottom: 16 }} />
            <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
              <Skeleton variant="rounded" width={80} height={24} />
              <Skeleton variant="rounded" width={100} height={24} />
            </div>
            <Skeleton variant="rounded" width={160} height={40} />
          </div>
        </div>
        <Skeleton variant="rounded" width="100%" height={200} style={{ marginBottom: 32 }} />
        <Skeleton variant="text" width="100%" height={120} />
      </main>
    );
  }

  // Error State (Network or server error)
  if (error && error.code !== 'NOT_FOUND') {
    return (
      <main className="app-detail">
        <ErrorState
          title="Unable to Load Application"
          description={error.message || 'An error occurred while loading this application.'}
          action={
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<RefreshCw size={15} />}
              onClick={() => void refetch()}
            >
              Retry
            </Button>
          }
        />
      </main>
    );
  }

  // Not Found / Unpublished State
  if (!app || isUnpublished) {
    return (
      <main className="app-detail">
        <EmptyState
          icon={<FileQuestion size={40} />}
          title="Application Not Found"
          description={`The application "${slug}" does not exist, has been archived, or is currently unpublished.`}
          action={
            <Link to={ROUTES.APPS}>
              <Button variant="primary" size="md" leftIcon={<ArrowLeft size={16} />}>
                Browse All Applications
              </Button>
            </Link>
          }
        />
      </main>
    );
  }

  const rating = data.ratings.aggregate?.averageRating ?? app.stats.ratingAverage ?? 5.0;
  const ratingCount = data.ratings.aggregate?.ratingCount ?? 0;
  const currentVersion = data.versions.latest?.version || '1.0.0';

  const secondaryLinks = app.links.filter(
    (l) => l.isActive && (!smartAction || l.id !== smartAction.linkId)
  );

  return (
    <main className="app-detail">
      {/* Breadcrumb back navigation */}
      <nav style={{ marginBottom: 'var(--space-6)' }} aria-label="Breadcrumb">
        <Link
          to={ROUTES.APPS}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 'var(--space-1)',
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-text-secondary)',
            textDecoration: 'none',
          }}
        >
          <ArrowLeft size={14} /> Back to Apps
        </Link>
      </nav>

      {/* Hero Header Section */}
      <header className="app-detail__hero">
        <div className="app-detail__icon-wrapper">
          {app.iconUrl && !imageError ? (
            <img
              src={app.iconUrl}
              alt={`${app.name} icon`}
              className="app-detail__icon"
              onError={() => setImageError(true)}
            />
          ) : (
            <span className="app-detail__icon-fallback">{app.name.charAt(0).toUpperCase()}</span>
          )}
        </div>

        <div className="app-detail__header-info">
          <div className="app-detail__title-row">
            <h1 className="app-detail__name">{app.name}</h1>
            {app.isFeatured && (
              <Badge variant="accent" size="sm" icon={<Sparkles size={12} />}>
                Featured
              </Badge>
            )}
          </div>

          <p className="app-detail__tagline">{app.shortDescription}</p>

          <div className="app-detail__meta-bar">
            <Link to={`/apps?category=${app.primaryCategory}`} style={{ textDecoration: 'none' }}>
              <Badge variant="default" size="md">
                {app.primaryCategory.replace('-', ' ')}
              </Badge>
            </Link>

            <span
              className="app-detail__rating-badge"
              aria-label={`Rated ${rating.toFixed(1)} out of 5 stars based on ${ratingCount} reviews`}
            >
              <Star size={16} fill="#f59e0b" color="#f59e0b" />
              <span>{rating.toFixed(1)}</span>
              {ratingCount > 0 && (
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                  ({ratingCount})
                </span>
              )}
            </span>

            <Badge variant="mono" size="md">
              v{currentVersion}
            </Badge>

            {/* Tags */}
            {app.tags && app.tags.length > 0 && (
              <div className="app-detail__tags" aria-label="Tags">
                {app.tags.map((tag) => (
                  <Link key={tag} to={`/apps?tags=${tag}`} className="app-detail__tag-pill">
                    #{tag}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="app-detail__actions-row">
            {smartAction && (
              <Button
                variant="primary"
                size="lg"
                onClick={handleSmartActionClick}
                rightIcon={renderSmartActionIcon()}
                aria-label={`${smartAction.label} for ${app.name}`}
              >
                {smartAction.label}
              </Button>
            )}

            <IconButton
              icon={<Bookmark size={20} fill={saved ? 'currentColor' : 'none'} />}
              aria-label={
                saved ? `Remove ${app.name} from saved library` : `Save ${app.name} to library`
              }
              variant="secondary"
              size="lg"
              className={`app-detail__bookmark-btn ${saved ? 'app-detail__bookmark-btn--saved' : ''}`}
              onClick={() => void handleBookmarkToggle()}
            />
          </div>

          {/* Secondary External Links */}
          {secondaryLinks.length > 0 && (
            <div className="app-detail__secondary-links" aria-label="Alternative platform links">
              {secondaryLinks.map((link) => (
                <Button
                  key={link.id}
                  variant="outline"
                  size="sm"
                  onClick={() => handleSecondaryLinkClick(link)}
                  rightIcon={<ExternalLink size={13} />}
                >
                  {link.label}
                </Button>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Media Screenshot Gallery */}
      {data.media.all && data.media.all.length > 0 && (
        <AppGallery media={data.media.all} appName={app.name} />
      )}

      {/* Overview & Description Section */}
      <section className="app-detail__section" aria-labelledby="overview-heading">
        <h2 id="overview-heading" className="app-detail__section-title">
          Overview
        </h2>
        <div className="app-detail__description">{app.description || app.shortDescription}</div>
      </section>

      {/* What's New & Version History */}
      <AppVersionHistory latestVersion={data.versions.latest} versions={data.versions.all} />

      {/* Specifications & Details Grid */}
      <section className="app-detail__section" aria-labelledby="specs-heading">
        <h2 id="specs-heading" className="app-detail__section-title">
          Information
        </h2>
        <div className="app-detail__specs-grid">
          <div className="app-detail__spec-card">
            <div className="app-detail__spec-label">Publisher</div>
            <div className="app-detail__spec-value">ElseSourav</div>
          </div>
          <div className="app-detail__spec-card">
            <div className="app-detail__spec-label">Category</div>
            <div className="app-detail__spec-value">{app.primaryCategory.replace('-', ' ')}</div>
          </div>
          <div className="app-detail__spec-card">
            <div className="app-detail__spec-label">Platforms</div>
            <div className="app-detail__spec-value">{app.platforms.join(', ').toUpperCase()}</div>
          </div>
          <div className="app-detail__spec-card">
            <div className="app-detail__spec-label">Latest Version</div>
            <div className="app-detail__spec-value">v{currentVersion}</div>
          </div>
          <div className="app-detail__spec-card">
            <div className="app-detail__spec-label">Updated</div>
            <div className="app-detail__spec-value">
              {new Date(app.updatedAt).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </div>
          </div>
          <div className="app-detail__spec-card">
            <div className="app-detail__spec-label">Pricing</div>
            <div className="app-detail__spec-value">Free / Open Access</div>
          </div>
        </div>
      </section>

      {/* Ratings & Reviews Section */}
      <AppRatingSection
        appId={app.id}
        appName={app.name}
        initialAggregate={data.ratings.aggregate}
        initialReviews={data.ratings.approvedReviews}
      />

      {/* Related Applications */}
      {data.relatedApps && data.relatedApps.length > 0 && (
        <section className="app-detail__section" aria-labelledby="related-apps-heading">
          <h2 id="related-apps-heading" className="app-detail__section-title">
            Related Applications
          </h2>
          <div className="app-detail__related-grid">
            {data.relatedApps.map((relatedApp) => (
              <AppCard key={relatedApp.id} app={relatedApp} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
};
