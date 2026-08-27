import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Send,
  Eye,
  Columns2,
  Code,
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link2,
  Image as ImageIcon,
  Archive,
  XCircle,
  X,
  Plus,
} from 'lucide-react';
import { Button, Input, Textarea, Badge, Alert, Spinner } from '@/components';
import { BlogContentRenderer } from '@/components/blog';
import { blogService, calculateReadingTime } from '@/services/blog.service';
import type { BlogCategory } from '@/types/blog.types';
import { ROUTES } from '@/constants/routes';
import { slugify } from '@/utils/slug';
import './AdminBlogEditorPage.css';

type EditorViewMode = 'edit' | 'split' | 'preview';

export const AdminBlogEditorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('engineering');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [canonicalUrl, setCanonicalUrl] = useState('');
  const [socialImageUrl, setSocialImageUrl] = useState('');

  // UI / Status State
  const [status, setStatus] = useState<'draft' | 'published' | 'archived'>('draft');
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [viewMode, setViewMode] = useState<EditorViewMode>('split');
  const [isLoading, setIsLoading] = useState(Boolean(id));
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);

  // Fetch Categories
  useEffect(() => {
    const fetchCats = async () => {
      const result = await blogService.listActiveCategories();
      if (result.success && result.data.items.length > 0) {
        setCategories([...result.data.items]);
        if (!id) {
          setCategory(result.data.items[0]?.slug || 'engineering');
        }
      }
    };
    void fetchCats();
  }, [id]);

  // Fetch Existing Post for Edit Mode
  useEffect(() => {
    if (!id) return;

    const fetchPost = async () => {
      setIsLoading(true);
      const result = await blogService.getPostById(id);
      if (result.success && result.data) {
        const post = result.data;
        setTitle(post.title);
        setSlug(post.slug);
        setExcerpt(post.excerpt);
        setContent(post.content);
        setCategory(post.category);
        setCoverImageUrl(post.coverImageUrl || '');
        setTags([...post.tags]);
        setIsFeatured(Boolean(post.isFeatured));
        setStatus(post.status);
        setSeoTitle(post.seoTitle || '');
        setSeoDescription(post.seoDescription || '');
        setCanonicalUrl(post.canonicalUrl || '');
        setSocialImageUrl(post.socialImageUrl || '');
        setIsSlugManuallyEdited(true);
      } else {
        setErrorMessage(result.success ? 'Article not found' : result.error.message);
      }
      setIsLoading(false);
    };

    void fetchPost();
  }, [id]);

  // Handle Title Change & Slug Suggestion
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    if (!isSlugManuallyEdited && status === 'draft') {
      setSlug(slugify(newTitle));
    }
  };

  // Add Tag
  const handleAddTag = () => {
    const clean = slugify(tagInput.trim());
    if (clean && !tags.includes(clean)) {
      setTags([...tags, clean]);
    }
    setTagInput('');
  };

  // Remove Tag
  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  // Insert Formatting at Cursor
  const insertFormatting = (prefix: string, suffix = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.substring(start, end);
    const replacement = `${prefix}${selected || 'text'}${suffix}`;

    const newContent = content.substring(0, start) + replacement + content.substring(end);
    setContent(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length + (selected.length || 4)
      );
    }, 0);
  };

  // Save Draft Handler
  const handleSaveDraft = async () => {
    setIsSaving(true);
    setErrorMessage(null);
    setSaveMessage(null);

    const payload = {
      title,
      slug: slug || slugify(title),
      excerpt,
      content,
      category,
      coverImageUrl: coverImageUrl || undefined,
      tags,
      isFeatured,
      seoTitle: seoTitle || undefined,
      seoDescription: seoDescription || undefined,
      canonicalUrl: canonicalUrl || undefined,
      socialImageUrl: socialImageUrl || undefined,
    };

    if (id) {
      const result = await blogService.updatePost(id, payload);
      if (result.success) {
        setSaveMessage('Draft updated successfully.');
      } else {
        setErrorMessage(result.error.message);
      }
    } else {
      const result = await blogService.createDraft(payload);
      if (result.success) {
        setSaveMessage('Draft created successfully.');
        navigate(`/admin/blog/${result.data.id}/edit`, { replace: true });
      } else {
        setErrorMessage(result.error.message);
      }
    }

    setIsSaving(false);
  };

  // Publish Post Handler
  const handlePublish = async () => {
    setIsSaving(true);
    setErrorMessage(null);
    setSaveMessage(null);

    let currentId = id;

    // Save first if new
    if (!currentId) {
      const draftResult = await blogService.createDraft({
        title,
        slug: slug || slugify(title),
        excerpt,
        content,
        category,
        coverImageUrl: coverImageUrl || undefined,
        tags,
        isFeatured,
        seoTitle: seoTitle || undefined,
        seoDescription: seoDescription || undefined,
        canonicalUrl: canonicalUrl || undefined,
        socialImageUrl: socialImageUrl || undefined,
      });

      if (!draftResult.success) {
        setErrorMessage(draftResult.error.message);
        setIsSaving(false);
        return;
      }
      currentId = draftResult.data.id;
    } else {
      // Update existing before publish
      const updateResult = await blogService.updatePost(currentId, {
        title,
        slug,
        excerpt,
        content,
        category,
        coverImageUrl: coverImageUrl || undefined,
        tags,
        isFeatured,
        seoTitle: seoTitle || undefined,
        seoDescription: seoDescription || undefined,
        canonicalUrl: canonicalUrl || undefined,
        socialImageUrl: socialImageUrl || undefined,
      });

      if (!updateResult.success) {
        setErrorMessage(updateResult.error.message);
        setIsSaving(false);
        return;
      }
    }

    const publishResult = await blogService.publishPost(currentId);
    if (publishResult.success) {
      setStatus('published');
      setSaveMessage('Article published successfully!');
      if (!id) {
        navigate(`/admin/blog/${currentId}/edit`, { replace: true });
      }
    } else {
      setErrorMessage(publishResult.error.message);
    }

    setIsSaving(false);
  };

  // Unpublish Handler
  const handleUnpublish = async () => {
    if (!id) return;
    setIsSaving(true);
    const result = await blogService.unpublishPost(id);
    if (result.success) {
      setStatus('draft');
      setSaveMessage('Article unpublished to draft status.');
    } else {
      setErrorMessage(result.error.message);
    }
    setIsSaving(false);
  };

  // Archive Handler
  const handleArchive = async () => {
    if (!id) return;
    setIsSaving(true);
    const result = await blogService.archivePost(id);
    if (result.success) {
      setStatus('archived');
      setSaveMessage('Article moved to archive.');
    } else {
      setErrorMessage(result.error.message);
    }
    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <main className="blog-editor-page">
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
          <Spinner size="lg" />
        </div>
      </main>
    );
  }

  const readingTime = calculateReadingTime(content);

  return (
    <main className="blog-editor-page">
      {/* Header */}
      <header className="blog-editor-header">
        <div className="blog-editor-header__left">
          <Link to={ROUTES.ADMIN.BLOG} style={{ textDecoration: 'none' }}>
            <Button variant="ghost" size="sm" leftIcon={<ArrowLeft size={16} />}>
              Articles
            </Button>
          </Link>
          <h1 className="blog-editor-header__title">{id ? 'Edit Article' : 'Write New Article'}</h1>
          <Badge
            variant={
              status === 'published' ? 'success' : status === 'archived' ? 'warning' : 'default'
            }
            size="sm"
          >
            {status.toUpperCase()}
          </Badge>
        </div>

        <div className="blog-editor-header__actions">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => void handleSaveDraft()}
            disabled={isSaving || !title.trim()}
            leftIcon={<Save size={14} />}
          >
            Save Draft
          </Button>

          {status === 'published' ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => void handleUnpublish()}
              disabled={isSaving}
              leftIcon={<XCircle size={14} />}
            >
              Unpublish
            </Button>
          ) : (
            <Button
              variant="primary"
              size="sm"
              onClick={() => void handlePublish()}
              disabled={isSaving || !title.trim()}
              leftIcon={<Send size={14} />}
            >
              Publish
            </Button>
          )}

          {id && status !== 'archived' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => void handleArchive()}
              disabled={isSaving}
              leftIcon={<Archive size={14} />}
            >
              Archive
            </Button>
          )}
        </div>
      </header>

      {/* Notifications */}
      {saveMessage && (
        <Alert variant="success" onDismiss={() => setSaveMessage(null)}>
          {saveMessage}
        </Alert>
      )}

      {errorMessage && (
        <Alert variant="error" onDismiss={() => setErrorMessage(null)}>
          {errorMessage}
        </Alert>
      )}

      {/* Main Two-Column Layout */}
      <div className="blog-editor-layout">
        {/* Left / Main Column */}
        <div className="blog-editor-main">
          <div className="blog-editor-card">
            <div>
              <label
                htmlFor="blog-title-input"
                className="ui-label"
                style={{ marginBottom: '6px', display: 'block' }}
              >
                Article Title
              </label>
              <Input
                id="blog-title-input"
                aria-label="Article Title"
                placeholder="e.g. Crafting Fast Web Applications"
                value={title}
                onChange={handleTitleChange}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label
                  htmlFor="blog-slug-input"
                  className="ui-label"
                  style={{ marginBottom: '6px', display: 'block' }}
                >
                  URL Slug
                </label>
                <Input
                  id="blog-slug-input"
                  aria-label="URL Slug"
                  placeholder="crafting-fast-web-apps"
                  value={slug}
                  onChange={(e) => {
                    setSlug(slugify(e.target.value));
                    setIsSlugManuallyEdited(true);
                  }}
                  required
                />
              </div>

              <div>
                <label className="ui-label" style={{ marginBottom: '6px', display: 'block' }}>
                  Est. Reading Time
                </label>
                <div style={{ paddingTop: '8px' }}>
                  <Badge variant="outline" size="md">
                    {readingTime} min read (~{content.split(/\s+/).filter(Boolean).length} words)
                  </Badge>
                </div>
              </div>
            </div>

            <div>
              <label
                htmlFor="blog-excerpt-input"
                className="ui-label"
                style={{ marginBottom: '6px', display: 'block' }}
              >
                Short Excerpt
              </label>
              <Textarea
                id="blog-excerpt-input"
                aria-label="Short Excerpt"
                placeholder="A brief summary of what readers will learn in this essay..."
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                rows={2}
                required
              />
            </div>
          </div>

          {/* Editor & Preview Toolbar Card */}
          <div className="blog-editor-card">
            <div className="blog-toolbar">
              <button
                type="button"
                className="blog-toolbar-btn"
                onClick={() => insertFormatting('# ')}
                title="Heading 1"
                aria-label="Heading 1"
              >
                <Heading1 size={15} />
              </button>
              <button
                type="button"
                className="blog-toolbar-btn"
                onClick={() => insertFormatting('## ')}
                title="Heading 2"
                aria-label="Heading 2"
              >
                <Heading2 size={15} />
              </button>
              <button
                type="button"
                className="blog-toolbar-btn"
                onClick={() => insertFormatting('### ')}
                title="Heading 3"
                aria-label="Heading 3"
              >
                <Heading3 size={15} />
              </button>

              <div className="blog-toolbar-separator" />

              <button
                type="button"
                className="blog-toolbar-btn"
                onClick={() => insertFormatting('**', '**')}
                title="Bold"
                aria-label="Bold"
              >
                <Bold size={15} />
              </button>
              <button
                type="button"
                className="blog-toolbar-btn"
                onClick={() => insertFormatting('*', '*')}
                title="Italic"
                aria-label="Italic"
              >
                <Italic size={15} />
              </button>
              <button
                type="button"
                className="blog-toolbar-btn"
                onClick={() => insertFormatting('`', '`')}
                title="Inline Code"
                aria-label="Inline Code"
              >
                <Code size={15} />
              </button>

              <div className="blog-toolbar-separator" />

              <button
                type="button"
                className="blog-toolbar-btn"
                onClick={() => insertFormatting('> ')}
                title="Quote"
                aria-label="Quote"
              >
                <Quote size={15} />
              </button>
              <button
                type="button"
                className="blog-toolbar-btn"
                onClick={() => insertFormatting('- ')}
                title="Bullet List"
                aria-label="Bullet List"
              >
                <List size={15} />
              </button>
              <button
                type="button"
                className="blog-toolbar-btn"
                onClick={() => insertFormatting('1. ')}
                title="Numbered List"
                aria-label="Numbered List"
              >
                <ListOrdered size={15} />
              </button>
              <button
                type="button"
                className="blog-toolbar-btn"
                onClick={() => insertFormatting('[', '](https://example.com)')}
                title="Insert Link"
                aria-label="Insert Link"
              >
                <Link2 size={15} />
              </button>
              <button
                type="button"
                className="blog-toolbar-btn"
                onClick={() => insertFormatting('![Alt Text](', ')')}
                title="Insert Image"
                aria-label="Insert Image"
              >
                <ImageIcon size={15} />
              </button>
              <button
                type="button"
                className="blog-toolbar-btn"
                onClick={() => insertFormatting('\n```typescript\n', '\n```\n')}
                title="Code Block"
                aria-label="Code Block"
              >
                <Code size={15} />
              </button>

              <div className="blog-toolbar-view-toggle">
                <Button
                  variant={viewMode === 'edit' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('edit')}
                >
                  Edit
                </Button>
                <Button
                  variant={viewMode === 'split' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('split')}
                  leftIcon={<Columns2 size={14} />}
                >
                  Split
                </Button>
                <Button
                  variant={viewMode === 'preview' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('preview')}
                  leftIcon={<Eye size={14} />}
                >
                  Preview
                </Button>
              </div>
            </div>

            {/* Editor Content Area */}
            <div
              className={`blog-content-container ${
                viewMode === 'split'
                  ? 'blog-content-container--split'
                  : viewMode === 'preview'
                    ? 'blog-content-container--preview-only'
                    : 'blog-content-container--edit-only'
              }`}
            >
              {viewMode !== 'preview' && (
                <textarea
                  ref={textareaRef}
                  className="blog-editor-textarea"
                  placeholder="Write your article in Markdown..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  aria-label="Article content"
                />
              )}

              {viewMode !== 'edit' && (
                <div className="blog-preview-pane" data-testid="blog-editor-preview">
                  <BlogContentRenderer content={content} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right / Sidebar Column */}
        <aside className="blog-editor-sidebar">
          {/* Classification Section */}
          <div className="blog-sidebar-section">
            <h2 className="blog-sidebar-title">Taxonomy & Category</h2>

            <div>
              <label
                htmlFor="blog-category-select"
                className="ui-label"
                style={{ marginBottom: '6px', display: 'block' }}
              >
                Primary Category
              </label>
              <select
                id="blog-category-select"
                className="ui-input ui-input--md"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{ width: '100%' }}
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.slug}>
                    {cat.name}
                  </option>
                ))}
                {categories.length === 0 && <option value="engineering">Engineering</option>}
              </select>
            </div>

            <div className="blog-tags-input-group">
              <label htmlFor="blog-tag-input" className="ui-label">
                Tags
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Input
                  id="blog-tag-input"
                  aria-label="Add tag"
                  placeholder="Add tag..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  inputSize="sm"
                />
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleAddTag}
                  aria-label="Add tag button"
                >
                  <Plus size={14} />
                </Button>
              </div>

              <div className="blog-tags-chips">
                {tags.map((tag) => (
                  <span key={tag} className="blog-tag-chip">
                    #{tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      aria-label={`Remove tag ${tag}`}
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
              <input
                type="checkbox"
                id="featured-checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
              />
              <label htmlFor="featured-checkbox" style={{ fontSize: '13px', cursor: 'pointer' }}>
                Feature this post
              </label>
            </div>
          </div>

          {/* Media Section */}
          <div className="blog-sidebar-section">
            <h2 className="blog-sidebar-title">Cover Media</h2>
            <div>
              <label
                htmlFor="blog-cover-image"
                className="ui-label"
                style={{ marginBottom: '6px', display: 'block' }}
              >
                Cover Image URL
              </label>
              <Input
                id="blog-cover-image"
                aria-label="Cover Image URL"
                placeholder="https://cdn.elsesourav.com/cover.png"
                value={coverImageUrl}
                onChange={(e) => setCoverImageUrl(e.target.value)}
                inputSize="sm"
              />
            </div>
            {coverImageUrl && (
              <div
                style={{
                  borderRadius: '8px',
                  overflow: 'hidden',
                  border: '1px solid var(--color-border-subtle)',
                  maxHeight: '140px',
                }}
              >
                <img
                  src={coverImageUrl}
                  alt="Cover preview"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={() => setErrorMessage('Invalid or unreachable cover image URL')}
                />
              </div>
            )}
          </div>

          {/* SEO Metadata Section */}
          <div className="blog-sidebar-section">
            <h2 className="blog-sidebar-title">SEO & Metadata</h2>
            <div>
              <label
                htmlFor="blog-seo-title"
                className="ui-label"
                style={{ marginBottom: '6px', display: 'block' }}
              >
                SEO Title
              </label>
              <Input
                id="blog-seo-title"
                aria-label="SEO Title"
                placeholder="Custom search title (optional)"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                inputSize="sm"
              />
            </div>

            <div>
              <label
                htmlFor="blog-seo-desc"
                className="ui-label"
                style={{ marginBottom: '6px', display: 'block' }}
              >
                SEO Description
              </label>
              <Textarea
                id="blog-seo-desc"
                aria-label="SEO Description"
                placeholder="Meta description for search engines..."
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                rows={2}
              />
            </div>

            <div>
              <label
                htmlFor="blog-canonical-url"
                className="ui-label"
                style={{ marginBottom: '6px', display: 'block' }}
              >
                Canonical URL
              </label>
              <Input
                id="blog-canonical-url"
                aria-label="Canonical URL"
                placeholder="https://elsesourav.com/blog/..."
                value={canonicalUrl}
                onChange={(e) => setCanonicalUrl(e.target.value)}
                inputSize="sm"
              />
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
};
