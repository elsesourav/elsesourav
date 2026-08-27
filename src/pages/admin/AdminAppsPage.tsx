import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Package,
  Plus,
  Search,
  Eye,
  Edit2,
  Archive,
  RotateCcw,
  CheckCircle,
  XCircle,
  Star,
  Pin,
  AlertCircle,
} from 'lucide-react';
import { Button, Badge, Input, Skeleton, Dialog } from '@/components/ui';
import { AppIcon } from '@/components/apps';
import { appRepository } from '@/repositories';
import { appService } from '@/services/app.service';
import type { App, AppStatus } from '@/types/app.types';
import { ROUTES } from '@/constants/routes';
import { formatDate } from '@/utils/format';
import './AdminAppsPage.css';

type FilterStatus = 'all' | 'published' | 'draft' | 'archived';
type SortOption = 'newest' | 'updated' | 'name' | 'status';

export const AdminAppsPage: React.FC = () => {
  const navigate = useNavigate();
  const [apps, setApps] = useState<readonly App[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters and sorting
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [sortBy, setSortBy] = useState<SortOption>('updated');

  // Actions in progress
  const [actionInProgressId, setActionInProgressId] = useState<string | null>(null);

  // Preview Modal State
  const [previewApp, setPreviewApp] = useState<App | null>(null);

  // Archive confirmation modal state
  const [archiveTargetApp, setArchiveTargetApp] = useState<App | null>(null);
  const [isArchiving, setIsArchiving] = useState(false);

  const fetchApps = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const res = await appRepository.findMany({
      limit: 100,
      orderBy: 'updatedAt',
      orderDirection: 'desc',
    });

    if (res.success) {
      setApps(res.data.items);
    } else {
      setError(res.error.message);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    void fetchApps();
  }, [fetchApps]);

  // Handle Publish / Unpublish Toggle
  const handleTogglePublish = async (app: App) => {
    setActionInProgressId(app.id);

    if (app.status === 'published') {
      const res = await appService.unpublishApp(app.id);
      if (res.success) {
        setApps((prev) => prev.map((a) => (a.id === app.id ? res.data : a)));
      } else {
        setError(res.error.message);
      }
    } else {
      const res = await appService.publishApp(app.id);
      if (res.success) {
        setApps((prev) => prev.map((a) => (a.id === app.id ? res.data : a)));
      } else {
        setError(res.error.message);
      }
    }

    setActionInProgressId(null);
  };

  // Handle Archive Confirmation
  const handleConfirmArchive = async () => {
    if (!archiveTargetApp) return;

    setIsArchiving(true);
    const res = await appService.archiveApp(archiveTargetApp.id);
    setIsArchiving(false);
    setArchiveTargetApp(null);

    if (res.success) {
      setApps((prev) => prev.map((a) => (a.id === archiveTargetApp.id ? res.data : a)));
    } else {
      setError(res.error.message);
    }
  };

  // Handle Restore
  const handleRestoreApp = async (app: App) => {
    setActionInProgressId(app.id);
    const res = await appService.restoreApp(app.id, 'draft');
    setActionInProgressId(null);

    if (res.success) {
      setApps((prev) => prev.map((a) => (a.id === app.id ? res.data : a)));
    } else {
      setError(res.error.message);
    }
  };

  // Filter and Sort Logic
  const filteredAndSortedApps = useMemo(() => {
    let result = [...apps];

    // Status Filter
    if (statusFilter !== 'all') {
      result = result.filter((a) => a.status === statusFilter);
    }

    // Search Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.slug.toLowerCase().includes(q) ||
          a.primaryCategory.toLowerCase().includes(q) ||
          a.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return b.createdAt - a.createdAt;
        case 'updated':
          return b.updatedAt - a.updatedAt;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return b.updatedAt - a.updatedAt;
      }
    });

    return result;
  }, [apps, statusFilter, searchQuery, sortBy]);

  const renderStatusBadge = (status: AppStatus) => {
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
    <div className="admin-apps-page">
      {/* Header */}
      <header className="admin-apps-header">
        <div className="admin-apps-header__title-group">
          <h1 className="admin-apps-header__title">Applications</h1>
          <p className="admin-apps-header__subtitle">
            Manage your software portfolio, release new versions, update platform links, and control
            visibility.
          </p>
        </div>

        <Link to={ROUTES.ADMIN.APPS_NEW} style={{ textDecoration: 'none' }}>
          <Button variant="primary" size="md" leftIcon={<Plus size={16} />}>
            Create Application
          </Button>
        </Link>
      </header>

      {/* Error Alert */}
      {error && (
        <div className="admin-apps-error" role="alert">
          <AlertCircle size={18} aria-hidden="true" />
          <span>{error}</span>
          <Button variant="secondary" size="sm" onClick={() => void fetchApps()}>
            Retry
          </Button>
        </div>
      )}

      {/* Controls Bar: Filters, Search, Sorting */}
      <div className="admin-apps-controls">
        {/* Status Tabs */}
        <div className="admin-apps-tabs" role="tablist" aria-label="Filter applications by status">
          {(['all', 'published', 'draft', 'archived'] as const).map((tab) => (
            <button
              key={tab}
              role="tab"
              aria-selected={statusFilter === tab}
              className={`admin-apps-tab ${statusFilter === tab ? 'admin-apps-tab--active' : ''}`}
              onClick={() => setStatusFilter(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              <span className="admin-apps-tab__count">
                {tab === 'all' ? apps.length : apps.filter((a) => a.status === tab).length}
              </span>
            </button>
          ))}
        </div>

        {/* Search & Sort Controls */}
        <div className="admin-apps-filters-row">
          <div className="admin-apps-search">
            <Input
              type="search"
              placeholder="Search by name, slug, tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search size={15} />}
              aria-label="Search applications"
            />
          </div>

          <div className="admin-apps-sort">
            <label htmlFor="admin-apps-sort-select" className="admin-apps-sort__label">
              Sort by:
            </label>
            <select
              id="admin-apps-sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="admin-apps-sort__select"
            >
              <option value="updated">Recently Updated</option>
              <option value="newest">Newest First</option>
              <option value="name">Name (A-Z)</option>
              <option value="status">Status</option>
            </select>
          </div>
        </div>
      </div>

      {/* Applications Table / List */}
      <div className="admin-apps-table-wrapper" role="region" aria-label="Applications List">
        {isLoading ? (
          <div className="admin-apps-loading" aria-busy="true" aria-label="Loading applications">
            {[1, 2, 3, 4, 5].map((n) => (
              <div key={n} className="admin-apps-skeleton-row">
                <Skeleton variant="circular" width="40px" height="40px" />
                <div style={{ flex: 1 }}>
                  <Skeleton variant="text" width="40%" height="20px" className="mb-1" />
                  <Skeleton variant="text" width="60%" height="14px" />
                </div>
                <Skeleton variant="rectangular" width="80px" height="24px" />
                <Skeleton variant="rectangular" width="120px" height="32px" />
              </div>
            ))}
          </div>
        ) : filteredAndSortedApps.length === 0 ? (
          <div className="admin-apps-empty">
            <Package size={42} aria-hidden="true" />
            <h2 className="admin-apps-empty__title">No Applications Found</h2>
            <p className="admin-apps-empty__desc">
              {searchQuery || statusFilter !== 'all'
                ? 'No software matches your active filter or search query. Try clearing your filters.'
                : 'You have not added any applications yet. Create your first software tool to publish.'}
            </p>
            {searchQuery || statusFilter !== 'all' ? (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                }}
              >
                Clear Filters
              </Button>
            ) : (
              <Link to={ROUTES.ADMIN.APPS_NEW} style={{ textDecoration: 'none' }}>
                <Button variant="primary" size="sm" leftIcon={<Plus size={15} />}>
                  Create Application
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <table className="admin-apps-table">
            <thead>
              <tr>
                <th scope="col">Application</th>
                <th scope="col">Category</th>
                <th scope="col">Status</th>
                <th scope="col">Version</th>
                <th scope="col">Platforms</th>
                <th scope="col">Updated</th>
                <th scope="col" style={{ textAlign: 'right' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedApps.map((app) => (
                <tr key={app.id} className="admin-apps-row">
                  {/* Application Column */}
                  <td className="admin-apps-cell--main">
                    <div className="admin-apps-identity">
                      <AppIcon
                        iconUrl={app.iconUrl}
                        name={app.name}
                        size="sm"
                        className="admin-apps-table-icon"
                      />
                      <div className="admin-apps-meta">
                        <div className="admin-apps-name-row">
                          <Link to={`/admin/apps/${app.id}/edit`} className="admin-apps-name-link">
                            {app.name}
                          </Link>
                          {app.isFeatured && (
                            <span title="Featured Software" aria-label="Featured">
                              <Star size={13} fill="#f59e0b" color="#f59e0b" />
                            </span>
                          )}
                          {app.isPinned && (
                            <span title="Pinned Software" aria-label="Pinned">
                              <Pin size={13} fill="#3b82f6" color="#3b82f6" />
                            </span>
                          )}
                        </div>
                        <span className="admin-apps-slug">/{app.slug}</span>
                      </div>
                    </div>
                  </td>

                  {/* Category Column */}
                  <td>
                    <span className="admin-apps-category-badge">
                      {app.primaryCategory.replace('-', ' ')}
                    </span>
                  </td>

                  {/* Status Column */}
                  <td>{renderStatusBadge(app.status)}</td>

                  {/* Version Column */}
                  <td>
                    <Badge variant="mono" size="sm">
                      v{app.currentVersion || '1.0.0'}
                    </Badge>
                  </td>

                  {/* Platforms Column */}
                  <td>
                    <div className="admin-apps-platforms-list">
                      {app.platforms && app.platforms.length > 0 ? (
                        app.platforms.slice(0, 3).map((plat) => (
                          <span key={plat} className="admin-apps-platform-pill">
                            {plat}
                          </span>
                        ))
                      ) : (
                        <span className="admin-apps-muted-text">None</span>
                      )}
                      {app.platforms && app.platforms.length > 3 && (
                        <span className="admin-apps-platform-more">
                          +{app.platforms.length - 3}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Updated Date Column */}
                  <td>
                    <span className="admin-apps-date">{formatDate(app.updatedAt)}</span>
                  </td>

                  {/* Actions Column */}
                  <td className="admin-apps-cell--actions">
                    <div className="admin-apps-action-btns">
                      {/* Preview Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        aria-label={`Preview ${app.name}`}
                        title="Preview Public Page"
                        onClick={() => setPreviewApp(app)}
                        leftIcon={<Eye size={14} />}
                      />

                      {/* Edit Button */}
                      <Link to={`/admin/apps/${app.id}/edit`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          aria-label={`Edit ${app.name}`}
                          title="Edit Application"
                          leftIcon={<Edit2 size={14} />}
                        />
                      </Link>

                      {/* Publish / Unpublish Toggle */}
                      {app.status !== 'archived' && (
                        <Button
                          variant={app.status === 'published' ? 'secondary' : 'primary'}
                          size="sm"
                          disabled={actionInProgressId === app.id}
                          onClick={() => void handleTogglePublish(app)}
                          title={app.status === 'published' ? 'Unpublish App' : 'Publish App'}
                          aria-label={
                            app.status === 'published'
                              ? `Unpublish ${app.name}`
                              : `Publish ${app.name}`
                          }
                          leftIcon={
                            app.status === 'published' ? (
                              <XCircle size={14} />
                            ) : (
                              <CheckCircle size={14} />
                            )
                          }
                        >
                          {app.status === 'published' ? 'Unpublish' : 'Publish'}
                        </Button>
                      )}

                      {/* Archive / Restore Button */}
                      {app.status === 'archived' ? (
                        <Button
                          variant="secondary"
                          size="sm"
                          disabled={actionInProgressId === app.id}
                          onClick={() => void handleRestoreApp(app)}
                          title="Restore App"
                          aria-label={`Restore ${app.name}`}
                          leftIcon={<RotateCcw size={14} />}
                        >
                          Restore
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="admin-apps-btn--danger"
                          onClick={() => setArchiveTargetApp(app)}
                          title="Archive App"
                          aria-label={`Archive ${app.name}`}
                          leftIcon={<Archive size={14} />}
                        />
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Archive Confirmation Dialog */}
      <Dialog
        isOpen={Boolean(archiveTargetApp)}
        onClose={() => setArchiveTargetApp(null)}
        title="Archive Application"
        description={`Are you sure you want to archive "${archiveTargetApp?.name}"? The software will be unpublished and hidden from the public catalog, but its data and library bookmarks will remain intact.`}
      >
        <div className="admin-apps-dialog-actions">
          <Button variant="secondary" onClick={() => setArchiveTargetApp(null)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => void handleConfirmArchive()}
            isLoading={isArchiving}
            leftIcon={<Archive size={15} />}
          >
            Archive Application
          </Button>
        </div>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog
        isOpen={Boolean(previewApp)}
        onClose={() => setPreviewApp(null)}
        title={`Preview: ${previewApp?.name || 'Application'}`}
        size="lg"
      >
        {previewApp && (
          <div className="admin-apps-preview-content">
            <div className="admin-apps-preview-hero">
              <AppIcon
                iconUrl={previewApp.iconUrl}
                name={previewApp.name}
                size="lg"
                className="admin-apps-preview-app-icon"
              />
              <div>
                <h3 className="admin-apps-preview-name">{previewApp.name}</h3>
                <p className="admin-apps-preview-sub">{previewApp.shortDescription}</p>
                <div className="admin-apps-preview-badges">
                  <Badge variant="default" size="sm">
                    {previewApp.primaryCategory}
                  </Badge>
                  <Badge variant="mono" size="sm">
                    v{previewApp.currentVersion || '1.0.0'}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="admin-apps-preview-desc">
              <h4>Overview</h4>
              <p>{previewApp.description}</p>
            </div>

            {previewApp.links && previewApp.links.length > 0 && (
              <div className="admin-apps-preview-links">
                <h4>Platform Destinations</h4>
                <div className="admin-apps-preview-links-grid">
                  {previewApp.links.map((link) => (
                    <div key={link.id} className="admin-apps-preview-link-card">
                      <span className="admin-apps-preview-link-plat">{link.platform}</span>
                      <span className="admin-apps-preview-link-label">{link.label}</span>
                      {link.isPrimary && (
                        <Badge variant="accent" size="sm">
                          Primary Action
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="admin-apps-preview-actions">
              <Button variant="secondary" onClick={() => setPreviewApp(null)}>
                Close Preview
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  setPreviewApp(null);
                  navigate(`/admin/apps/${previewApp.id}/edit`);
                }}
                leftIcon={<Edit2 size={15} />}
              >
                Edit Application
              </Button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
};
