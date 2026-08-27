import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  BookOpen,
  Eye,
  Edit2,
  Archive,
  CheckCircle,
  XCircle,
  FolderTree,
  AlertCircle,
  ThumbsUp,
  RotateCcw,
} from 'lucide-react';
import {
  Button,
  Badge,
  Input,
  TableSkeleton,
  Dialog,
} from '@/components/ui';
import { helpArticleRepository, helpCategoryRepository } from '@/repositories/help.repository';
import { helpService } from '@/services/help.service';
import type { HelpArticle, HelpCategory } from '@/types/help.types';
import { formatDate } from '@/utils/format';
import { slugify } from '@/utils/slug';
import './AdminHelpPage.css';

type ArticleFilterTab = 'all' | 'published' | 'draft' | 'archived';
type MainTab = 'articles' | 'categories';

export const AdminHelpPage: React.FC = () => {
  const navigate = useNavigate();
  const [mainTab, setMainTab] = useState<MainTab>('articles');

  // Articles State
  const [articles, setArticles] = useState<readonly HelpArticle[]>([]);
  const [categories, setCategories] = useState<readonly HelpCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [articleFilter, setArticleFilter] = useState<ArticleFilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  // Article Preview Modal
  const [previewArticle, setPreviewArticle] = useState<HelpArticle | null>(null);

  // Archive Article Dialog
  const [archiveTarget, setArchiveTarget] = useState<HelpArticle | null>(null);
  const [isArchiving, setIsArchiving] = useState(false);

  // Category Modal State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<HelpCategory | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [categorySlug, setCategorySlug] = useState('');
  const [categoryDesc, setCategoryDesc] = useState('');
  const [categoryOrder, setCategoryOrder] = useState(0);
  const [categoryActive, setCategoryActive] = useState(true);
  const [isCategorySlugManual, setIsCategorySlugManual] = useState(false);
  const [categoryModalError, setCategoryModalError] = useState<string | null>(null);
  const [isCategorySaving, setIsCategorySaving] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const [articlesRes, categoriesRes] = await Promise.all([
      helpArticleRepository.findMany({ limit: 100, orderBy: 'updatedAt', orderDirection: 'desc' }),
      helpCategoryRepository.findMany({ limit: 100, orderBy: 'orderIndex', orderDirection: 'asc' }),
    ]);

    if (articlesRes.success) {
      setArticles(articlesRes.data.items);
    } else {
      setError(articlesRes.error.message);
    }

    if (categoriesRes.success) {
      setCategories(categoriesRes.data.items);
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  // Toggle Publish / Unpublish Article
  const handleTogglePublish = async (article: HelpArticle) => {
    setActionInProgress(article.id);

    if (article.status === 'published') {
      const res = await helpService.unpublishArticle(article.id);
      if (res.success) {
        setArticles((prev) => prev.map((a) => (a.id === article.id ? res.data : a)));
      } else {
        setError(res.error.message);
      }
    } else {
      const res = await helpService.publishArticle(article.id);
      if (res.success) {
        setArticles((prev) => prev.map((a) => (a.id === article.id ? res.data : a)));
      } else {
        setError(res.error.message);
      }
    }

    setActionInProgress(null);
  };

  // Archive / Restore Article
  const handleConfirmArchive = async () => {
    if (!archiveTarget) return;

    setIsArchiving(true);
    const res = await helpService.archiveArticle(archiveTarget.id);
    setIsArchiving(false);
    setArchiveTarget(null);

    if (res.success) {
      setArticles((prev) => prev.map((a) => (a.id === archiveTarget.id ? res.data : a)));
    } else {
      setError(res.error.message);
    }
  };

  const handleRestoreArticle = async (article: HelpArticle) => {
    setActionInProgress(article.id);
    const res = await helpService.restoreArticle(article.id, 'draft');
    setActionInProgress(null);

    if (res.success) {
      setArticles((prev) => prev.map((a) => (a.id === article.id ? res.data : a)));
    } else {
      setError(res.error.message);
    }
  };

  // Category Modal Handlers
  const handleOpenCreateCategory = () => {
    setEditingCategory(null);
    setCategoryName('');
    setCategorySlug('');
    setCategoryDesc('');
    setCategoryOrder(categories.length);
    setCategoryActive(true);
    setIsCategorySlugManual(false);
    setCategoryModalError(null);
    setIsCategoryModalOpen(true);
  };

  const handleOpenEditCategory = (cat: HelpCategory) => {
    setEditingCategory(cat);
    setCategoryName(cat.name);
    setCategorySlug(cat.slug);
    setCategoryDesc(cat.description || '');
    setCategoryOrder(cat.orderIndex || 0);
    setCategoryActive(cat.isActive);
    setIsCategorySlugManual(true);
    setCategoryModalError(null);
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = async () => {
    if (!categoryName.trim()) {
      setCategoryModalError('Category name is required.');
      return;
    }

    const slug = slugify(categorySlug.trim() || categoryName.trim());
    if (!slug) {
      setCategoryModalError('A valid slug is required.');
      return;
    }

    setIsCategorySaving(true);
    setCategoryModalError(null);

    const payload = {
      name: categoryName.trim(),
      slug,
      description: categoryDesc.trim() || undefined,
      orderIndex: Number(categoryOrder) || 0,
      isActive: categoryActive,
    };

    if (editingCategory) {
      const res = await helpService.updateCategory(editingCategory.id, payload);
      if (res.success) {
        setCategories((prev) => prev.map((c) => (c.id === editingCategory.id ? res.data : c)));
        setIsCategoryModalOpen(false);
      } else {
        setCategoryModalError(res.error.message);
      }
    } else {
      const res = await helpService.createCategory(payload);
      if (res.success) {
        setCategories((prev) => [...prev, res.data]);
        setIsCategoryModalOpen(false);
      } else {
        setCategoryModalError(res.error.message);
      }
    }

    setIsCategorySaving(false);
  };

  // Toggle Category Active Status
  const handleToggleCategoryActive = async (cat: HelpCategory) => {
    const res = await helpService.updateCategory(cat.id, { isActive: !cat.isActive });
    if (res.success) {
      setCategories((prev) => prev.map((c) => (c.id === cat.id ? res.data : c)));
    } else {
      setError(res.error.message);
    }
  };

  // Filtered Articles
  const filteredArticles = useMemo(() => {
    let result = [...articles];

    if (articleFilter !== 'all') {
      result = result.filter((a) => a.status === articleFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.slug.toLowerCase().includes(q) ||
          a.excerpt?.toLowerCase().includes(q)
      );
    }

    return result;
  }, [articles, articleFilter, searchQuery]);

  const getCategoryName = (catId: string) => {
    const cat = categories.find((c) => c.id === catId);
    return cat ? cat.name : 'General';
  };

  return (
    <div className="admin-help-page">
      {/* Header */}
      <header className="admin-help-header">
        <div className="admin-help-header__title-group">
          <h1 className="admin-help-header__title">Help Center Management</h1>
          <p className="admin-help-header__subtitle">
            Manage knowledge base documentation, troubleshooting articles, and FAQ categories.
          </p>
        </div>

        <div className="admin-help-header__actions">
          {mainTab === 'articles' ? (
            <Button
              variant="primary"
              size="md"
              onClick={() => navigate('/admin/help/new')}
              leftIcon={<Plus size={16} />}
            >
              New Article
            </Button>
          ) : (
            <Button
              variant="primary"
              size="md"
              onClick={handleOpenCreateCategory}
              leftIcon={<Plus size={16} />}
            >
              Add Category
            </Button>
          )}
        </div>
      </header>

      {/* Main Tabs (Articles vs Categories) */}
      <div className="admin-help-main-tabs" role="tablist">
        <button
          role="tab"
          aria-selected={mainTab === 'articles'}
          className={`admin-help-main-tab ${mainTab === 'articles' ? 'admin-help-main-tab--active' : ''}`}
          onClick={() => setMainTab('articles')}
        >
          <BookOpen size={16} aria-hidden="true" />
          <span>Knowledge Base Articles ({articles.length})</span>
        </button>

        <button
          role="tab"
          aria-selected={mainTab === 'categories'}
          className={`admin-help-main-tab ${mainTab === 'categories' ? 'admin-help-main-tab--active' : ''}`}
          onClick={() => setMainTab('categories')}
        >
          <FolderTree size={16} aria-hidden="true" />
          <span>FAQ Categories ({categories.length})</span>
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="admin-help-error" role="alert">
          <AlertCircle size={18} aria-hidden="true" />
          <span>{error}</span>
          <Button variant="secondary" size="sm" onClick={() => void fetchData()}>
            Retry
          </Button>
        </div>
      )}

      {/* TAB 1: ARTICLES */}
      {mainTab === 'articles' && (
        <div className="admin-help-tab-content">
          {/* Controls Bar */}
          <div className="admin-help-controls">
            <div className="admin-help-status-tabs" role="tablist">
              {(['all', 'published', 'draft', 'archived'] as const).map((tab) => (
                <button
                  key={tab}
                  role="tab"
                  aria-selected={articleFilter === tab}
                  className={`admin-help-status-tab ${
                    articleFilter === tab ? 'admin-help-status-tab--active' : ''
                  }`}
                  onClick={() => setArticleFilter(tab)}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  <span className="admin-help-tab-count">
                    {tab === 'all'
                      ? articles.length
                      : articles.filter((a) => a.status === tab).length}
                  </span>
                </button>
              ))}
            </div>

            <div className="admin-help-search">
              <Input
                type="search"
                placeholder="Search articles by title, slug..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search size={15} />}
                aria-label="Search articles"
              />
            </div>
          </div>

          {/* Articles Table */}
          <div className="admin-help-table-wrapper" role="region" aria-label="Help Articles">
            {isLoading ? (
              <TableSkeleton rows={4} columns={6} />
            ) : filteredArticles.length === 0 ? (
              <div className="admin-help-empty">
                <BookOpen size={42} aria-hidden="true" />
                <h2 className="admin-help-empty__title">No Documentation Articles Found</h2>
                <p className="admin-help-empty__desc">
                  {searchQuery || articleFilter !== 'all'
                    ? 'No articles match your active filter criteria.'
                    : 'Start documenting your software guides and troubleshooting solutions.'}
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate('/admin/help/new')}
                  leftIcon={<Plus size={15} />}
                >
                  Create Article
                </Button>
              </div>
            ) : (
              <table className="admin-help-table">
                <thead>
                  <tr>
                    <th scope="col">Article</th>
                    <th scope="col">Category</th>
                    <th scope="col">Status</th>
                    <th scope="col">Helpfulness</th>
                    <th scope="col">Updated</th>
                    <th scope="col" style={{ textAlign: 'right' }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredArticles.map((art) => (
                    <tr key={art.id} className="admin-help-row">
                      {/* Title & Slug */}
                      <td>
                        <div className="admin-help-identity">
                          <Link to={`/admin/help/${art.id}/edit`} className="admin-help-title-link">
                            {art.title}
                          </Link>
                          <span className="admin-help-slug">/{art.slug}</span>
                        </div>
                      </td>

                      {/* Category */}
                      <td>
                        <Badge variant="default" size="sm">
                          {getCategoryName(art.categoryId)}
                        </Badge>
                      </td>

                      {/* Status */}
                      <td>
                        <Badge
                          variant={
                            art.status === 'published'
                              ? 'success'
                              : art.status === 'archived'
                                ? 'warning'
                                : 'default'
                          }
                          size="sm"
                        >
                          {art.status.toUpperCase()}
                        </Badge>
                      </td>

                      {/* Helpfulness */}
                      <td>
                        <div className="admin-help-feedback-stat">
                          <ThumbsUp size={13} aria-hidden="true" />
                          <span>{art.helpfulCount || 0} helpful</span>
                        </div>
                      </td>

                      {/* Updated Date */}
                      <td>
                        <span className="admin-help-date">{formatDate(art.updatedAt)}</span>
                      </td>

                      {/* Actions */}
                      <td style={{ textAlign: 'right' }}>
                        <div className="admin-help-actions">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setPreviewArticle(art)}
                            title="Preview Article"
                            aria-label={`Preview ${art.title}`}
                            leftIcon={<Eye size={14} />}
                          />

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/admin/help/${art.id}/edit`)}
                            title="Edit Article"
                            aria-label={`Edit ${art.title}`}
                            leftIcon={<Edit2 size={14} />}
                          />

                          {art.status !== 'archived' && (
                            <Button
                              variant={art.status === 'published' ? 'secondary' : 'primary'}
                              size="sm"
                              disabled={actionInProgress === art.id}
                              onClick={() => void handleTogglePublish(art)}
                              title={art.status === 'published' ? 'Unpublish' : 'Publish'}
                              aria-label={
                                art.status === 'published'
                                  ? `Unpublish ${art.title}`
                                  : `Publish ${art.title}`
                              }
                              leftIcon={
                                art.status === 'published' ? (
                                  <XCircle size={14} />
                                ) : (
                                  <CheckCircle size={14} />
                                )
                              }
                            >
                              {art.status === 'published' ? 'Unpublish' : 'Publish'}
                            </Button>
                          )}

                          {art.status === 'archived' ? (
                            <Button
                              variant="secondary"
                              size="sm"
                              disabled={actionInProgress === art.id}
                              onClick={() => void handleRestoreArticle(art)}
                              title="Restore Article"
                              aria-label={`Restore ${art.title}`}
                              leftIcon={<RotateCcw size={14} />}
                            >
                              Restore
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="admin-help-btn--danger"
                              onClick={() => setArchiveTarget(art)}
                              title="Archive Article"
                              aria-label={`Archive ${art.title}`}
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
        </div>
      )}

      {/* TAB 2: FAQ CATEGORIES */}
      {mainTab === 'categories' && (
        <div className="admin-help-tab-content">
          <div className="admin-help-table-wrapper" role="region" aria-label="Help Categories">
            {categories.length === 0 ? (
              <div className="admin-help-empty">
                <FolderTree size={40} aria-hidden="true" />
                <h2 className="admin-help-empty__title">No Help Categories Configured</h2>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleOpenCreateCategory}
                  leftIcon={<Plus size={15} />}
                >
                  Create Help Category
                </Button>
              </div>
            ) : (
              <table className="admin-help-table">
                <thead>
                  <tr>
                    <th scope="col" style={{ width: '60px' }}>
                      Order
                    </th>
                    <th scope="col">Name & Slug</th>
                    <th scope="col">Description</th>
                    <th scope="col">Status</th>
                    <th scope="col" style={{ textAlign: 'right' }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((cat) => (
                    <tr key={cat.id} className="admin-help-row">
                      <td>
                        <Badge variant="mono" size="sm">
                          #{cat.orderIndex}
                        </Badge>
                      </td>
                      <td>
                        <div className="admin-help-identity">
                          <span className="admin-help-name">{cat.name}</span>
                          <span className="admin-help-slug">/{cat.slug}</span>
                        </div>
                      </td>
                      <td>
                        <span className="admin-help-desc">
                          {cat.description || <span className="text-muted">No description</span>}
                        </span>
                      </td>
                      <td>
                        <Badge variant={cat.isActive ? 'success' : 'default'} size="sm">
                          {cat.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div className="admin-help-actions">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenEditCategory(cat)}
                            title="Edit Category"
                            aria-label={`Edit ${cat.name}`}
                            leftIcon={<Edit2 size={14} />}
                          />
                          <Button
                            variant={cat.isActive ? 'ghost' : 'secondary'}
                            size="sm"
                            onClick={() => void handleToggleCategoryActive(cat)}
                            title={cat.isActive ? 'Deactivate' : 'Activate'}
                            aria-label={
                              cat.isActive ? `Deactivate ${cat.name}` : `Activate ${cat.name}`
                            }
                            leftIcon={
                              cat.isActive ? <XCircle size={14} /> : <CheckCircle size={14} />
                            }
                          >
                            {cat.isActive ? 'Deactivate' : 'Activate'}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Category Modal */}
      <Dialog
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        title={editingCategory ? 'Edit Help Category' : 'New Help Category'}
        description="Configure documentation taxonomy groups."
      >
        <div className="admin-help-form">
          {categoryModalError && (
            <div className="admin-help-error" role="alert">
              <AlertCircle size={16} aria-hidden="true" />
              <span>{categoryModalError}</span>
            </div>
          )}

          <div className="admin-help-form-field">
            <label htmlFor="help-cat-name" className="admin-help-label">
              Category Name <span className="text-danger">*</span>
            </label>
            <Input
              id="help-cat-name"
              value={categoryName}
              onChange={(e) => {
                setCategoryName(e.target.value);
                if (!editingCategory && !isCategorySlugManual) {
                  setCategorySlug(slugify(e.target.value));
                }
              }}
              placeholder="e.g. Getting Started, Troubleshooting"
              required
            />
          </div>

          <div className="admin-help-form-field">
            <label htmlFor="help-cat-slug" className="admin-help-label">
              URL Slug <span className="text-danger">*</span>
            </label>
            <Input
              id="help-cat-slug"
              value={categorySlug}
              onChange={(e) => {
                setIsCategorySlugManual(true);
                setCategorySlug(slugify(e.target.value));
              }}
              placeholder="e.g. getting-started"
              required
            />
          </div>

          <div className="admin-help-form-field">
            <label htmlFor="help-cat-desc" className="admin-help-label">
              Description
            </label>
            <Input
              id="help-cat-desc"
              value={categoryDesc}
              onChange={(e) => setCategoryDesc(e.target.value)}
              placeholder="Summary of articles under this category..."
            />
          </div>

          <div className="admin-help-form-field">
            <label htmlFor="help-cat-order" className="admin-help-label">
              Order Index
            </label>
            <Input
              id="help-cat-order"
              type="number"
              value={categoryOrder}
              onChange={(e) => setCategoryOrder(Number(e.target.value))}
            />
          </div>

          <label className="admin-help-checkbox-row">
            <input
              type="checkbox"
              checked={categoryActive}
              onChange={(e) => setCategoryActive(e.target.checked)}
            />
            <span>Active (Visible on public help center)</span>
          </label>

          <div className="admin-help-dialog-actions">
            <Button variant="secondary" onClick={() => setIsCategoryModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => void handleSaveCategory()}
              isLoading={isCategorySaving}
            >
              {editingCategory ? 'Save Changes' : 'Create Category'}
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Article Preview Modal */}
      <Dialog
        isOpen={Boolean(previewArticle)}
        onClose={() => setPreviewArticle(null)}
        title={`Preview: ${previewArticle?.title || 'Article'}`}
        size="lg"
      >
        {previewArticle && (
          <div className="admin-help-preview-content">
            <div className="admin-help-preview-header">
              <Badge variant="default" size="sm">
                {getCategoryName(previewArticle.categoryId)}
              </Badge>
              <h2 className="admin-help-preview-title">{previewArticle.title}</h2>
              {previewArticle.excerpt && (
                <p className="admin-help-preview-excerpt">{previewArticle.excerpt}</p>
              )}
            </div>

            <div className="admin-help-preview-body">
              <pre className="admin-help-markdown-preview">{previewArticle.content}</pre>
            </div>

            <div className="admin-help-preview-actions">
              <Button variant="secondary" onClick={() => setPreviewArticle(null)}>
                Close Preview
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  setPreviewArticle(null);
                  navigate(`/admin/help/${previewArticle.id}/edit`);
                }}
                leftIcon={<Edit2 size={15} />}
              >
                Edit Article
              </Button>
            </div>
          </div>
        )}
      </Dialog>

      {/* Archive Confirmation Dialog */}
      <Dialog
        isOpen={Boolean(archiveTarget)}
        onClose={() => setArchiveTarget(null)}
        title="Archive Help Article"
        description={`Are you sure you want to archive "${archiveTarget?.title}"? It will be unpublished from the Help Center knowledge base.`}
      >
        <div className="admin-help-dialog-actions">
          <Button variant="secondary" onClick={() => setArchiveTarget(null)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => void handleConfirmArchive()}
            isLoading={isArchiving}
          >
            Archive Article
          </Button>
        </div>
      </Dialog>
    </div>
  );
};
