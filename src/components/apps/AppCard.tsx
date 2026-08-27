import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bookmark,
  Star,
  ExternalLink,
  Download,
  ArrowUpRight,
  Code2,
  Smartphone,
  Layers,
  AlertCircle,
} from 'lucide-react';
import { Badge, Button, IconButton } from '@/components/ui';
import { useUserLibrary } from '@/hooks/useUserLibrary';
import { useAuth } from '@/hooks/useAuth';
import { analyticsService } from '@/services/analytics.service';
import { resolveSmartAction, type SmartAction } from '@/utils/smart-action';
import type { App } from '@/types/app.types';
import './AppCard.css';

export interface AppCardProps {
  readonly app: App;
  readonly variant?: 'default' | 'featured' | 'compact';
  readonly isUnavailable?: boolean;
  readonly ratingAverage?: number;
  readonly className?: string;
  readonly onActionClick?: (action: SmartAction, event: React.MouseEvent) => void;
}

export const AppCard: React.FC<AppCardProps> = ({
  app,
  variant = 'default',
  isUnavailable = false,
  ratingAverage,
  className = '',
  onActionClick,
}) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { isSaved, toggleSave } = useUserLibrary();
  const [imageError, setImageError] = useState(false);

  const saved = isSaved(app.id);
  const isArchived = app.status === 'archived' || isUnavailable;
  const isFeatured = variant === 'featured' || app.isFeatured;
  const isCompact = variant === 'compact';

  const action = resolveSmartAction(app);

  const renderActionIcon = () => {
    switch (action.iconType) {
      case 'download':
        return <Download size={14} />;
      case 'chrome':
        return <Layers size={14} />;
      case 'play':
      case 'apple':
        return <Smartphone size={14} />;
      case 'github':
        return <Code2 size={14} />;
      case 'external':
      case 'globe':
        return <ExternalLink size={14} />;
      default:
        return <ArrowUpRight size={14} />;
    }
  };

  const handleCardClick = () => {
    if (isArchived) return;
    navigate(`/apps/${app.slug}`);
  };

  const handleBookmarkClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    await toggleSave(app.id);
  };

  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (onActionClick) {
      onActionClick(action, e);
      return;
    }

    if (isArchived) {
      navigate(`/apps/${app.slug}`);
      return;
    }

    // Trigger non-blocking telemetry
    void analyticsService.trackPrimaryAction(app.id, action.actionType, {
      platform: action.platform === 'internal' ? 'web' : action.platform,
      linkId: action.linkId,
    });

    if (action.isExternal && action.url && action.isSafeUrl) {
      window.open(action.url, action.target, 'noopener,noreferrer');
    } else {
      navigate(action.url || `/apps/${app.slug}`);
    }
  };

  const rating = ratingAverage ?? app.stats.ratingAverage ?? 5.0;

  const cardClasses = [
    'app-card',
    isFeatured && 'app-card--featured',
    isCompact && 'app-card--compact',
    isArchived && 'app-card--unavailable',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <article
      className={cardClasses}
      onClick={handleCardClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
      tabIndex={isArchived ? -1 : 0}
      role="button"
      aria-label={`View ${app.name} application`}
    >
      <header className="app-card__header">
        <div className="app-card__icon-wrapper">
          {app.iconUrl && !imageError ? (
            <img
              src={app.iconUrl}
              alt={`${app.name} icon`}
              className="app-card__icon"
              onError={() => setImageError(true)}
              loading="lazy"
            />
          ) : (
            <span className="app-card__icon-fallback">{app.name.charAt(0).toUpperCase()}</span>
          )}
        </div>

        <div className="app-card__title-area">
          <h3 className="app-card__name">{app.name}</h3>
          <div className="app-card__meta">
            <Badge variant="default" size="sm">
              {app.primaryCategory.replace('-', ' ')}
            </Badge>

            {!isArchived && (
              <span
                className="app-card__rating"
                aria-label={`Rating: ${rating.toFixed(1)} out of 5 stars`}
              >
                <Star size={13} fill="#f59e0b" color="#f59e0b" />
                <span>{rating.toFixed(1)}</span>
              </span>
            )}
          </div>
        </div>

        <div className="app-card__badges">
          {isArchived ? (
            <Badge variant="mono" size="sm" icon={<AlertCircle size={12} />}>
              Unavailable
            </Badge>
          ) : (
            isFeatured && (
              <Badge variant="accent" size="sm">
                Featured
              </Badge>
            )
          )}
        </div>
      </header>

      {!isCompact && <p className="app-card__description">{app.shortDescription}</p>}

      {!isCompact && app.tags && app.tags.length > 0 && (
        <div className="app-card__tags" aria-label="Tags">
          {app.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="app-card__tag">
              #{tag}
            </span>
          ))}
        </div>
      )}

      <footer className="app-card__footer">
        <Button
          variant={isFeatured ? 'primary' : 'secondary'}
          size="sm"
          className="app-card__action-button"
          onClick={handleActionClick}
          disabled={isArchived && !action.url}
          rightIcon={renderActionIcon()}
          aria-label={`${action.label} for ${app.name}`}
        >
          {isArchived ? 'View Archived' : action.label}
        </Button>

        <IconButton
          icon={<Bookmark size={18} fill={saved ? 'currentColor' : 'none'} />}
          aria-label={saved ? `Remove ${app.name} from library` : `Save ${app.name} to library`}
          variant="ghost"
          size="sm"
          className={`app-card__bookmark-button ${saved ? 'app-card__bookmark-button--saved' : ''}`}
          onClick={handleBookmarkClick}
        />
      </footer>
    </article>
  );
};
