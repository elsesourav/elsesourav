'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, Button, Input } from '@elsesourav/ui';
import type { HelpArticle, HelpCategoryWithArticles } from '@elsesourav/types';
import {
  createHelpArticleAction,
  updateHelpArticleAction,
  publishHelpArticleAction,
  archiveHelpArticleAction,
  deleteHelpArticleAction,
} from '../actions/admin-help-actions';
import {
  HelpCircle,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Send,
  Archive,
  Trash2,
} from 'lucide-react';

interface AdminHelpFormProps {
  article?: HelpArticle;
  categories: readonly HelpCategoryWithArticles[];
}

export function AdminHelpForm({ article, categories }: AdminHelpFormProps) {
  const router = useRouter();
  const isEditing = Boolean(article?.id);

  // Form State
  const [title, setTitle] = React.useState(article?.title || '');
  const [slug, setSlug] = React.useState(article?.slug || '');
  const [excerpt, setExcerpt] = React.useState(article?.excerpt || '');
  const [content, setContent] = React.useState(article?.content || '');
  const [categoryId, setCategoryId] = React.useState(article?.categoryId || categories[0]?.id || '');
  const [orderIndex, setOrderIndex] = React.useState(article?.orderIndex ?? 0);
  const [status, setStatus] = React.useState<'draft' | 'published' | 'archived'>(
    (article?.status as 'draft' | 'published' | 'archived') || 'draft'
  );
  const [seoTitle, setSeoTitle] = React.useState(article?.seoTitle || '');
  const [seoDescription, setSeoDescription] = React.useState(article?.seoDescription || '');

  // Status & Feedback
  const [isSaving, setIsSaving] = React.useState(false);
  const [isPublishing, setIsPublishing] = React.useState(false);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const handleTitleChange = (val: string) => {
    setTitle(val);
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
      title: title.trim(),
      slug: slug.trim().toLowerCase() || undefined,
      excerpt: excerpt.trim() || undefined,
      content: content.trim(),
      categoryId,
      orderIndex: Number(orderIndex),
      status,
      seoTitle: seoTitle.trim() || undefined,
      seoDescription: seoDescription.trim() || undefined,
    };

    try {
      if (isEditing && article?.id) {
        const res = await updateHelpArticleAction(article.id, payload);
        if (res.success) {
          setSuccess('Help article updated successfully.');
        } else {
          setError(res.error || 'Failed to update help article.');
        }
      } else {
        const res = await createHelpArticleAction(payload);
        if (res.success && res.articleId) {
          setSuccess('Help article created successfully. Redirecting...');
          router.push(`/admin/help/${res.articleId}`);
        } else {
          setError(res.error || 'Failed to create help article.');
        }
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!article?.id || isPublishing) return;
    setIsPublishing(true);
    setError(null);

    try {
      const res = await publishHelpArticleAction(article.id);
      if (res.success) {
        setStatus('published');
        setSuccess('Help article published live to knowledge base!');
      } else {
        setError(res.error || 'Failed to publish article.');
      }
    } catch {
      setError('Failed to publish article.');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleArchive = async () => {
    if (!article?.id) return;
    try {
      const res = await archiveHelpArticleAction(article.id);
      if (res.success) {
        setStatus('archived');
        setSuccess('Help article archived.');
      }
    } catch {
      setError('Failed to archive article.');
    }
  };

  const handleDelete = async () => {
    if (!article?.id) return;
    if (!window.confirm('Are you sure you want to permanently delete this help article?')) return;

    try {
      const res = await deleteHelpArticleAction(article.id);
      if (res.success) {
        router.push('/admin/help');
      }
    } catch {
      setError('Failed to delete article.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/help"
            className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-zinc-100 tracking-tight">
              {isEditing ? `Edit: ${article?.title}` : 'Create Help Article'}
            </h1>
            <p className="text-xs text-zinc-400">
              {isEditing
                ? `ID: ${article?.id} • Current status: ${status.toUpperCase()}`
                : 'Add guides, tutorials, and documentation to the ElseSourav Help Center.'}
            </p>
          </div>
        </div>

        {isEditing && (
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isPublishing}
              onClick={handlePublish}
              className="text-xs border-indigo-500/40 text-indigo-300 hover:bg-indigo-950/40 gap-1.5"
            >
              {isPublishing ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              <span>Publish Live</span>
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

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-6 rounded-3xl border-zinc-800/80 bg-zinc-900/40 backdrop-blur-xl space-y-5">
          <div className="flex items-center gap-2 text-xs font-bold text-zinc-300 uppercase tracking-wider">
            <HelpCircle className="w-4 h-4 text-indigo-400" />
            <span>Article Information</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Title */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-zinc-300">
                Article Title <span className="text-rose-400">*</span>
              </label>
              <Input
                type="text"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g. How to install Chrome extensions"
                required
                maxLength={150}
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
                placeholder="how-to-install-chrome-extensions"
                required
                maxLength={100}
                className="bg-zinc-950/60 border-zinc-800 text-xs rounded-xl text-zinc-100 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category Dropdown */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-zinc-300">
                Knowledge Base Category <span className="text-rose-400">*</span>
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

            {/* Order Index */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-zinc-300">Display Order Index</label>
              <Input
                type="number"
                value={orderIndex}
                onChange={(e) => setOrderIndex(Number(e.target.value))}
                min={0}
                className="bg-zinc-950/60 border-zinc-800 text-xs rounded-xl text-zinc-100 font-mono"
              />
            </div>
          </div>

          {/* Excerpt */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-zinc-300">Quick Excerpt</label>
            <Input
              type="text"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Brief summary sentence..."
              maxLength={250}
              className="bg-zinc-950/60 border-zinc-800 text-xs rounded-xl text-zinc-100"
            />
          </div>

          {/* Markdown Content */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-zinc-300">
              Documentation Content <span className="text-rose-400">*</span>
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write full article guide with step-by-step instructions in Markdown..."
              required
              rows={10}
              className="w-full bg-zinc-950/60 border border-zinc-800 rounded-xl p-3.5 text-xs text-zinc-100 focus:border-indigo-500 focus:outline-none font-mono leading-relaxed"
            />
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4">
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
                <span>{isEditing ? 'Save Changes' : 'Create Article'}</span>
              </>
            )}
          </Button>

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
    </div>
  );
}
