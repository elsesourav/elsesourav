import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Badge } from '@/components';
import { formatDate } from '@/utils/format';
import { analyticsService } from '@/services/analytics.service';
import { ROUTES } from '@/constants/routes';
import './LatestUpdateCard.css';

export interface LatestUpdateItem {
  readonly appId: string;
  readonly appName: string;
  readonly appSlug: string;
  readonly iconUrl?: string;
  readonly version?: string;
  readonly title: string;
  readonly summary: string;
  readonly updatedAt: number;
}

export interface LatestUpdateCardProps {
  readonly item: LatestUpdateItem;
  readonly onClick?: () => void;
}

export const LatestUpdateCard: React.FC<LatestUpdateCardProps> = ({ item, onClick }) => {
  const [imageError, setImageError] = useState(false);

  const handleClick = () => {
    // Non-blocking telemetry
    void analyticsService.trackView(item.appId, {
      source: 'home_latest_updates',
    });
    if (onClick) onClick();
  };

  const initial = item.appName.charAt(0).toUpperCase() || 'A';
  const detailUrl = `${ROUTES.APPS}/${item.appSlug}`;

  return (
    <Link
      to={detailUrl}
      className="latest-update-card"
      onClick={handleClick}
      aria-label={`View ${item.appName} update: ${item.title}`}
    >
      <div className="latest-update-card__icon-wrapper">
        {item.iconUrl && !imageError ? (
          <img
            src={item.iconUrl}
            alt={`${item.appName} icon`}
            className="latest-update-card__icon"
            onError={() => setImageError(true)}
            loading="lazy"
          />
        ) : (
          <span className="latest-update-card__icon-fallback">{initial}</span>
        )}
      </div>

      <div className="latest-update-card__body">
        <div className="latest-update-card__header">
          <div className="latest-update-card__title-row">
            <span className="latest-update-card__app-name">{item.appName}</span>
            {item.version ? (
              <Badge variant="accent" size="sm">
                v{item.version.replace(/^v/, '')}
              </Badge>
            ) : (
              <Badge variant="default" size="sm" icon={<Sparkles size={11} />}>
                New Release
              </Badge>
            )}
          </div>
          <time
            dateTime={new Date(item.updatedAt).toISOString()}
            className="latest-update-card__date"
          >
            {formatDate(item.updatedAt)}
          </time>
        </div>

        <p className="latest-update-card__summary">{item.summary || item.title}</p>
      </div>

      <div className="latest-update-card__arrow" aria-hidden="true">
        <ArrowRight size={18} />
      </div>
    </Link>
  );
};
