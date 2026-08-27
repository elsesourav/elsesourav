import React from 'react';
import { Link } from 'react-router-dom';
import {
  Wrench,
  Layers,
  Globe,
  Puzzle,
  Gamepad2,
  Sparkles,
  FlaskConical,
  Smartphone,
  Folder,
  ArrowRight,
} from 'lucide-react';
import type { Category } from '@/types/category.types';
import { analyticsService } from '@/services/analytics.service';
import { ROUTES } from '@/constants/routes';
import './CategoryCard.css';

export interface CategoryCardProps {
  readonly category: Category;
  readonly onClick?: () => void;
}

export function getCategoryIcon(slug: string, name: string): React.ReactNode {
  const normalized = (slug + ' ' + name).toLowerCase();

  if (
    normalized.includes('developer') ||
    normalized.includes('dev') ||
    normalized.includes('tool')
  ) {
    return <Wrench size={22} />;
  }
  if (normalized.includes('util') || normalized.includes('productiv')) {
    return <Layers size={22} />;
  }
  if (normalized.includes('web') || normalized.includes('cloud') || normalized.includes('online')) {
    return <Globe size={22} />;
  }
  if (
    normalized.includes('extension') ||
    normalized.includes('chrome') ||
    normalized.includes('plugin')
  ) {
    return <Puzzle size={22} />;
  }
  if (normalized.includes('game') || normalized.includes('gaming') || normalized.includes('play')) {
    return <Gamepad2 size={22} />;
  }
  if (
    normalized.includes('ai') ||
    normalized.includes('machine') ||
    normalized.includes('intelligence')
  ) {
    return <Sparkles size={22} />;
  }
  if (
    normalized.includes('experiment') ||
    normalized.includes('lab') ||
    normalized.includes('beta')
  ) {
    return <FlaskConical size={22} />;
  }
  if (
    normalized.includes('mobile') ||
    normalized.includes('android') ||
    normalized.includes('ios')
  ) {
    return <Smartphone size={22} />;
  }

  return <Folder size={22} />;
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
