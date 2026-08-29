'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, Button, Input } from '@elsesourav/ui';
import type { BlogPost, BlogCategory, BlogTag } from '@elsesourav/types';
import {
  createBlogPostAction,
  updateBlogPostAction,
  publishBlogPostAction,
  archiveBlogPostAction,
  deleteBlogPostAction,
} from '../actions/admin-blog-actions';
import {
  FileText,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Upload,
  Send,
  Archive,
  Trash2,
} from 'lucide-react';

interface AdminBlogFormProps {
  post?: BlogPost;
  categories: readonly BlogCategory[];
  tags?: readonly BlogTag[];
}

export function AdminBlogForm({ post, categories }: AdminBlogFormProps) {
  const router = useRouter();
  const isEditing = Boolean(post?.id);

  // Form State
  const [title, setTitle] = React.useState(post?.title || '');
  const [slug, setSlug] = React.useState(post?.slug || '');
  const [excerpt, setExcerpt] = React.useState(post?.excerpt || '');
  const [content, setContent] = React.useState(post?.content || '');
  const [coverImageUrl, setCoverImageUrl] = React.useState(post?.coverImageUrl || '');
  const [categoryId, setCategoryId] = React.useState(post?.categoryId || categories[0]?.id || '');
  const [status, setStatus] = React.useState<'draft' | 'published' | 'archived'>(
    (post?.status as 'draft' | 'published' | 'archived') || 'draft'
  );
  const [seoTitle, setSeoTitle] = React.useState(post?.seoTitle || '');
  const [seoDescription, setSeoDescription] = React.useState(post?.seoDescription || '');

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
      excerpt: excerpt.trim(),
      content: content.trim(),
      coverImageUrl: coverImageUrl.trim() || undefined,
      categoryId,
      status,
      seoTitle: seoTitle.trim() || undefined,
      seoDescription: seoDescription.trim() || undefined,
    };

    try {
      if (isEditing && post?.id) {
        const res = await updateBlogPostAction(post.id, payload);
        if (res.success) {
          setSuccess('Article updated successfully.');
        } else {
          setError(res.error || 'Failed to update article.');
        }
      } else {
        const res = await createBlogPostAction(payload);
        if (res.success && res.postId) {
          setSuccess('Article created successfully. Redirecting...');
          router.push(`/admin/blog/${res.postId}`);
        } else {
          setError(res.error || 'Failed to create article.');
        }
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!post?.id || isPublishing) return;
    setIsPublishing(true);
    setError(null);

    try {
      const res = await publishBlogPostAction(post.id);
      if (res.success) {
        setStatus('published');
        setSuccess('Article published live to the public devlog!');
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
    if (!post?.id) return;
    try {
      const res = await archiveBlogPostAction(post.id);
      if (res.success) {
        setStatus('archived');
        setSuccess('Article archived.');
      }
    } catch {
      setError('Failed to archive article.');
    }
  };

  const handleDelete = async () => {
    if (!post?.id) return;
    if (!window.confirm('Are you sure you want to permanently delete this article?')) return;

    try {
      const res = await deleteBlogPostAction(post.id);
      if (res.success) {
        router.push('/admin/blog');
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
            href="/admin/blog"
            className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-zinc-100 tracking-tight">
              {isEditing ? `Edit: ${post?.title}` : 'Write New Article'}
            </h1>
            <p className="text-xs text-zinc-400">
              {isEditing
                ? `ID: ${post?.id} • Current status: ${status.toUpperCase()}`
                : 'Create and publish developer updates, deep dives, and product changelogs.'}
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

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-6 rounded-3xl border-zinc-800/80 bg-zinc-900/40 backdrop-blur-xl space-y-5">
          <div className="flex items-center gap-2 text-xs font-bold text-zinc-300 uppercase tracking-wider">
            <FileText className="w-4 h-4 text-indigo-400" />
            <span>Article Content</span>
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
                placeholder="e.g. Building ElseSourav V2: Next.js 15 Migration"
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
                placeholder="building-elsesourav-v2-nextjs-15-migration"
                required
                maxLength={100}
                className="bg-zinc-950/60 border-zinc-800 text-xs rounded-xl text-zinc-100 font-mono"
              />
            </div>
          </div>

          {/* Excerpt */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-zinc-300">
              Summary Excerpt <span className="text-rose-400">*</span>
            </label>
            <Input
              type="text"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="1-2 sentences summarizing key takeaways for RSS, preview cards, and search..."
              required
              maxLength={300}
              className="bg-zinc-950/60 border-zinc-800 text-xs rounded-xl text-zinc-100"
            />
          </div>

          {/* Markdown Content */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-zinc-300">
              Markdown Article Content <span className="text-rose-400">*</span>
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write full article in Markdown format with code blocks, headings, and links..."
              required
              rows={12}
              className="w-full bg-zinc-950/60 border border-zinc-800 rounded-xl p-3.5 text-xs text-zinc-100 focus:border-indigo-500 focus:outline-none font-mono leading-relaxed"
            />
          </div>
        </Card>

        {/* Media & Category Card */}
        <Card className="p-6 rounded-3xl border-zinc-800/80 bg-zinc-900/40 backdrop-blur-xl space-y-5">
          <div className="flex items-center gap-2 text-xs font-bold text-zinc-300 uppercase tracking-wider">
            <Upload className="w-4 h-4 text-purple-400" />
            <span>Media & Taxonomy</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Cover Image URL */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-zinc-300">Cover Banner Image URL</label>
              <Input
                type="url"
                value={coverImageUrl}
                onChange={(e) => setCoverImageUrl(e.target.value)}
                placeholder="https://res.cloudinary.com/..."
                className="bg-zinc-950/60 border-zinc-800 text-xs rounded-xl text-zinc-100"
              />
            </div>

            {/* Category Dropdown */}
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
