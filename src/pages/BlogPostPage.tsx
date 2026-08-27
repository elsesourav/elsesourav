import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, User, ArrowUpRight, BookOpen } from 'lucide-react';
import { Badge, Button, Spinner, EmptyState, ErrorState, SEO } from '@/components';
import { BlogContentRenderer, BlogCard } from '@/components/blog';
import { blogService } from '@/services/blog.service';
import type { BlogPost } from '@/types/blog.types';
import { buildBlogPostSEO } from '@/utils/seo.utils';
import { ROUTES } from '@/constants/routes';
import { formatDate } from '@/utils/format';
import './BlogPostPage.css';

export const BlogPostPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    const fetchPostAndRelated = async () => {
      setIsLoading(true);
      setError(null);

      const result = await blogService.getPostBySlug(slug);

      if (result.success && result.data && result.data.status === 'published') {
        const currentPost = result.data;
        setPost(currentPost);

        // Fetch related posts from same category
        const relatedResult = await blogService.listPostsByCategory(currentPost.category, {
          limit: 4,
        });

        if (relatedResult.success) {
          const filtered = relatedResult.data.items
            .filter((p) => p.id !== currentPost.id)
            .slice(0, 3);
          setRelatedPosts(filtered);
        }
      } else {
        setPost(null);
        if (!result.success) {
          setError(result.error.message);
        }
      }

      setIsLoading(false);
    };

    void fetchPostAndRelated();
  }, [slug]);

  const seoConfig = buildBlogPostSEO(post);

  if (isLoading) {
    return (
      <main className="blog-post-page" data-testid="blog-post-loading">
        <div style={{ display: 'flex', justifyContent: 'center', padding: '120px 0' }}>
          <Spinner size="lg" />
        </div>
      </main>
    );
  }

  if (error && !post) {
    return (
      <main className="blog-post-page">
        <ErrorState
          title="Error Loading Article"
          description={error}
          action={
            <Link to={ROUTES.BLOG}>
              <Button variant="secondary" size="sm" leftIcon={<ArrowLeft size={16} />}>
                Back to Articles
              </Button>
            </Link>
          }
        />
      </main>
    );
  }

  if (!post) {
    return (
      <main className="blog-post-page" data-testid="blog-post-not-found">
        <EmptyState
          icon={<BookOpen size={48} />}
          title="Article Not Found"
          description="The article you are looking for does not exist, has moved, or is not yet published."
          action={
            <Link to={ROUTES.BLOG}>
              <Button variant="primary" size="sm" leftIcon={<ArrowLeft size={16} />}>
                Explore Articles
              </Button>
            </Link>
          }
        />
      </main>
    );
  }

  const publishedDate = post.publishedAt || post.createdAt;
  const readingTime = post.readingTime || post.readingTimeMinutes || 1;

  return (
    <main className="blog-post-page">
      <SEO {...seoConfig} />
      <article className="blog-post-article">
        {/* Navigation Breadcrumb */}
        <nav className="blog-post-breadcrumb" aria-label="Breadcrumb">
          <Link to={ROUTES.BLOG} style={{ textDecoration: 'none' }}>
            <Button variant="ghost" size="sm" leftIcon={<ArrowLeft size={16} />}>
              All Articles
            </Button>
          </Link>
        </nav>

        {/* Article Header */}
        <header className="blog-post-header">
          <div className="blog-post-header__category">
            <Link
              to={`/blog?category=${encodeURIComponent(post.category)}`}
              style={{ textDecoration: 'none' }}
            >
              <Badge variant="accent" size="sm">
                {post.category}
              </Badge>
            </Link>
          </div>

          <h1 className="blog-post-title">{post.title}</h1>

          <p className="blog-post-excerpt">{post.excerpt}</p>

          <div className="blog-post-meta">
            <Link to={ROUTES.ABOUT} className="blog-post-author" aria-label="About the author">
              <div className="blog-post-author__avatar">
                <User size={18} />
              </div>
              <div className="blog-post-author__info">
                <span className="blog-post-author__name">{post.authorName || 'Sourav'}</span>
                <span className="blog-post-author__role">Software Engineer & Creator</span>
              </div>
            </Link>

            <div className="blog-post-meta__details">
              <span className="blog-post-meta__item">
                <Calendar size={14} aria-hidden="true" />
                <time dateTime={new Date(publishedDate).toISOString()}>
                  {formatDate(publishedDate)}
                </time>
              </span>

              <span className="blog-post-meta__item">
                <Clock size={14} aria-hidden="true" />
                <span>{readingTime} min read</span>
              </span>
            </div>
          </div>
        </header>

        {/* Cover Media */}
        {post.coverImageUrl && (
          <div className="blog-post-cover">
            <img
              src={post.coverImageUrl}
              alt={post.title}
              className="blog-post-cover__image"
              loading="eager"
            />
          </div>
        )}

        {/* Content Body */}
        <div className="blog-post-body">
          <BlogContentRenderer content={post.content} />
        </div>

        {/* Tags Footer */}
        {post.tags && post.tags.length > 0 && (
          <footer className="blog-post-tags" aria-label="Article tags">
            {post.tags.map((tag) => (
              <Link
                key={tag}
                to={`/blog?tag=${encodeURIComponent(tag)}`}
                className="blog-post-tag-link"
              >
                <Badge variant="outline" size="sm">
                  #{tag}
                </Badge>
              </Link>
            ))}
          </footer>
        )}

        {/* Creator Identity Footer Card */}
        <section className="blog-post-author-card" aria-label="About the creator">
          <div className="blog-post-author-card__avatar">
            <User size={28} />
          </div>
          <div className="blog-post-author-card__content">
            <h2 className="blog-post-author-card__title">Written by Sourav</h2>
            <p className="blog-post-author-card__bio">
              Independent engineer building thoughtful, zero-bloat web apps, tools, and developer
              systems on ElseSourav.
            </p>
            <div className="blog-post-author-card__links">
              <Link to={ROUTES.ABOUT} style={{ textDecoration: 'none' }}>
                <Button variant="ghost" size="sm" rightIcon={<ArrowUpRight size={13} />}>
                  Learn More
                </Button>
              </Link>
              <Link to={ROUTES.APPS} style={{ textDecoration: 'none' }}>
                <Button variant="ghost" size="sm" rightIcon={<ArrowUpRight size={13} />}>
                  Explore Apps
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </article>

      {/* Related Posts Section */}
      {relatedPosts.length > 0 && (
        <section className="blog-related-section" aria-label="Related Articles">
          <div className="blog-related-header">
            <h2 className="blog-related-title">Related Articles</h2>
            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', margin: 0 }}>
              More articles in <strong>{post.category}</strong>
            </p>
          </div>

          <div className="blog-related-grid">
            {relatedPosts.map((relPost) => (
              <BlogCard key={relPost.id} post={relPost} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
};
