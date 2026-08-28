import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, ArrowRight, Clock } from 'lucide-react';
import type { HelpArticle } from '@/types/help.types';
import './HelpArticleCard.css';

interface HelpArticleCardProps {
  readonly article: HelpArticle;
  readonly categorySlug: string;
  readonly categoryName?: string;
}

export const HelpArticleCard: React.FC<HelpArticleCardProps> = ({
  article,
  categorySlug,
  categoryName,
}) => {
  const formattedDate = new Date(article.updatedAt || article.createdAt).toLocaleDateString(
    'en-US',
    {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }
  );

  return (
    <Link
      to={`/help/${categorySlug}/${article.slug}`}
      className="help-article-card"
      aria-label={`Read article: ${article.title}`}
    >
      <div className="help-article-card__header">
        <div className="help-article-card__icon-wrap" aria-hidden="true">
          <FileText size={18} />
        </div>

        {categoryName && <span className="help-article-card__category-badge">{categoryName}</span>}
      </div>

      <h4 className="help-article-card__title">{article.title}</h4>

      {article.excerpt && <p className="help-article-card__excerpt">{article.excerpt}</p>}

      <div className="help-article-card__footer">
        <span className="help-article-card__date">
          <Clock size={13} aria-hidden="true" />
          <span>Updated {formattedDate}</span>
        </span>

        <span className="help-article-card__read-more" aria-hidden="true">
          <span>Read article</span>
          <ArrowRight size={14} />
        </span>
      </div>
    </Link>
  );
};
