'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, Button, Input, Badge } from '@elsesourav/ui';
import type { App, CategorySummary, TagSummary } from '@elsesourav/types';
import {
  createAppAction,
  updateAppAction,
  publishAppAction,
  archiveAppAction,
  deleteAppAction,
} from '../actions/admin-app-actions';
import {
  Package,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Upload,
  Globe,
  Tag,
  Sliders,
  ShieldAlert,
  Send,
  Archive,
  Trash2,
} from 'lucide-react';

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
  const [iconUrl, setIconUrl] = React.useState(app?.iconUrl || '');
  const [featuredImageUrl, setFeaturedImageUrl] = React.useState(app?.featuredImageUrl || '');
  const [demoUrl, setDemoUrl] = React.useState(app?.demoUrl || '');
  const [videoUrl, setVideoUrl] = React.useState(app?.videoUrl || '');
  const [categoryId, setCategoryId] = React.useState(app?.categoryId || categories[0]?.id || '');
  const [status, setStatus] = React.useState<'draft' | 'published' | 'archived'>(
    (app?.status as 'draft' | 'published' | 'archived') || 'draft'
  );
  const [isFeatured, setIsFeatured] = React.useState(app?.isFeatured ?? false);
  const [isPinned, setIsPinned] = React.useState(app?.isPinned ?? false);
  const [sortOrder, setSortOrder] = React.useState(app?.sortOrder ?? 0);
  const [seoTitle, setSeoTitle] = React.useState(app?.seoTitle || '');
  const [seoDescription, setSeoDescription] = React.useState(app?.seoDescription || '');

  // Publish Dialog State
  const [isPublishModalOpen, setIsPublishModalOpen] = React.useState(false);
  const [releaseVersion, setReleaseVersion] = React.useState('1.0.0');
  const [releaseChangelog, setReleaseChangelog] = React.useState('Initial production release.');
  const [releaseDownloadUrl, setReleaseDownloadUrl] = React.useState('');
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
      iconUrl: iconUrl.trim(),
      featuredImageUrl: featuredImageUrl.trim() || undefined,
      demoUrl: demoUrl.trim() || undefined,
      videoUrl: videoUrl.trim() || undefined,
      categoryId,
      status,
      isFeatured,
      isPinned,
      sortOrder: Number(sortOrder),
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

  const handlePublishRelease = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!app?.id || isPublishing) return;

    setIsPublishing(true);
    setError(null);

    try {
      const res = await publishAppAction(app.id, {
        version: releaseVersion.trim(),
        changelog: releaseChangelog.trim(),
        downloadUrl: releaseDownloadUrl.trim() || undefined,
      });

      if (res.success) {
        setStatus('published');
        setIsPublishModalOpen(false);
        setSuccess(`Application successfully published as ${releaseVersion}!`);
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
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-zinc-300">
                Application Name <span className="text-rose-400">*</span>
              </label>
              <Input
                type="text"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Developer Terminal Pro"
                required
                maxLength={100}
                className="bg-zinc-950/60 border-zinc-800 text-xs rounded-xl text-zinc-100"
              />
            </div>

            {/* Slug */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-zinc-300">
                URL Slug <span className="text-rose-400">*</span>
              </label>
              <Input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase())}
                placeholder="developer-terminal-pro"
                required
                maxLength={50}
                className="bg-zinc-950/60 border-zinc-800 text-xs rounded-xl text-zinc-100 font-mono"
              />
            </div>
          </div>

          {/* Short Description */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-zinc-300">
              Short Description <span className="text-rose-400">*</span>
            </label>
            <Input
              type="text"
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              placeholder="1-2 sentences summarizing features for cards and search results..."
              required
              maxLength={250}
              className="bg-zinc-950/60 border-zinc-800 text-xs rounded-xl text-zinc-100"
            />
          </div>

          {/* Full Description */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-zinc-300">
              Full Description & Documentation <span className="text-rose-400">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Comprehensive application overview, architecture notes, and documentation..."
              required
              rows={6}
              className="w-full bg-zinc-950/60 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-100 focus:border-indigo-500 focus:outline-none leading-relaxed"
            />
          </div>
        </Card>

        {/* Media & URLs Card */}
        <Card className="p-6 rounded-3xl border-zinc-800/80 bg-zinc-900/40 backdrop-blur-xl space-y-5">
          <div className="flex items-center gap-2 text-xs font-bold text-zinc-300 uppercase tracking-wider">
            <Upload className="w-4 h-4 text-purple-400" />
            <span>Media Assets & Links</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Icon URL */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-zinc-300">
                Icon URL <span className="text-rose-400">*</span>
              </label>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center overflow-hidden shrink-0">
                  {iconUrl ? (
                    <img src={iconUrl} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <Package className="w-5 h-5 text-zinc-600" />
                  )}
                </div>
                <Input
                  type="url"
                  value={iconUrl}
                  onChange={(e) => setIconUrl(e.target.value)}
                  placeholder="https://res.cloudinary.com/..."
                  required
                  className="bg-zinc-950/60 border-zinc-800 text-xs rounded-xl text-zinc-100 flex-1"
                />
              </div>
            </div>

            {/* Featured Image URL */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-zinc-300">Featured Image Banner URL</label>
              <Input
                type="url"
                value={featuredImageUrl}
                onChange={(e) => setFeaturedImageUrl(e.target.value)}
                placeholder="https://res.cloudinary.com/..."
                className="bg-zinc-950/60 border-zinc-800 text-xs rounded-xl text-zinc-100"
              />
            </div>

            {/* Demo URL */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-zinc-300">Interactive Demo URL</label>
              <Input
                type="url"
                value={demoUrl}
                onChange={(e) => setDemoUrl(e.target.value)}
                placeholder="https://demo.elsesourav.com/..."
                className="bg-zinc-950/60 border-zinc-800 text-xs rounded-xl text-zinc-100"
              />
            </div>

            {/* Video URL */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-zinc-300">Showcase Video URL</label>
              <Input
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://youtube.com/..."
                className="bg-zinc-950/60 border-zinc-800 text-xs rounded-xl text-zinc-100"
              />
            </div>
          </div>
        </Card>

        {/* Taxonomy & Configuration Card */}
        <Card className="p-6 rounded-3xl border-zinc-800/80 bg-zinc-900/40 backdrop-blur-xl space-y-5">
          <div className="flex items-center gap-2 text-xs font-bold text-zinc-300 uppercase tracking-wider">
            <Sliders className="w-4 h-4 text-emerald-400" />
            <span>Taxonomy & Visibility</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Category */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-zinc-300">
                Primary Category <span className="text-rose-400">*</span>
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                required
                className="w-full bg-zinc-950/60 border border-zinc-800 text-xs rounded-xl px-3 py-2.5 text-zinc-100 focus:border-indigo-500 focus:outline-none"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-zinc-300">Publish Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'draft' | 'published' | 'archived')}
                className="w-full bg-zinc-950/60 border border-zinc-800 text-xs rounded-xl px-3 py-2.5 text-zinc-100 focus:border-indigo-500 focus:outline-none uppercase font-mono"
              >
                <option value="draft">DRAFT</option>
                <option value="published">PUBLISHED</option>
                <option value="archived">ARCHIVED</option>
              </select>
            </div>

            {/* Sort Order */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-zinc-300">Display Sort Order</label>
              <Input
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(Number(e.target.value))}
                min={0}
                className="bg-zinc-950/60 border-zinc-800 text-xs rounded-xl text-zinc-100 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-zinc-800/60">
            {/* Featured Switch */}
            <label className="flex items-center justify-between p-3 rounded-xl bg-zinc-950/40 border border-zinc-800/60 cursor-pointer">
              <div>
                <div className="text-xs font-semibold text-zinc-200">Featured Application</div>
                <div className="text-[11px] text-zinc-400">Highlights app on homepage hero spotlight.</div>
              </div>
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="rounded border-zinc-800 bg-zinc-900 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
              />
            </label>

            {/* Pinned Switch */}
            <label className="flex items-center justify-between p-3 rounded-xl bg-zinc-950/40 border border-zinc-800/60 cursor-pointer">
              <div>
                <div className="text-xs font-semibold text-zinc-200">Pinned to Top</div>
                <div className="text-[11px] text-zinc-400">Always ranks first in catalog grids.</div>
              </div>
              <input
                type="checkbox"
                checked={isPinned}
                onChange={(e) => setIsPinned(e.target.checked)}
                className="rounded border-zinc-800 bg-zinc-900 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
              />
            </label>
          </div>
        </Card>

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
      {isPublishModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-indigo-500/40 bg-zinc-900 p-6 space-y-5 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-950/80 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shrink-0">
                <Send className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-zinc-100">Publish Application Release</h3>
                <p className="text-xs text-zinc-400">Creates an immutable version release entry.</p>
              </div>
            </div>

            <form onSubmit={handlePublishRelease} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="block font-semibold text-zinc-300">
                  Release Version <span className="text-rose-400">*</span>
                </label>
                <Input
                  type="text"
                  value={releaseVersion}
                  onChange={(e) => setReleaseVersion(e.target.value)}
                  placeholder="e.g. 1.0.0"
                  required
                  className="bg-zinc-950 border-zinc-800 text-xs rounded-xl text-zinc-100 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block font-semibold text-zinc-300">
                  Changelog Summary <span className="text-rose-400">*</span>
                </label>
                <textarea
                  value={releaseChangelog}
                  onChange={(e) => setReleaseChangelog(e.target.value)}
                  placeholder="What is new in this release version..."
                  required
                  rows={4}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-100 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block font-semibold text-zinc-300">Download Asset URL (optional)</label>
                <Input
                  type="url"
                  value={releaseDownloadUrl}
                  onChange={(e) => setReleaseDownloadUrl(e.target.value)}
                  placeholder="https://github.com/.../release.zip"
                  className="bg-zinc-950 border-zinc-800 text-xs rounded-xl text-zinc-100"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={isPublishing}
                  onClick={() => setIsPublishModalOpen(false)}
                  className="text-xs text-zinc-400"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isPublishing}
                  size="sm"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-xl gap-1.5"
                >
                  {isPublishing ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Publishing...</span>
                    </>
                  ) : (
                    <span>Publish Release</span>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
