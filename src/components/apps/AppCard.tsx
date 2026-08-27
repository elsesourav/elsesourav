import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bookmark, Star, ExternalLink, ArrowUpRight } from 'lucide-react';
import { Badge, Button, IconButton } from '@/components/ui';
import { useUserLibrary } from '@/hooks/useUserLibrary';
import { useAuth } from '@/hooks/useAuth';
import { analyticsService } from '@/services/analytics.service';
import type { App, AppActionType } from '@/types/app.types';
import './AppCard.css';

export interface AppCardProps {
  app: App;
  ratingAverage?: number;
  className?: string;
}

export const AppCard: React.FC<AppCardProps> = ({ app, ratingAverage, className = '' }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { isSaved, toggleSave } = useUserLibrary();
  const [imageError, setImageError] = useState(false);

  const saved = isSaved(app.id);

  // Determine primary action link
  const primaryLink =
    app.links.find((l) => l.isPrimary && l.isActive) || app.links.find((l) => l.isActive) || null;

  const getActionLabel = (action?: AppActionType): string => {
    switch (action) {
      case 'open_app':
        return 'Open App';
      case 'add_to_chrome':
        return 'Add to Chrome';
      case 'get_on_play_store':
        return 'Get on Play';
      case 'view_on_github':
        return 'View GitHub';
      case 'download':
        return 'Download';
      case 'visit_website':
        return 'Visit Website';
      default:
        return 'Open App';
    }
  };

  const handleCardClick = () => {
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
    if (primaryLink) {
      void analyticsService.trackPrimaryAction(app.id, primaryLink.action || 'open_app', {
        platform: primaryLink.platform,
        linkId: primaryLink.id,
      });
      window.open(primaryLink.url, '_blank', 'noopener,noreferrer');
    } else {
      navigate(`/apps/${app.slug}`);
    }
  };

  const rating = ratingAverage ?? app.stats.ratingAverage ?? 5.0;

  return (
    <article
      className={`app-card ${className}`}
      onClick={handleCardClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
      tabIndex={0}
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

            <span
              className="app-card__rating"
              aria-label={`Rating: ${rating.toFixed(1)} out of 5 stars`}
            >
              <Star size={13} fill="#f59e0b" color="#f59e0b" />
              <span>{rating.toFixed(1)}</span>
            </span>
          </div>
        </div>

        <div className="app-card__badges">
          {app.isFeatured && (
            <Badge variant="accent" size="sm">
              Featured
            </Badge>
          )}
        </div>
      </header>

      <p className="app-card__description">{app.shortDescription}</p>

      {app.tags && app.tags.length > 0 && (
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
          variant="secondary"
          size="sm"
          className="app-card__action-button"
          onClick={handleActionClick}
          rightIcon={primaryLink ? <ExternalLink size={14} /> : <ArrowUpRight size={14} />}
          aria-label={`${getActionLabel(primaryLink?.action)} for ${app.name}`}
        >
          {getActionLabel(primaryLink?.action)}
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
