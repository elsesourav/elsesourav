import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import type { Category } from '@/types/category.types';
import { analyticsService } from '@/services/analytics.service';
import { ROUTES } from '@/constants/routes';
import { getCategoryIcon } from './category-icon.utils';
import './CategoryCard.css';

export interface CategoryCardProps {
  readonly category: Category;
  readonly onClick?: () => void;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ category, onClick }) => {
  const handleClick = () => {
    // Non-blocking telemetry
    void analyticsService.trackView(category.id, {
      source: 'home_category_discovery',
    });
    if (onClick) onClick();
  };

  const targetUrl = `${ROUTES.APPS}?category=${encodeURIComponent(category.slug)}`;
  const icon = getCategoryIcon(category.slug, category.name);

  return (
    <Link
      to={targetUrl}
      className="category-card"
      onClick={handleClick}
      aria-label={`Explore ${category.name} software category`}
    >
      <div className="category-card__icon-wrapper" aria-hidden="true">
        {icon}
      </div>

      <div className="category-card__body">
        <span className="category-card__name">{category.name}</span>
        {category.description && (
          <span className="category-card__desc">{category.description}</span>
        )}
      </div>

      <div className="category-card__arrow" aria-hidden="true">
        <ArrowRight size={18} />
      </div>
    </Link>
  );
};
