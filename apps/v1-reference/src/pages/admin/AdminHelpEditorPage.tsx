import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Send, Eye, Archive, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Badge, Button, Input, Skeleton, Dialog } from '@/components/ui';
import { helpArticleRepository, helpCategoryRepository } from '@/repositories/help.repository';
import { helpService } from '@/services/help.service';
import type { HelpCategory, HelpArticleStatus } from '@/types/help.types';
import { ROUTES } from '@/constants/routes';
import { slugify } from '@/utils/slug';
import './AdminHelpEditorPage.css';

export const AdminHelpEditorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [categories, setCategories] = useState<readonly HelpCategory[]>([]);
  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<readonly string[]>([]);
  const [isDirty, setIsDirty] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState<HelpArticleStatus>('draft');
  const [orderIndex, setOrderIndex] = useState(0);
  const [isFeatured, setIsFeatured] = useState(false);
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [isSlugManual, setIsSlugManual] = useState(false);

  // Preview Dialog
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Archive Modal
  const [isArchiveConfirmOpen, setIsArchiveConfirmOpen] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const catRes = await helpCategoryRepository.findMany({
      limit: 100,
      orderBy: 'orderIndex',
      orderDirection: 'asc',
    });

    if (catRes.success) {
      setCategories(catRes.data.items);
      if (catRes.data.items.length > 0 && !categoryId) {
        setCategoryId(catRes.data.items[0]?.id || '');
      }
    }

    if (isEditing && id) {
      const artRes = await helpArticleRepository.findById(id);
      if (artRes.success && artRes.data) {
        const art = artRes.data;
        setTitle(art.title);
        setSlug(art.slug);
        setCategoryId(art.categoryId);
        setExcerpt(art.excerpt || '');
        setContent(art.content);
        setStatus(art.status);
        setOrderIndex(art.orderIndex || 0);
        setIsFeatured(art.featured || false);
        setSeoTitle(art.seoTitle || '');
        setSeoDescription(art.seoDescription || '');
        setIsSlugManual(true);
        setIsDirty(false);
      } else {
        setError(artRes.success ? 'Article not found' : artRes.error.message);
      }
    }

    setIsLoading(false);
  }, [id, isEditing, categoryId]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  // Unsaved changes listener
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    setIsDirty(true);
    if (!isEditing && !isSlugManual) {
      setSlug(slugify(val));
    }
  };

  const handleSaveDraft = async () => {
    if (!title.trim()) {
      setError('Article title is required.');
      return;
    }

    const cleanSlug = slugify(slug.trim() || title.trim());
    if (!cleanSlug) {
      setError('A valid slug is required.');
      return;
    }

    setIsSaving(true);
    setError(null);
    setValidationErrors([]);
    setSuccessMessage(null);

    const payload = {
      title: title.trim(),
      slug: cleanSlug,
      categoryId: categoryId || (categories[0]?.id ?? 'default'),
      excerpt: excerpt.trim() || undefined,
      content: content.trim() || '',
      orderIndex: Number(orderIndex) || 0,
      featured: isFeatured,
      seoTitle: seoTitle.trim() || undefined,
      seoDescription: seoDescription.trim() || undefined,
    };

    if (isEditing && id) {
      const res = await helpService.updateDraft(id, payload);
      if (res.success) {
        setSuccessMessage('Draft saved successfully.');
        setIsDirty(false);
      } else {
        setError(res.error.message);
      }
    } else {
      const res = await helpService.createDraft(payload);
      if (res.success) {
        setIsDirty(false);
        navigate(`/admin/help/${res.data.id}/edit`, { replace: true });
      } else {
        setError(res.error.message);
      }
    }

    setIsSaving(false);
  };

  const handlePublish = async () => {
    setError(null);
    setValidationErrors([]);
    setSuccessMessage(null);

    const missing: string[] = [];
    if (!title.trim()) missing.push('Article title is required');
    if (!slug.trim()) missing.push('Slug is required');
    if (!categoryId.trim()) missing.push('Category selection is required');
    if (!content.trim()) missing.push('Article content cannot be empty');

    if (missing.length > 0) {
      setValidationErrors(missing);
      return;
    }

    setIsPublishing(true);

    const payload = {
      title: title.trim(),
      slug: slugify(slug.trim() || title.trim()),
      categoryId: categoryId || (categories[0]?.id ?? 'default'),
      excerpt: excerpt.trim() || undefined,
      content: content.trim(),
      orderIndex: Number(orderIndex) || 0,
      featured: isFeatured,
      seoTitle: seoTitle.trim() || undefined,
      seoDescription: seoDescription.trim() || undefined,
    };

    if (isEditing && id) {
      const updateRes = await helpService.updateDraft(id, payload);
      if (updateRes.success) {
        const pubRes = await helpService.publishArticle(id);
        if (pubRes.success) {
          setStatus('published');
          setSuccessMessage('Article published successfully to knowledge base.');
          setIsDirty(false);
        } else {
          setError(pubRes.error.message);
        }
      } else {
        setError(updateRes.error.message);
      }
    } else {
      const createRes = await helpService.createDraft(payload);
      if (createRes.success) {
        const pubRes = await helpService.publishArticle(createRes.data.id);
        if (pubRes.success) {
          setIsDirty(false);
          navigate(`/admin/help/${createRes.data.id}/edit`, { replace: true });
        } else {
          setError(pubRes.error.message);
        }
      } else {
        setError(createRes.error.message);
      }
    }

    setIsPublishing(false);
  };

  const handleConfirmArchive = async () => {
    if (!id) return;
    setIsSaving(true);
    const res = await helpService.archiveArticle(id);
    setIsSaving(false);
    setIsArchiveConfirmOpen(false);

    if (res.success) {
      setStatus('archived');
      setSuccessMessage('Article archived successfully.');
      setIsDirty(false);
    } else {
      setError(res.error.message);
    }
  };

  if (isLoading) {
    return (
      <div className="admin-help-editor-loading" aria-busy="true">
        <Skeleton variant="text" width="30%" height="32px" className="mb-4" />
        <Skeleton variant="rectangular" width="100%" height="400px" />
      </div>
    );
  }

  return (
    <div className="admin-help-editor">
      {/* Top Header */}
      <header className="admin-help-editor__header">
        <div className="admin-help-editor__header-left">
          <Link
            to={ROUTES.ADMIN.HELP}
            className="admin-help-editor__back-btn"
            aria-label="Back to Help Center"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            <span>Help Center</span>
          </Link>
          <div className="admin-help-editor__title-row">
            <h1 className="admin-help-editor__title">
              {isEditing ? title || 'Edit Article' : 'New Knowledge Base Article'}
            </h1>
            <Badge
              variant={
                status === 'published' ? 'success' : status === 'archived' ? 'warning' : 'default'
              }
              size="sm"
            >
              {status.toUpperCase()}
            </Badge>
            {isDirty && (
              <span className="admin-help-editor__dirty-pill" title="Unsaved changes">
                Unsaved Changes
              </span>
            )}
          </div>
        </div>

        <div className="admin-help-editor__actions">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsPreviewOpen(true)}
            leftIcon={<Eye size={15} />}
          >
            Preview
          </Button>

          {isEditing && status !== 'archived' && (
            <Button
              variant="ghost"
              size="sm"
              className="admin-help-editor__btn--danger"
              onClick={() => setIsArchiveConfirmOpen(true)}
              leftIcon={<Archive size={15} />}
            >
              Archive
            </Button>
          )}

          <Button
            variant="secondary"
            size="sm"
            onClick={() => void handleSaveDraft()}
            isLoading={isSaving}
            disabled={isPublishing}
            leftIcon={<Save size={15} />}
          >
            Save Draft
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => void handlePublish()}
            isLoading={isPublishing}
            disabled={isSaving}
            leftIcon={<Send size={15} />}
          >
            {status === 'published' ? 'Save & Update' : 'Publish Article'}
          </Button>
        </div>
      </header>

      {/* Success Notification */}
      {successMessage && (
        <div className="admin-editor-alert admin-editor-alert--success" role="status">
          <CheckCircle2 size={18} aria-hidden="true" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="admin-editor-alert admin-editor-alert--danger" role="alert">
          <AlertCircle size={18} aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="admin-editor-alert admin-editor-alert--warning" role="alert">
          <AlertCircle size={18} aria-hidden="true" />
          <div>
            <strong>Please resolve the following before publishing:</strong>
            <ul className="admin-editor-validation-list">
              {validationErrors.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Editor Form Body */}
      <div className="admin-help-editor__grid">
        <div className="admin-help-editor__main-col">
          <div className="admin-editor-card">
            <h2 className="admin-editor-card__title">Article Content</h2>
            <div className="admin-editor-fields">
              <div className="admin-editor-field">
                <label htmlFor="help-title" className="admin-editor-label">
                  Article Title <span className="admin-editor-required">*</span>
                </label>
                <Input
                  id="help-title"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="e.g. How to install the Chrome Extension"
                  required
                />
              </div>

              <div className="admin-editor-field">
                <label htmlFor="help-slug" className="admin-editor-label">
                  URL Slug <span className="admin-editor-required">*</span>
                </label>
                <Input
                  id="help-slug"
                  value={slug}
                  onChange={(e) => {
                    setIsSlugManual(true);
                    setSlug(slugify(e.target.value));
                    setIsDirty(true);
                  }}
                  placeholder="e.g. install-chrome-extension"
                  required
                />
                <span className="admin-editor-hint">
                  Public URL: /help/articles/{slug || 'slug'}
                </span>
              </div>

              <div className="admin-editor-field">
                <label htmlFor="help-excerpt" className="admin-editor-label">
                  Excerpt / Short Summary
                </label>
                <Input
                  id="help-excerpt"
                  value={excerpt}
                  onChange={(e) => {
                    setExcerpt(e.target.value);
                    setIsDirty(true);
                  }}
                  placeholder="Brief 1-sentence answer for search snippets..."
                />
              </div>

              <div className="admin-editor-field">
                <label htmlFor="help-content" className="admin-editor-label">
                  Markdown Content <span className="admin-editor-required">*</span>
                </label>
                <textarea
                  id="help-content"
                  className="admin-editor-textarea"
                  value={content}
                  onChange={(e) => {
                    setContent(e.target.value);
                    setIsDirty(true);
                  }}
                  placeholder="Step-by-step instructions, troubleshooting commands, and code snippets..."
                  rows={14}
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Column */}
        <aside className="admin-help-editor__sidebar-col" aria-label="Article Settings">
          <div className="admin-editor-card">
            <h2 className="admin-editor-card__title">Classification & Visibility</h2>
            <div className="admin-editor-fields">
              <div className="admin-editor-field">
                <label htmlFor="help-category-select" className="admin-editor-label">
                  FAQ Category <span className="admin-editor-required">*</span>
                </label>
                <select
                  id="help-category-select"
                  value={categoryId}
                  onChange={(e) => {
                    setCategoryId(e.target.value);
                    setIsDirty(true);
                  }}
                  className="admin-editor-select"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="admin-editor-field">
                <label htmlFor="help-order" className="admin-editor-label">
                  Display Order Index
                </label>
                <Input
                  id="help-order"
                  type="number"
                  value={orderIndex}
                  onChange={(e) => {
                    setOrderIndex(Number(e.target.value));
                    setIsDirty(true);
                  }}
                />
              </div>

              <label className="admin-editor-checkbox-row">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => {
                    setIsFeatured(e.target.checked);
                    setIsDirty(true);
                  }}
                />
                <div>
                  <span className="admin-editor-checkbox-title">Featured Article</span>
                  <span className="admin-editor-checkbox-desc">
                    Pin to top of knowledge base home.
                  </span>
                </div>
              </label>
            </div>
          </div>

          <div className="admin-editor-card">
            <h2 className="admin-editor-card__title">Search Engine Optimization</h2>
            <div className="admin-editor-fields">
              <div className="admin-editor-field">
                <label htmlFor="help-seo-title" className="admin-editor-label">
                  SEO Title
                </label>
                <Input
                  id="help-seo-title"
                  value={seoTitle}
                  onChange={(e) => {
                    setSeoTitle(e.target.value);
                    setIsDirty(true);
                  }}
                  placeholder="Custom page title..."
                />
              </div>

              <div className="admin-editor-field">
                <label htmlFor="help-seo-desc" className="admin-editor-label">
                  SEO Description
                </label>
                <textarea
                  id="help-seo-desc"
                  className="admin-editor-textarea"
                  value={seoDescription}
                  onChange={(e) => {
                    setSeoDescription(e.target.value);
                    setIsDirty(true);
                  }}
                  placeholder="Meta description for search results..."
                  rows={3}
                />
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Preview Dialog */}
      <Dialog
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        title={`Live Preview: ${title || 'Article'}`}
        size="lg"
      >
        <div className="admin-help-preview-content">
          <div className="admin-help-preview-header">
            <h2 className="admin-help-preview-title">{title || 'Article Title'}</h2>
            {excerpt && <p className="admin-help-preview-excerpt">{excerpt}</p>}
          </div>

          <div className="admin-help-preview-body">
            <pre className="admin-help-markdown-preview">{content || 'Content preview...'}</pre>
          </div>

          <div className="admin-help-preview-actions">
            <Button variant="secondary" onClick={() => setIsPreviewOpen(false)}>
              Close Preview
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Archive Dialog */}
      <Dialog
        isOpen={isArchiveConfirmOpen}
        onClose={() => setIsArchiveConfirmOpen(false)}
        title="Archive Help Article"
        description={`Are you sure you want to archive "${title}"? It will be unpublished from the Help Center.`}
      >
        <div className="admin-editor-dialog-actions">
          <Button variant="secondary" onClick={() => setIsArchiveConfirmOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => void handleConfirmArchive()}
            isLoading={isSaving}
          >
            Archive Article
          </Button>
        </div>
      </Dialog>
    </div>
  );
};
