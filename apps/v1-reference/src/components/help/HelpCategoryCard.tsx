import React from 'react';
import { Link } from 'react-router-dom';
import {
  HelpCircle,
  BookOpen,
  Shield,
  Smartphone,
  Laptop,
  Code,
  Sparkles,
  Settings,
  Download,
  AlertCircle,
  ChevronRight,
} from 'lucide-react';
import type { HelpCategory } from '@/types/help.types';
import './HelpCategoryCard.css';

interface HelpCategoryCardProps {
  readonly category: HelpCategory;
  readonly articleCount?: number;
}

const ICON_MAP: Record<string, React.ElementType> = {
  help: HelpCircle,
  book: BookOpen,
  shield: Shield,
  mobile: Smartphone,
  desktop: Laptop,
  code: Code,
  sparkles: Sparkles,
  settings: Settings,
  download: Download,
  alert: AlertCircle,
  user: Shield,
};

export const HelpCategoryCard: React.FC<HelpCategoryCardProps> = ({ category, articleCount }) => {
  const IconComponent = (category.icon && ICON_MAP[category.icon.toLowerCase()]) || HelpCircle;

  return (
    <Link
      to={`/help/${category.slug}`}
      className="help-category-card"
      aria-label={`View articles in ${category.name}`}
    >
      <div className="help-category-card__icon-wrapper" aria-hidden="true">
        <IconComponent size={24} className="help-category-card__icon" />
      </div>

      <div className="help-category-card__body">
        <div className="help-category-card__header">
          <h3 className="help-category-card__title">{category.name}</h3>
          <ChevronRight size={16} className="help-category-card__arrow" aria-hidden="true" />
        </div>

        {category.description && <p className="help-category-card__desc">{category.description}</p>}

        {typeof articleCount === 'number' && (
          <span className="help-category-card__count">
            {articleCount} {articleCount === 1 ? 'article' : 'articles'}
          </span>
        )}
      </div>
    </Link>
  );
};
