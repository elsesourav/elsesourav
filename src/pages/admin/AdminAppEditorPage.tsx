import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Package,
  Save,
  Send,
  Eye,
  ArrowLeft,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Globe,
  Image,
  Archive,
} from 'lucide-react';
import { Button, Badge, Input, Skeleton, Dialog } from '@/components/ui';
import { appService } from '@/services/app.service';
import { appRepository } from '@/repositories';
import type { AppLink, AppPlatform, AppActionType, AppStatus } from '@/types/app.types';
import { ROUTES } from '@/constants/routes';
import { slugify } from '@/utils/slug';
import './AdminAppEditorPage.css';

const PLATFORM_OPTIONS: readonly { value: AppPlatform; label: string }[] = [
  { value: 'web', label: 'Web Application' },
  { value: 'chrome', label: 'Chrome Extension' },
  { value: 'android', label: 'Android (Play Store)' },
  { value: 'ios', label: 'iOS (App Store)' },
  { value: 'windows', label: 'Windows PC' },
  { value: 'macos', label: 'macOS' },
  { value: 'linux', label: 'Linux' },
  { value: 'github', label: 'GitHub Repository' },
  { value: 'download', label: 'Direct Download' },
  { value: 'other', label: 'Other Platform' },
];

const ACTION_TYPES: readonly { value: AppActionType; label: string }[] = [
  { value: 'open_app', label: 'Open Web App' },
  { value: 'add_to_chrome', label: 'Add to Chrome' },
  { value: 'get_on_play_store', label: 'Get on Google Play' },
  { value: 'view_on_github', label: 'View on GitHub' },
  { value: 'download', label: 'Download Application' },
  { value: 'visit_website', label: 'Visit Website' },
];

const CATEGORY_OPTIONS: readonly { value: string; label: string }[] = [
  { value: 'developer-tools', label: 'Developer Tools' },
  { value: 'utilities', label: 'Utilities' },
  { value: 'web-apps', label: 'Web Apps' },
  { value: 'chrome-extensions', label: 'Chrome Extensions' },
  { value: 'audio-video', label: 'Audio & Video' },
  { value: 'productivity', label: 'Productivity' },
  { value: 'graphics', label: 'Graphics & Design' },
  { value: 'games', label: 'Games & Entertainment' },
];

