import React from 'react';
import { Link } from 'react-router-dom';
import { FileQuestion, Home, Compass, BookOpen, HelpCircle, Search } from 'lucide-react';
import { Button, Card, Heading, Text, SEO } from '@/components';
import { ROUTES } from '@/constants/routes';
import './NotFoundPage.css';

export interface NotFoundPageProps {
  readonly title?: string;
  readonly description?: string;
  readonly resourceType?: 'page' | 'app' | 'article' | 'category' | 'ticket';
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({
  title = 'Page Not Found',
  description = "The page you requested could not be found. It may have been moved, renamed, or is temporarily unavailable.",
  resourceType = 'page',
}) => {
  const dynamicTitle =
    resourceType === 'app'
      ? 'Application Not Found'
      : resourceType === 'article'
      ? 'Article Not Found'
      : resourceType === 'category'
      ? 'Category Not Found'
      : resourceType === 'ticket'
      ? 'Ticket Not Found'
      : title;

  return (
    <div className="not-found-page" role="main">
      <SEO title={`404 - ${dynamicTitle}`} description={description} noIndex />

      <Card variant="glass" padding="lg" className="not-found-page__card">
        <div className="not-found-page__badge">404</div>

        <div className="not-found-page__icon-wrapper">
          <FileQuestion size={40} aria-hidden="true" />
        </div>

        <Heading level={1} size="xl" className="not-found-page__title">
          {dynamicTitle}
        </Heading>

        <Text variant="muted" size="md" className="not-found-page__desc">
          {description}
        </Text>

        <div className="not-found-page__actions">
          <Link to={ROUTES.HOME}>
            <Button variant="primary" size="md" leftIcon={<Home size={16} />}>
              Back to Home
            </Button>
          </Link>
          <Link to={ROUTES.SEARCH}>
            <Button variant="secondary" size="md" leftIcon={<Search size={16} />}>
              Search Content
            </Button>
          </Link>
        </div>

        <div className="not-found-page__shortcuts">
          <Text variant="muted" size="xs" className="not-found-page__shortcuts-label">
            Quick Navigation
          </Text>
          <div className="not-found-page__links">
            <Link to={ROUTES.APPS} className="not-found-page__link">
              <Compass size={14} aria-hidden="true" />
              <span>Browse Apps</span>
            </Link>
            <span className="not-found-page__separator" aria-hidden="true">•</span>
            <Link to={ROUTES.BLOG} className="not-found-page__link">
              <BookOpen size={14} aria-hidden="true" />
              <span>Read Blog</span>
            </Link>
            <span className="not-found-page__separator" aria-hidden="true">•</span>
            <Link to={ROUTES.HELP} className="not-found-page__link">
              <HelpCircle size={14} aria-hidden="true" />
              <span>Help Center</span>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default NotFoundPage;
