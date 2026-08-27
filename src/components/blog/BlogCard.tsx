import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, BookOpen } from 'lucide-react';
import { Badge } from '@/components';
import type { BlogPost } from '@/types/blog.types';
import { formatDate } from '@/utils/format';
import './BlogCard.css';

export interface BlogCardProps {
  post: BlogPost;
  featured?: boolean;
  className?: string;
}

export const BlogCard: React.FC<BlogCardProps> = ({ post, featured = false, className = '' }) => {
  const publishedTimestamp = post.publishedAt || post.createdAt;
  const readingTime = post.readingTime || post.readingTimeMinutes || 1;

  return (
    <Link
      to={`/blog/${post.slug}`}
      className={`blog-card-link ${className}`}
      aria-label={`Read article: ${post.title}`}
    >
      <article className={`blog-card ${featured ? 'blog-card--featured' : ''}`}>
        {/* Cover Media */}
        <div className="blog-card__cover-wrapper">
          {post.coverImageUrl ? (
            <img
              src={post.coverImageUrl}
              alt={post.title}
              className="blog-card__cover-image"
              loading="lazy"
            />
          ) : (
            <div className="blog-card__cover-fallback" aria-hidden="true">
              <BookOpen size={48} strokeWidth={1.5} />
            </div>
          )}

          <div className="blog-card__category-badge">
            <Badge variant="outline" size="sm">
              {post.category}
            </Badge>
          </div>
        </div>

        {/* Card Content */}
        <div className="blog-card__body">
          <h2 className="blog-card__title">{post.title}</h2>

          <p className="blog-card__excerpt">{post.excerpt}</p>

          <footer className="blog-card__meta">
            <div className="blog-card__meta-left">
              <span className="blog-card__meta-item">
                <Calendar size={13} aria-hidden="true" />
                <time dateTime={new Date(publishedTimestamp).toISOString()}>
                  {formatDate(publishedTimestamp)}
                </time>
              </span>

              <span className="blog-card__meta-item">
                <Clock size={13} aria-hidden="true" />
                <span>{readingTime} min read</span>
              </span>
            </div>

            {post.tags && post.tags.length > 0 && (
              <div className="blog-card__tags" aria-label="Tags">
                {post.tags.slice(0, 2).map((tag) => (
                  <span key={tag} className="blog-card__tag">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </footer>
        </div>
      </article>
    </Link>
  );
};