export const AdminAppEditorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  // Loading and initial fetch
  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<readonly string[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);

  // App Form State
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [currentVersion, setCurrentVersion] = useState('1.0.0');

  // Classification
  const [primaryCategory, setPrimaryCategory] = useState('developer-tools');
  const [tags, setTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState('');
  const [platforms, setPlatforms] = useState<AppPlatform[]>(['web']);

  // Branding & Media
  const [iconUrl, setIconUrl] = useState('');
  const [featuredImageUrl, setFeaturedImageUrl] = useState('');
  const [socialImageUrl, setSocialImageUrl] = useState('');
  const [demoUrl, setDemoUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [screenshots, setScreenshots] = useState<string[]>([]);
  const [newScreenshotInput, setNewScreenshotInput] = useState('');

  // Platform Links
  const [links, setLinks] = useState<AppLink[]>([]);
  const [isAddLinkModalOpen, setIsAddLinkModalOpen] = useState(false);
  const [newLinkPlatform, setNewLinkPlatform] = useState<AppPlatform>('web');
  const [newLinkLabel, setNewLinkLabel] = useState('Open App');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [newLinkAction, setNewLinkAction] = useState<AppActionType>('open_app');
  const [newLinkIsPrimary, setNewLinkIsPrimary] = useState(false);

  // Publishing & Visibility
  const [status, setStatus] = useState<AppStatus>('draft');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [sortOrder, setSortOrder] = useState(0);

  // SEO
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');

  // Preview Dialog State
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Archive Modal State
  const [isArchiveConfirmOpen, setIsArchiveConfirmOpen] = useState(false);

  // Load existing app if editing
  const loadApp = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);

    const res = await appRepository.findById(id);
    if (res.success && res.data) {
      const app = res.data;
      setName(app.name);
      setSlug(app.slug);
      setShortDescription(app.shortDescription);
      setDescription(app.description);
      setCurrentVersion(app.currentVersion || '1.0.0');
      setPrimaryCategory(app.primaryCategory);
      setTags([...(app.tags || [])]);
      setPlatforms([...(app.platforms || ['web'])]);
      setIconUrl(app.iconUrl || '');
      setFeaturedImageUrl(app.featuredImageUrl || '');
      setSocialImageUrl(app.socialImageUrl || '');
      setDemoUrl(app.demoUrl || '');
      setVideoUrl(app.videoUrl || '');
      setScreenshots([...(app.screenshots || [])]);
      setLinks([...(app.links || [])]);
      setStatus(app.status);
      setIsFeatured(app.isFeatured || false);
      setIsPinned(app.isPinned || false);
      setSortOrder(app.sortOrder || 0);
      setSeoTitle(app.seoTitle || '');
      setSeoDescription(app.seoDescription || '');
      setIsDirty(false);
    } else {
      setError(res.success ? 'Application not found' : res.error.message);
    }
    setIsLoading(false);
  }, [id]);

  useEffect(() => {
    if (isEditing) {
      void loadApp();
    }
  }, [isEditing, loadApp]);

  // Unsaved changes browser warning
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

  // Auto-generate slug from name if not manually modified
  const handleNameChange = (val: string) => {
    setName(val);
    setIsDirty(true);
    if (!isEditing && !isSlugManuallyEdited) {
      setSlug(slugify(val));
    }
  };

  // Add Tag
  const handleAddTag = () => {
    const trimmed = newTagInput.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setNewTagInput('');
      setIsDirty(true);
    }
  };

  // Remove Tag
  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
    setIsDirty(true);
  };

  // Add Screenshot URL
  const handleAddScreenshot = () => {
    const trimmed = newScreenshotInput.trim();
    if (trimmed && !screenshots.includes(trimmed)) {
      setScreenshots([...screenshots, trimmed]);
      setNewScreenshotInput('');
      setIsDirty(true);
    }
  };

  // Remove Screenshot URL
  const handleRemoveScreenshot = (urlToRemove: string) => {
    setScreenshots(screenshots.filter((s) => s !== urlToRemove));
    setIsDirty(true);
  };

  // Toggle Platform selection
  const handleTogglePlatform = (plat: AppPlatform) => {
    setIsDirty(true);
    if (platforms.includes(plat)) {
      if (platforms.length > 1) {
        setPlatforms(platforms.filter((p) => p !== plat));
      }
    } else {
      setPlatforms([...platforms, plat]);
    }
  };

  // Add Platform Link
  const handleAddLink = () => {
    if (!newLinkUrl.trim()) return;

    const newLink: AppLink = {
      id: `link-${Date.now()}`,
      appId: id || 'temp',
      platform: newLinkPlatform,
      label: newLinkLabel.trim() || 'Open App',
      url: newLinkUrl.trim(),
      action: newLinkAction,
      isPrimary: newLinkIsPrimary || links.length === 0,
      displayOrder: links.length,
      isActive: true,
    };

    let updatedLinks = [...links];
    if (newLink.isPrimary) {
      updatedLinks = updatedLinks.map((l) => ({ ...l, isPrimary: false }));
    }
    updatedLinks.push(newLink);

    setLinks(updatedLinks);
    setNewLinkUrl('');
    setNewLinkLabel('Open App');
    setNewLinkIsPrimary(false);
    setIsAddLinkModalOpen(false);
    setIsDirty(true);
  };

  // Remove Link
  const handleRemoveLink = (linkId: string) => {
    const filtered = links.filter((l) => l.id !== linkId);
    // Ensure one link is primary if any exist
    if (filtered.length > 0 && !filtered.some((l) => l.isPrimary)) {
      const first = filtered[0];
      if (first) {
        filtered[0] = { ...first, isPrimary: true };
      }
    }
    setLinks(filtered);
    setIsDirty(true);
  };

  // Set Link as Primary
  const handleSetPrimaryLink = (linkId: string) => {
    setLinks(
      links.map((l) => ({
        ...l,
        isPrimary: l.id === linkId,
      }))
    );
    setIsDirty(true);
  };

  // Build Payload
  const buildAppPayload = () => ({
    name: name.trim(),
    slug: slug.trim().toLowerCase(),
    shortDescription: shortDescription.trim(),
    description: description.trim(),
    currentVersion: currentVersion.trim() || '1.0.0',
    primaryCategory,
    tags,
    platforms,
    iconUrl: iconUrl.trim(),
    featuredImageUrl: featuredImageUrl.trim() || undefined,
    socialImageUrl: socialImageUrl.trim() || undefined,
    demoUrl: demoUrl.trim() || undefined,
    videoUrl: videoUrl.trim() || undefined,
    screenshots,
    links: links.map((l, idx) => ({ ...l, displayOrder: idx })),
    stats: {
      views: 0,
      launches: 0,
      libraryAdds: 0,
    },
    status,
    isFeatured,
    isPinned,
    sortOrder: Number(sortOrder) || 0,
    seoTitle: seoTitle.trim() || undefined,
    seoDescription: seoDescription.trim() || undefined,
  });

  // Save Draft Handler
  const handleSaveDraft = async () => {
    setError(null);
    setValidationErrors([]);
    setSuccessMessage(null);
    setIsSaving(true);

    const payload = { ...buildAppPayload(), status: 'draft' as const };

    try {
      if (isEditing && id) {
        const res = await appService.updateDraft(id, payload);
        if (res.success) {
          setSuccessMessage('Draft saved successfully.');
          setIsDirty(false);
        } else {
          setError(res.error.message);
        }
      } else {
        const res = await appService.createDraft(payload);
        if (res.success) {
          setIsDirty(false);
          navigate(`/admin/apps/${res.data.id}/edit`, { replace: true });
        } else {
          setError(res.error.message);
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save draft.');
    } finally {
      setIsSaving(false);
    }
  };

  // Publish App Handler
  const handlePublish = async () => {
    setError(null);
    setValidationErrors([]);
    setSuccessMessage(null);

    // Validate payload against requirements
    const missing: string[] = [];
    if (!name.trim()) missing.push('App name is required');
    if (!slug.trim()) missing.push('Slug is required');
    if (!shortDescription.trim()) missing.push('Short description is required');
    if (!description.trim()) missing.push('Full description is required');
    if (!iconUrl.trim()) missing.push('A valid Icon URL is required');
    if (platforms.length === 0) missing.push('At least one target platform is required');
    if (links.length === 0) missing.push('At least one platform destination link is required');

    if (missing.length > 0) {
      setValidationErrors(missing);
      return;
    }

    setIsPublishing(true);
    const payload = { ...buildAppPayload(), status: 'published' as const };

    try {
      if (isEditing && id) {
        const updateRes = await appService.updateApp(id, payload);
        if (updateRes.success) {
          const pubRes = await appService.publishApp(id);
          if (pubRes.success) {
            setStatus('published');
            setSuccessMessage('Application published successfully to public catalog.');
            setIsDirty(false);
          } else {
            setError(pubRes.error.message);
          }
        } else {
          setError(updateRes.error.message);
        }
      } else {
        const createRes = await appService.createApp(payload);
        if (createRes.success) {
          const pubRes = await appService.publishApp(createRes.data.id);
          if (pubRes.success) {
            setIsDirty(false);
            navigate(`/admin/apps/${createRes.data.id}/edit`, { replace: true });
          } else {
            setError(pubRes.error.message);
          }
        } else {
          setError(createRes.error.message);
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to publish application.');
    } finally {
      setIsPublishing(false);
    }
  };

  // Archive Handler
  const handleConfirmArchive = async () => {
    if (!id) return;
    setIsSaving(true);
    const res = await appService.archiveApp(id);
    setIsSaving(false);
    setIsArchiveConfirmOpen(false);

    if (res.success) {
      setStatus('archived');
      setSuccessMessage('Application archived successfully.');
      setIsDirty(false);
    } else {
      setError(res.error.message);
    }
  };

  if (isLoading) {
    return (
      <div className="admin-app-editor-loading" aria-busy="true">
        <Skeleton variant="text" width="30%" height="32px" className="mb-4" />
        <Skeleton variant="rectangular" width="100%" height="300px" className="mb-4" />
        <Skeleton variant="rectangular" width="100%" height="200px" />
      </div>
    );
  }

  return (
    <div className="admin-app-editor">
      {/* Top Header / Actions Bar */}
      <header className="admin-app-editor__header">
        <div className="admin-app-editor__header-left">
          <Link
            to={ROUTES.ADMIN.APPS}
            className="admin-app-editor__back-btn"
            aria-label="Back to Applications"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            <span>Applications</span>
          </Link>
          <div className="admin-app-editor__title-row">
            <h1 className="admin-app-editor__title">
              {isEditing ? name || 'Edit Application' : 'New Application'}
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
              <span className="admin-app-editor__dirty-pill" title="Unsaved changes">
                Unsaved Changes
              </span>
            )}
          </div>
        </div>

        <div className="admin-app-editor__actions">
          {/* Preview Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsPreviewOpen(true)}
            leftIcon={<Eye size={15} />}
          >
            Preview
          </Button>

          {/* Archive Button (if editing) */}
          {isEditing && status !== 'archived' && (
            <Button
              variant="ghost"
              size="sm"
              className="admin-app-editor__btn--danger"
              onClick={() => setIsArchiveConfirmOpen(true)}
              leftIcon={<Archive size={15} />}
            >
              Archive
            </Button>
          )}

          {/* Save Draft Button */}
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

          {/* Publish Button */}
          <Button
            variant="primary"
            size="sm"
            onClick={() => void handlePublish()}
            isLoading={isPublishing}
            disabled={isSaving}
            leftIcon={<Send size={15} />}
          >
            {status === 'published' ? 'Save & Update' : 'Publish Application'}
          </Button>
        </div>
      </header>

      {/* Success Notification Banner */}
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

      {/* Missing Requirements for Publication Alert */}
      {validationErrors.length > 0 && (
        <div className="admin-editor-alert admin-editor-alert--warning" role="alert">
          <AlertCircle size={18} aria-hidden="true" />
          <div>
            <strong>Cannot publish application yet. Please resolve missing requirements:</strong>
            <ul className="admin-editor-validation-list">
              {validationErrors.map((errItem) => (
                <li key={errItem}>{errItem}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Form Content Body */}
      <div className="admin-app-editor__grid">
        <div className="admin-app-editor__main-col">
          {/* Section 1: Basic Information */}
          <section className="admin-editor-card" aria-labelledby="section-basic-title">
            <h2 id="section-basic-title" className="admin-editor-card__title">
              1. Basic Information
            </h2>
            <div className="admin-editor-fields">
              <div className="admin-editor-field">
                <label htmlFor="app-name" className="admin-editor-label">
                  Application Name <span className="admin-editor-required">*</span>
                </label>
                <Input
                  id="app-name"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. CodeFlow IDE"
                  required
                />
              </div>

              <div className="admin-editor-field">
                <div className="admin-editor-label-row">
                  <label htmlFor="app-slug" className="admin-editor-label">
                    URL Slug <span className="admin-editor-required">*</span>
                  </label>
                  <button
                    type="button"
                    className="admin-editor-helper-btn"
                    onClick={() => {
                      setIsSlugManuallyEdited(false);
                      setSlug(slugify(name));
                      setIsDirty(true);
                    }}
                  >
                    Generate from Name
                  </button>
                </div>
                <Input
                  id="app-slug"
                  value={slug}
                  onChange={(e) => {
                    setIsSlugManuallyEdited(true);
                    setSlug(slugify(e.target.value));
                    setIsDirty(true);
                  }}
                  placeholder="e.g. codeflow-ide"
                  required
                />
                <span className="admin-editor-hint">Public URL: /apps/{slug || 'app-slug'}</span>
              </div>

              <div className="admin-editor-field">
                <div className="admin-editor-label-row">
                  <label htmlFor="app-short-desc" className="admin-editor-label">
                    Short Description <span className="admin-editor-required">*</span>
                  </label>
                  <span className="admin-editor-char-counter">{shortDescription.length}/200</span>
                </div>
                <Input
                  id="app-short-desc"
                  value={shortDescription}
                  onChange={(e) => {
                    setShortDescription(e.target.value.slice(0, 200));
                    setIsDirty(true);
                  }}
                  placeholder="A concise 1-2 sentence tagline for discovery cards..."
                  required
                />
              </div>

              <div className="admin-editor-field">
                <label htmlFor="app-description" className="admin-editor-label">
                  Full Description (Markdown) <span className="admin-editor-required">*</span>
                </label>
                <textarea
                  id="app-description"
                  className="admin-editor-textarea"
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    setIsDirty(true);
                  }}
                  placeholder="Comprehensive overview, features, installation instructions, and architecture..."
                  rows={8}
                  required
                />
              </div>

              <div className="admin-editor-field">
                <label htmlFor="app-version" className="admin-editor-label">
                  Current Version
                </label>
                <Input
                  id="app-version"
                  value={currentVersion}
                  onChange={(e) => {
                    setCurrentVersion(e.target.value);
                    setIsDirty(true);
                  }}
                  placeholder="e.g. 1.0.0"
                />
              </div>
            </div>
          </section>

          {/* Section 2: Platform Links & Smart Action */}
          <section className="admin-editor-card" aria-labelledby="section-links-title">
            <div className="admin-editor-card__header-row">
              <h2 id="section-links-title" className="admin-editor-card__title">
                2. Platform Destinations & Smart Action
              </h2>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsAddLinkModalOpen(true)}
                leftIcon={<Plus size={14} />}
              >
                Add Link
              </Button>
            </div>

            {links.length === 0 ? (
              <div className="admin-editor-empty-links">
                <Globe size={28} aria-hidden="true" />
                <p>
                  No destination links added yet. Add a web link, store download, or repository.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddLinkModalOpen(true)}
                  leftIcon={<Plus size={14} />}
                >
                  Add Primary Destination
                </Button>
              </div>
            ) : (
              <div className="admin-editor-links-list">
                {links.map((link) => (
                  <div key={link.id} className="admin-editor-link-item">
                    <div className="admin-editor-link-details">
                      <div className="admin-editor-link-top">
                        <span className="admin-editor-link-plat">{link.platform}</span>
                        <span className="admin-editor-link-label-text">{link.label}</span>
                        {link.isPrimary && (
                          <Badge variant="accent" size="sm">
                            Primary CTA
                          </Badge>
                        )}
                      </div>
                      <span className="admin-editor-link-url">{link.url}</span>
                    </div>

                    <div className="admin-editor-link-actions">
                      {!link.isPrimary && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSetPrimaryLink(link.id)}
                        >
                          Make Primary
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="admin-editor-btn--danger"
                        onClick={() => handleRemoveLink(link.id)}
                        aria-label={`Remove link ${link.label}`}
                        leftIcon={<Trash2 size={14} />}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Section 3: Branding & Media Assets */}
          <section className="admin-editor-card" aria-labelledby="section-media-title">
            <h2 id="section-media-title" className="admin-editor-card__title">
              3. Branding & Media Assets
            </h2>
            <div className="admin-editor-fields">
              <div className="admin-editor-field">
                <label htmlFor="app-icon-url" className="admin-editor-label">
                  App Icon URL <span className="admin-editor-required">*</span>
                </label>
                <div className="admin-editor-icon-input-row">
                  {iconUrl ? (
                    <img src={iconUrl} alt="" className="admin-editor-icon-preview" />
                  ) : (
                    <div className="admin-editor-icon-placeholder">
                      <Image size={20} />
                    </div>
                  )}
                  <div style={{ flex: 1 }}>
                    <Input
                      id="app-icon-url"
                      type="url"
                      value={iconUrl}
                      onChange={(e) => {
                        setIconUrl(e.target.value);
                        setIsDirty(true);
                      }}
                      placeholder="https://cdn.example.com/icons/app-icon.png"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="admin-editor-field">
                <label htmlFor="app-hero-image" className="admin-editor-label">
                  Cover / Hero Image URL (Optional)
                </label>
                <Input
                  id="app-hero-image"
                  type="url"
                  value={featuredImageUrl}
                  onChange={(e) => {
                    setFeaturedImageUrl(e.target.value);
                    setIsDirty(true);
                  }}
                  placeholder="https://cdn.example.com/screenshots/hero.png"
                />
              </div>

              {/* Screenshots List */}
              <div className="admin-editor-field">
                <label className="admin-editor-label">Screenshots Gallery</label>
                <div className="admin-editor-add-row">
                  <Input
                    type="url"
                    value={newScreenshotInput}
                    onChange={(e) => setNewScreenshotInput(e.target.value)}
                    placeholder="https://cdn.example.com/screenshot-1.png"
                    aria-label="New screenshot image URL"
                  />
                  <Button variant="secondary" size="sm" onClick={handleAddScreenshot}>
                    Add Screenshot
                  </Button>
                </div>

                {screenshots.length > 0 && (
                  <div className="admin-editor-screenshots-grid">
                    {screenshots.map((s, idx) => (
                      <div key={idx} className="admin-editor-screenshot-thumb">
                        <img src={s} alt="" />
                        <button
                          type="button"
                          className="admin-editor-screenshot-remove"
                          onClick={() => handleRemoveScreenshot(s)}
                          aria-label={`Remove screenshot ${idx + 1}`}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>

        {/* Sidebar Column: Classification, Publishing, SEO */}
        <aside
          className="admin-app-editor__sidebar-col"
          aria-label="App Classification & Publishing Settings"
        >
          {/* Classification Card */}
          <div className="admin-editor-card">
            <h2 className="admin-editor-card__title">Classification & Platforms</h2>
            <div className="admin-editor-fields">
              <div className="admin-editor-field">
                <label htmlFor="app-category-select" className="admin-editor-label">
                  Primary Category
                </label>
                <select
                  id="app-category-select"
                  value={primaryCategory}
                  onChange={(e) => {
                    setPrimaryCategory(e.target.value);
                    setIsDirty(true);
                  }}
                  className="admin-editor-select"
                >
                  {CATEGORY_OPTIONS.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Platforms Multi-Select */}
              <div className="admin-editor-field">
                <label className="admin-editor-label">Supported Platforms</label>
                <div className="admin-editor-platforms-grid">
                  {PLATFORM_OPTIONS.map((plat) => {
                    const isSelected = platforms.includes(plat.value);
                    return (
                      <button
                        key={plat.value}
                        type="button"
                        className={`admin-editor-plat-chip ${
                          isSelected ? 'admin-editor-plat-chip--selected' : ''
                        }`}
                        onClick={() => handleTogglePlatform(plat.value)}
                      >
                        {plat.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tags Input */}
              <div className="admin-editor-field">
                <label className="admin-editor-label">Discovery Tags</label>
                <div className="admin-editor-add-row">
                  <Input
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    placeholder="Add tag and press enter..."
                    aria-label="Add discovery tag"
                  />
                  <Button variant="secondary" size="sm" onClick={handleAddTag}>
                    Add
                  </Button>
                </div>
                <div className="admin-editor-tags-chips">
                  {tags.map((t) => (
                    <span key={t} className="admin-editor-tag-chip">
                      #{t}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(t)}
                        aria-label={`Remove tag ${t}`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Visibility & Curation Settings */}
          <div className="admin-editor-card">
            <h2 className="admin-editor-card__title">Visibility & Curation</h2>
            <div className="admin-editor-fields">
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
                  <span className="admin-editor-checkbox-title">Featured Software</span>
                  <span className="admin-editor-checkbox-desc">
                    Showcase prominently on the homepage and featured shelf.
                  </span>
                </div>
              </label>

              <label className="admin-editor-checkbox-row">
                <input
                  type="checkbox"
                  checked={isPinned}
                  onChange={(e) => {
                    setIsPinned(e.target.checked);
                    setIsDirty(true);
                  }}
                />
                <div>
                  <span className="admin-editor-checkbox-title">Pin to Top</span>
                  <span className="admin-editor-checkbox-desc">
                    Keep at top of category listings regardless of sort.
                  </span>
                </div>
              </label>

              <div className="admin-editor-field">
                <label htmlFor="app-sort-order" className="admin-editor-label">
                  Manual Sort Order
                </label>
                <Input
                  id="app-sort-order"
                  type="number"
                  value={sortOrder}
                  onChange={(e) => {
                    setSortOrder(Number(e.target.value));
                    setIsDirty(true);
                  }}
                />
              </div>
            </div>
          </div>

          {/* SEO Metadata */}
          <div className="admin-editor-card">
            <h2 className="admin-editor-card__title">Search Engine Optimization</h2>
            <div className="admin-editor-fields">
              <div className="admin-editor-field">
                <div className="admin-editor-label-row">
                  <label htmlFor="app-seo-title" className="admin-editor-label">
                    SEO Meta Title
                  </label>
                  <span className="admin-editor-char-counter">{seoTitle.length}/70</span>
                </div>
                <Input
                  id="app-seo-title"
                  value={seoTitle}
                  onChange={(e) => {
                    setSeoTitle(e.target.value.slice(0, 70));
                    setIsDirty(true);
                  }}
                  placeholder="Custom page title for search engines..."
                />
              </div>

              <div className="admin-editor-field">
                <div className="admin-editor-label-row">
                  <label htmlFor="app-seo-desc" className="admin-editor-label">
                    SEO Meta Description
                  </label>
                  <span className="admin-editor-char-counter">{seoDescription.length}/160</span>
                </div>
                <textarea
                  id="app-seo-desc"
                  className="admin-editor-textarea"
                  value={seoDescription}
                  onChange={(e) => {
                    setSeoDescription(e.target.value.slice(0, 160));
                    setIsDirty(true);
                  }}
                  placeholder="Concise summary for Google search snippets..."
                  rows={3}
                />
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Add Platform Link Dialog */}
      <Dialog
        isOpen={isAddLinkModalOpen}
        onClose={() => setIsAddLinkModalOpen(false)}
        title="Add Platform Destination Link"
        description="Configure a new action button for this software application."
      >
        <div className="admin-editor-dialog-form">
          <div className="admin-editor-field">
            <label htmlFor="new-link-platform" className="admin-editor-label">
              Platform
            </label>
            <select
              id="new-link-platform"
              value={newLinkPlatform}
              onChange={(e) => setNewLinkPlatform(e.target.value as AppPlatform)}
              className="admin-editor-select"
            >
              {PLATFORM_OPTIONS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          <div className="admin-editor-field">
            <label htmlFor="new-link-label" className="admin-editor-label">
              Button Action Label
            </label>
            <Input
              id="new-link-label"
              value={newLinkLabel}
              onChange={(e) => setNewLinkLabel(e.target.value)}
              placeholder="e.g. Open Web App, Install Extension"
              required
            />
          </div>

          <div className="admin-editor-field">
            <label htmlFor="new-link-url" className="admin-editor-label">
              Destination URL <span className="admin-editor-required">*</span>
            </label>
            <Input
              id="new-link-url"
              type="url"
              value={newLinkUrl}
              onChange={(e) => setNewLinkUrl(e.target.value)}
              placeholder="https://..."
              required
            />
          </div>

          <div className="admin-editor-field">
            <label htmlFor="new-link-action-type" className="admin-editor-label">
              Smart Action Type
            </label>
            <select
              id="new-link-action-type"
              value={newLinkAction}
              onChange={(e) => setNewLinkAction(e.target.value as AppActionType)}
              className="admin-editor-select"
            >
              {ACTION_TYPES.map((a) => (
                <option key={a.value} value={a.value}>
                  {a.label}
                </option>
              ))}
            </select>
          </div>

          <label className="admin-editor-checkbox-row">
            <input
              type="checkbox"
              checked={newLinkIsPrimary}
              onChange={(e) => setNewLinkIsPrimary(e.target.checked)}
            />
            <div>
              <span className="admin-editor-checkbox-title">Set as Primary Action</span>
              <span className="admin-editor-checkbox-desc">
                Primary button displayed directly on discovery cards and detail banner.
              </span>
            </div>
          </label>

          <div className="admin-editor-dialog-actions">
            <Button variant="secondary" onClick={() => setIsAddLinkModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleAddLink} disabled={!newLinkUrl.trim()}>
              Add Link
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        title={`Live Preview: ${name || 'Application'}`}
        size="lg"
      >
        <div className="admin-apps-preview-content">
          <div className="admin-apps-preview-hero">
            {iconUrl ? (
              <img src={iconUrl} alt="" className="admin-apps-preview-icon" />
            ) : (
              <div className="admin-editor-icon-placeholder" style={{ width: 64, height: 64 }}>
                <Package size={32} />
              </div>
            )}
            <div>
              <h3 className="admin-apps-preview-name">{name || 'App Name'}</h3>
              <p className="admin-apps-preview-sub">
                {shortDescription || 'Short description preview...'}
              </p>
              <div className="admin-apps-preview-badges">
                <Badge variant="default" size="sm">
                  {primaryCategory}
                </Badge>
                <Badge variant="mono" size="sm">
                  v{currentVersion || '1.0.0'}
                </Badge>
              </div>
            </div>
          </div>

          <div className="admin-apps-preview-desc">
            <h4>Overview</h4>
            <p>{description || 'Full markdown description preview...'}</p>
          </div>

          {links.length > 0 && (
            <div className="admin-apps-preview-links">
              <h4>Destinations</h4>
              <div className="admin-apps-preview-links-grid">
                {links.map((link) => (
                  <div key={link.id} className="admin-apps-preview-link-card">
                    <span className="admin-apps-preview-link-plat">{link.platform}</span>
                    <span className="admin-apps-preview-link-label">{link.label}</span>
                    {link.isPrimary && (
                      <Badge variant="accent" size="sm">
                        Primary
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="admin-apps-preview-actions">
            <Button variant="secondary" onClick={() => setIsPreviewOpen(false)}>
              Close Preview
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Archive Confirmation Dialog */}
      <Dialog
        isOpen={isArchiveConfirmOpen}
        onClose={() => setIsArchiveConfirmOpen(false)}
        title="Archive Application"
        description={`Are you sure you want to archive "${name}"? The software will be hidden from the public store, but existing user bookmarks and settings will remain preserved.`}
      >
        <div className="admin-editor-dialog-actions">
          <Button variant="secondary" onClick={() => setIsArchiveConfirmOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => void handleConfirmArchive()}
            isLoading={isSaving}
            leftIcon={<Archive size={15} />}
          >
            Archive Application
          </Button>
        </div>
      </Dialog>
    </div>
  );
};
