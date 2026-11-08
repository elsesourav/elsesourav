'use client';

import { AdminMarkdownEditor } from '@/features/admin/components/AdminMarkdownEditor';
import { AdminAppMediaSection } from './AdminAppMediaSection';
import type { App, CategorySummary, TagSummary } from '@elsesourav/types';
import { Button, Card } from '@elsesourav/ui';
import { FloatingLabelInput } from '@elsesourav/ui/interior';
import {
  AlertCircle,
  Archive,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Package,
  Send,
  Sparkles,
  Trash2,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import {
  archiveAppAction,
  createAppAction,
  deleteAppAction,
  publishAppAction,
  updateAppAction,
} from '../actions/admin-app-actions';
import { AdminAppVisibilitySettings } from './AdminAppVisibilitySettings';
import { PublishReleaseModal } from './PublishReleaseModal';

interface AdminAppFormProps {
  app?: App;
  categories: readonly CategorySummary[];
  tags?: readonly TagSummary[];
}

export function AdminAppForm({ app, categories }: AdminAppFormProps) {
  const router = useRouter();
  const isEditing = Boolean(app?.id);

  // Form State
  const [name, setName] = React.useState(app?.name || '');
  const [slug, setSlug] = React.useState(app?.slug || '');
  const [shortDescription, setShortDescription] = React.useState(app?.shortDescription || '');
  const [description, setDescription] = React.useState(app?.description || '');
  const [documentationMd, setDocumentationMd] = React.useState(app?.documentationMd || '');
  const [iconUrl, setIconUrl] = React.useState(app?.iconUrl || '');
  const [featuredImageUrl, setFeaturedImageUrl] = React.useState(app?.featuredImageUrl || '');
  const [featuredImageMobileUrl, setFeaturedImageMobileUrl] = React.useState(
    app?.featuredImageMobileUrl || ''
  );
  const [demoUrl, setDemoUrl] = React.useState(app?.demoUrl || '');
  const [videoUrl, setVideoUrl] = React.useState(app?.videoUrl || '');
  const [categoryId, setCategoryId] = React.useState(app?.categoryId || categories[0]?.id || '');
  const [status, setStatus] = React.useState<'draft' | 'published' | 'archived'>(
    (app?.status as 'draft' | 'published' | 'archived') || 'draft'
  );

  const categoryItems = React.useMemo(
    () => categories.map((c) => ({ value: c.id, label: c.name })),
    [categories]
  );

  const statusItems = React.useMemo(
    () => [
      { value: 'draft', label: 'DRAFT' },
      { value: 'published', label: 'PUBLISHED' },
      { value: 'archived', label: 'ARCHIVED' },
    ],
    []
  );
  const [isFeatured, setIsFeatured] = React.useState(app?.isFeatured ?? false);
  const [isPinned, setIsPinned] = React.useState(app?.isPinned ?? false);
  const [requiresAuth, setRequiresAuth] = React.useState(app?.requiresAuth ?? false);
  const [sortOrder, setSortOrder] = React.useState(app?.sortOrder ?? 0);
  const [seoTitle, setSeoTitle] = React.useState(app?.seoTitle || '');
  const [seoDescription, setSeoDescription] = React.useState(app?.seoDescription || '');
  const [bundleSize, setBundleSize] = React.useState(app?.bundleSize || '');
  const [primaryLanguage, setPrimaryLanguage] = React.useState(app?.primaryLanguage || 'en');

  // Publish Dialog State
  const [isPublishModalOpen, setIsPublishModalOpen] = React.useState(false);
  const [isPublishing, setIsPublishing] = React.useState(false);

  // Status & Feedback
  const [isSaving, setIsSaving] = React.useState(false);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  // Auto-generate slug from name if creating
  const handleNameChange = (val: string) => {
    setName(val);
    if (!isEditing && !slug) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '')
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccess(null);
    setError(null);

    const payload = {
      name: name.trim(),
      slug: slug.trim().toLowerCase(),
      shortDescription: shortDescription.trim(),
      description: description.trim(),
      documentationMd: documentationMd.trim() || undefined,
      iconUrl: iconUrl.trim(),
      featuredImageUrl: featuredImageUrl.trim() || undefined,
      featuredImageMobileUrl: featuredImageMobileUrl.trim() || undefined,
      demoUrl: demoUrl.trim() || undefined,
      videoUrl: videoUrl.trim() || undefined,
      categoryId,
      status,
      isFeatured,
      isPinned,
      requiresAuth,
      sortOrder: Number(sortOrder),
      bundleSize: bundleSize.trim() || undefined,
      primaryLanguage: primaryLanguage.trim() || undefined,
      seoTitle: seoTitle.trim() || undefined,
      seoDescription: seoDescription.trim() || undefined,
    };

    try {
      if (isEditing && app?.id) {
        const res = await updateAppAction(app.id, payload);
        if (res.success) {
          setSuccess('Application updated successfully.');
        } else {
          setError(res.error || 'Failed to update application.');
        }
      } else {
        const res = await createAppAction(payload);
        if (res.success && res.appId) {
          setSuccess('Application created successfully. Redirecting...');
          router.push(`/admin/apps/${res.appId}`);
        } else {
          setError(res.error || 'Failed to create application.');
        }
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublishRelease = async (versionData: {
    version: string;
    changelog: string;
    downloadUrl?: string;
  }) => {
    if (!app?.id || isPublishing) return;

    setIsPublishing(true);
    setError(null);

    try {
      const res = await publishAppAction(app.id, {
        version: versionData.version.trim(),
        changelog: versionData.changelog.trim(),
        downloadUrl: versionData.downloadUrl?.trim() || undefined,
      });

      if (res.success) {
        setStatus('published');
        setIsPublishModalOpen(false);
        setSuccess(`Application successfully published as ${versionData.version}!`);
      } else {
        setError(res.error || 'Failed to publish release.');
      }
    } catch {
      setError('Failed to publish release.');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleArchive = async () => {
    if (!app?.id) return;
    try {
      const res = await archiveAppAction(app.id);
      if (res.success) {
        setStatus('archived');
        setSuccess('Application archived.');
      }
    } catch {
      setError('Failed to archive application.');
    }
  };

  const handleDelete = async () => {
    if (!app?.id) return;
    if (!window.confirm('Are you sure you want to permanently delete this application?')) return;

    try {
      const res = await deleteAppAction(app.id);
      if (res.success) {
        router.push('/admin/apps');
      }
    } catch {
      setError('Failed to delete application.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/apps"
            className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-zinc-100 tracking-tight">
              {isEditing ? `Edit: ${app?.name}` : 'New Application'}
            </h1>
            <p className="text-xs text-zinc-400">
              {isEditing
                ? `ID: ${app?.id} • Current status: ${status.toUpperCase()}`
                : 'Add a new software product to the ElseSourav platform.'}
            </p>
          </div>
        </div>

        {isEditing && (
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsPublishModalOpen(true)}
              className="text-xs border-indigo-500/40 text-indigo-300 hover:bg-indigo-950/40 gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Publish Release</span>
            </Button>
          </div>
        )}
      </div>

      {success && (
        <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex items-center gap-2.5 text-xs text-emerald-300">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/30 flex items-center gap-2.5 text-xs text-rose-300">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main App Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Core Metadata Card */}
        <Card className="p-6 rounded-3xl border-zinc-800/80 bg-zinc-900/40 backdrop-blur-xl space-y-5">
          <div className="flex items-center gap-2 text-xs font-bold text-zinc-300 uppercase tracking-wider">
            <Package className="w-4 h-4 text-indigo-400" />
            <span>General Information</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Name */}
            <FloatingLabelInput
              label="Application Name"
              type="text"
              value={name}
              onChange={(val) => handleNameChange(val)}
              placeholder="e.g. Developer Terminal Pro"
              required
              maxLength={100}
            />

            {/* Slug */}
            <FloatingLabelInput
              label="URL Slug"
              type="text"
              value={slug}
              onChange={(val) => setSlug(val.toLowerCase())}
              placeholder="developer-terminal-pro"
              required
              maxLength={50}
            />
          </div>

          {/* Short Description */}
          <FloatingLabelInput
            label="Short Description"
            type="text"
            value={shortDescription}
            onChange={(val) => setShortDescription(val)}
            placeholder="1-2 sentences summarizing features for cards and search results..."
            required
            maxLength={250}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Custom / Calculated Bundle Size */}
            <FloatingLabelInput
              label="Build / Bundle Size (Optional)"
              type="text"
              value={bundleSize}
              onChange={(val) => setBundleSize(val)}
              placeholder="e.g. 2.4 MB, 850 KB (empty = auto calculated)"
              maxLength={50}
            />

            {/* Primary Language */}
            <FloatingLabelInput
              label="Primary Language / Tech"
              type="text"
              value={primaryLanguage}
              onChange={(val) => setPrimaryLanguage(val)}
              placeholder="e.g. en, TypeScript, English"
              maxLength={50}
            />
          </div>

          {/* Marketing Overview Description */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-zinc-300">
              Overview & Marketing Description <span className="text-rose-400">*</span>
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              minLength={20}
              placeholder="Detailed overview of what this application does, key capabilities, and value proposition..."
              className="w-full rounded-xl bg-zinc-950/60 border border-zinc-800 p-3 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <p className="text-[11px] text-zinc-500">
              Minimum 20 characters. Plain text overview for cards and product summaries.
            </p>
          </div>

          {/* Full Long-Form Markdown Documentation */}
          <AdminMarkdownEditor
            label="Technical Documentation & Guides (Markdown)"
            value={documentationMd}
            onChange={setDocumentationMd}
            rows={10}
            placeholder="Comprehensive application overview, architecture notes, getting started instructions, CLI commands, and feature lists in Markdown..."
            helperText="Supports headings, code blocks, screenshots, architecture notes, shortcuts, and tables"
          />
        </Card>

        {/* Media & URLs Card */}
        <AdminAppMediaSection
          iconUrl={iconUrl}
          setIconUrl={setIconUrl}
          featuredImageUrl={featuredImageUrl}
          setFeaturedImageUrl={setFeaturedImageUrl}
          featuredImageMobileUrl={featuredImageMobileUrl}
          setFeaturedImageMobileUrl={setFeaturedImageMobileUrl}
          demoUrl={demoUrl}
          setDemoUrl={setDemoUrl}
          videoUrl={videoUrl}
          setVideoUrl={setVideoUrl}
        />

        {/* Taxonomy & Configuration Settings */}
        <AdminAppVisibilitySettings
          categoryId={categoryId}
          setCategoryId={setCategoryId}
          categoryItems={categoryItems}
          status={status}
          setStatus={setStatus}
          statusItems={statusItems}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
          isFeatured={isFeatured}
          setIsFeatured={setIsFeatured}
          isPinned={isPinned}
          setIsPinned={setIsPinned}
          requiresAuth={requiresAuth}
          setRequiresAuth={setRequiresAuth}
          seoTitle={seoTitle}
          setSeoTitle={setSeoTitle}
          seoDescription={seoDescription}
          setSeoDescription={setSeoDescription}
        />

        {/* Submit Actions */}
        <div className="flex items-center justify-between pt-4">
          <div className="flex items-center gap-3">
            <Button
              type="submit"
              disabled={isSaving}
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-5 py-2.5 rounded-xl gap-2 shadow-lg shadow-indigo-600/20"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isEditing ? 'Save App Changes' : 'Create Application'}</span>
                </>
              )}
            </Button>
          </div>

          {isEditing && (
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleArchive}
                className="text-xs border-zinc-800 text-zinc-400 hover:text-amber-300"
              >
                <Archive className="w-3.5 h-3.5 mr-1" /> Archive
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleDelete}
                className="text-xs border-zinc-800 text-zinc-400 hover:text-rose-400"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
              </Button>
            </div>
          )}
        </div>
      </form>

      {/* Publish Release Modal */}
      <PublishReleaseModal
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        onPublish={handlePublishRelease}
        isPublishing={isPublishing}
      />
    </div>
  );
}
