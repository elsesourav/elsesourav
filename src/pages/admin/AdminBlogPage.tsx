import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  PenSquare,
  Plus,
  Search,
  BookOpen,
  Calendar,
  Clock,
  Eye,
  Archive,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { Badge, Button, Input, Skeleton, EmptyState, ErrorState } from '@/components';
import { blogRepository } from '@/repositories';
import { blogService } from '@/services';
import type { BlogPost, BlogPostStatus } from '@/types/blog.types';
import { ROUTES } from '@/constants/routes';
import { formatDate } from '@/utils/format';
import './AdminBlogPage.css';

type FilterTab = 'all' | 'published' | 'draft' | 'archived';

export const AdminBlogPage: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  const fetchPosts = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const result = await blogRepository.findMany({
      limit: 100,
      orderBy: 'updatedAt',
      orderDirection: 'desc',
    });

    if (result.success) {
      setPosts([...result.data.items]);
    } else {
      setError(result.error.message);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    void fetchPosts();
  }, [fetchPosts]);

  const handleTogglePublish = async (post: BlogPost) => {
    setActionInProgress(post.id);
    if (post.status === 'published') {
      const result = await blogService.unpublishPost(post.id);
      if (result.success) {
        setPosts((prev) => prev.map((p) => (p.id === post.id ? result.data : p)));
      }
    } else {
      const result = await blogService.publishPost(post.id);
      if (result.success) {
        setPosts((prev) => prev.map((p) => (p.id === post.id ? result.data : p)));
      }
    }
    setActionInProgress(null);
  };

  const handleToggleArchive = async (post: BlogPost) => {
    setActionInProgress(post.id);
    if (post.status === 'archived') {
      const result = await blogService.restorePost(post.id, 'draft');
      if (result.success) {
        setPosts((prev) => prev.map((p) => (p.id === post.id ? result.data : p)));
      }
    } else {
      const result = await blogService.archivePost(post.id);
      if (result.success) {
        setPosts((prev) => prev.map((p) => (p.id === post.id ? result.data : p)));
      }
    }
    setActionInProgress(null);
  };

  const filteredPosts = posts.filter((post) => {
    if (activeTab !== 'all' && post.status !== activeTab) {
      return false;
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      return (
        post.title.toLowerCase().includes(query) ||
        post.slug.toLowerCase().includes(query) ||
        post.category.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const renderStatusBadge = (status: BlogPostStatus) => {
    switch (status) {
      case 'published':
        return (
          <Badge variant="success" size="sm">
            Published
          </Badge>
        );
      case 'draft':
        return (
          <Badge variant="default" size="sm">
            Draft
          </Badge>
        );
      case 'archived':
        return (
          <Badge variant="warning" size="sm">
            Archived
          </Badge>
        );
    }
  };

  return (
    <main className="admin-blog-page">
      {/* Header */}
      <header className="admin-blog-header">
        <div className="admin-blog-header__title-group">
          <h1 className="admin-blog-header__title">Blog Articles</h1>
          <p className="admin-blog-header__subtitle">
            Create, edit, and publish engineering deep dives, devlogs, and release notes.
          </p>
        </div>

        <Link to={ROUTES.ADMIN.BLOG_NEW} style={{ textDecoration: 'none' }}>
          <Button variant="primary" size="md" leftIcon={<Plus size={16} />}>
            Write Article
          </Button>
        </Link>
      </header>

      {/* Filter and Search Controls */}
      <div className="admin-blog-controls">
        <div className="admin-blog-tabs" role="tablist" aria-label="Article Status Filters">
          {(['all', 'published', 'draft', 'archived'] as const).map((tab) => (
            <button
              key={tab}
              role="tab"
              aria-selected={activeTab === tab}
              className={`admin-blog-tab ${activeTab === tab ? 'admin-blog-tab--active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <div className="admin-blog-search">
          <Input
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search size={16} />}
            inputSize="sm"
          />
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="admin-blog-list" data-testid="admin-blog-skeleton">
          <Skeleton variant="rounded" height={80} />
          <Skeleton variant="rounded" height={80} />
          <Skeleton variant="rounded" height={80} />
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <ErrorState
          title="Failed to Load Articles"
          description={error}
          action={
            <Button variant="secondary" size="sm" onClick={() => void fetchPosts()}>
              Retry
            </Button>
          }
        />
      )}

      {/* Empty State */}
      {!isLoading && !error && filteredPosts.length === 0 && (
        <EmptyState
          icon={<BookOpen size={36} />}
          title="No Articles Found"
          description={
            searchQuery
              ? `No articles match "${searchQuery}".`
              : activeTab === 'all'
                ? 'Get started by publishing your first article.'
                : `No articles in "${activeTab}" status.`
          }
          action={
            <Link to={ROUTES.ADMIN.BLOG_NEW}>
              <Button variant="primary" size="sm" leftIcon={<Plus size={14} />}>
                Create Post
              </Button>
            </Link>
          }
        />
      )}

      {/* Article List */}
      {!isLoading && !error && filteredPosts.length > 0 && (
        <div className="admin-blog-list">
          {filteredPosts.map((post) => (
            <div key={post.id} className="admin-blog-card">
              <div className="admin-blog-card__main">
                <div className="admin-blog-card__header">
                  <h2 className="admin-blog-card__title">{post.title}</h2>
                  {renderStatusBadge(post.status)}
                  <Badge variant="outline" size="sm">
                    {post.category}
                  </Badge>
                  {post.isFeatured && (
                    <Badge variant="accent" size="sm">
                      Featured
                    </Badge>
                  )}
                </div>

                <div className="admin-blog-card__slug">/{post.slug}</div>

                <div className="admin-blog-card__meta">
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={13} />
                    {formatDate(post.publishedAt || post.createdAt)}
                  </span>

                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={13} />
                    {post.readingTime || post.readingTimeMinutes || 1} min read
                  </span>

                  {post.viewsCount !== undefined && post.viewsCount > 0 && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Eye size={13} />
                      {post.viewsCount} views
                    </span>
                  )}
                </div>
              </div>

              <div className="admin-blog-card__actions">
                <Link to={`/admin/blog/${post.id}/edit`} style={{ textDecoration: 'none' }}>
                  <Button variant="secondary" size="sm" leftIcon={<PenSquare size={14} />}>
                    Edit
                  </Button>
                </Link>

                <Button
                  variant="ghost"
                  size="sm"
                  disabled={actionInProgress === post.id}
                  onClick={() => void handleTogglePublish(post)}
                  leftIcon={
                    post.status === 'published' ? <XCircle size={14} /> : <CheckCircle size={14} />
                  }
                >
                  {post.status === 'published' ? 'Unpublish' : 'Publish'}
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  disabled={actionInProgress === post.id}
                  onClick={() => void handleToggleArchive(post)}
                  leftIcon={<Archive size={14} />}
                >
                  {post.status === 'archived' ? 'Restore' : 'Archive'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
};
