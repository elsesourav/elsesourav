'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button, Card, Input, Switch } from '@elsesourav/ui';
import { FloatingLabelInput } from '@elsesourav/ui/interior';
import { ImageInputWithLibrary } from '@/features/admin/media/components/ImageInputWithLibrary';
import { AdminCarouselPreview } from './AdminCarouselPreview';
import type { CarouselSlide } from '@elsesourav/types';
import {
  createCarouselSlideAction,
  updateCarouselSlideAction,
  deleteCarouselSlideAction,
} from '../actions/admin-carousel-actions';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  GalleryHorizontalEnd,
  Loader2,
  Save,
  Trash2,
} from 'lucide-react';

export interface AdminCarouselFormProps {
  slide?: CarouselSlide;
}

export function AdminCarouselForm({ slide }: AdminCarouselFormProps) {
  const router = useRouter();
  const isEditing = Boolean(slide?.id);

  // Form State
  const [title, setTitle] = React.useState(slide?.title || '');
  const [subtitle, setSubtitle] = React.useState(slide?.subtitle || '');
  const [desktopImageUrl, setDesktopImageUrl] = React.useState(slide?.desktopImageUrl || '');
  const [mobileImageUrl, setMobileImageUrl] = React.useState(slide?.mobileImageUrl || '');
  const [targetUrl, setTargetUrl] = React.useState(slide?.targetUrl || '');
  const [badgeText, setBadgeText] = React.useState(slide?.badgeText || '');
  const [sortOrder, setSortOrder] = React.useState(slide?.sortOrder ?? 0);
  const [isActive, setIsActive] = React.useState(slide?.isActive ?? true);

  // Status & Error
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Client-side validations
    if (!title.trim()) {
      setErrorMessage('Slide title is required.');
      return;
    }
    if (!desktopImageUrl.trim()) {
      setErrorMessage('Desktop featured banner image (21:9) is required.');
      return;
    }
    if (!targetUrl.trim()) {
      setErrorMessage('Target navigation URL is required.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        title: title.trim(),
        subtitle: subtitle.trim() || undefined,
        desktopImageUrl: desktopImageUrl.trim(),
        mobileImageUrl: mobileImageUrl.trim() || undefined,
        targetUrl: targetUrl.trim(),
        badgeText: badgeText.trim() || undefined,
        sortOrder: Number(sortOrder) || 0,
        isActive,
      };

      if (isEditing && slide) {
        const result = await updateCarouselSlideAction(slide.id, payload);
        if (!result.success) {
          setErrorMessage(result.error || 'Failed to update slide.');
          setIsSubmitting(false);
          return;
        }
        setSuccessMessage('Carousel slide updated successfully.');
      } else {
        const result = await createCarouselSlideAction(payload);
        if (!result.success) {
          setErrorMessage(result.error || 'Failed to create slide.');
          setIsSubmitting(false);
          return;
        }
        setSuccessMessage('Carousel slide created successfully.');
        router.push('/admin/carousel');
        return;
      }

      router.refresh();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!slide?.id) return;
    if (!window.confirm(`Are you sure you want to delete "${slide.title}"?`)) return;

    setIsDeleting(true);
    try {
      const result = await deleteCarouselSlideAction(slide.id);
      if (result.success) {
        router.push('/admin/carousel');
      } else {
        setErrorMessage(result.error || 'Failed to delete slide.');
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to delete slide.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8 w-full max-w-4xl mx-auto pb-12">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/admin/carousel">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-xl px-2.5 h-9 text-xs"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <GalleryHorizontalEnd className="w-5 h-5 text-indigo-500" />
              <span>{isEditing ? 'Edit Carousel Slide' : 'Create Carousel Slide'}</span>
            </h1>
            <p className="text-xs text-zinc-500 mt-0.5">
              Configure hero banner visuals, target navigation link, and badge callouts.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 self-end sm:self-center">
          {isEditing && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={isDeleting || isSubmitting}
              onClick={handleDelete}
              className="rounded-xl text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs"
            >
              {isDeleting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
              ) : (
                <Trash2 className="w-3.5 h-3.5 mr-1" />
              )}
              Delete
            </Button>
          )}

          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={isSubmitting}
            className="rounded-xl shadow-sm text-xs font-semibold px-4"
          >
            {isSubmitting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
            ) : (
              <Save className="w-3.5 h-3.5 mr-1.5" />
            )}
            {isEditing ? 'Save Changes' : 'Publish Slide'}
          </Button>
        </div>
      </div>

      {/* Error / Success Banners */}
      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Live Preview Component */}
      <AdminCarouselPreview
        title={title}
        subtitle={subtitle}
        desktopImageUrl={desktopImageUrl}
        mobileImageUrl={mobileImageUrl}
        targetUrl={targetUrl}
        badgeText={badgeText}
      />

      {/* Main Details Card */}
      <Card className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/40 backdrop-blur-xl space-y-4 sm:space-y-5 shadow-sm">
        <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-300 uppercase tracking-wider">
          Slide Details & Content
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Title */}
          <div className="sm:col-span-2">
            <FloatingLabelInput
              label="Slide Title"
              value={title}
              onChange={(val) => setTitle(val)}
              placeholder="e.g. GLOROV Enterprise Monorepo Release"
              required
            />
          </div>

          {/* Subtitle */}
          <div className="sm:col-span-2">
            <FloatingLabelInput
              label="Subtitle / Supporting Tagline (Optional)"
              value={subtitle}
              onChange={(val) => setSubtitle(val)}
              placeholder="e.g. Indian botanical e-commerce monorepo with headless Medusa v2"
            />
          </div>

          {/* Target URL */}
          <div className="sm:col-span-2">
            <FloatingLabelInput
              label="Target Navigation URL"
              type="text"
              value={targetUrl}
              onChange={(val) => setTargetUrl(val)}
              placeholder="/apps/glorov, https://..., or /updates/..."
              required
            />
            <p className="text-[11px] text-zinc-500 mt-1">
              Supports internal routes (e.g. <code className="font-mono">/apps/glorov</code>) or external links (<code className="font-mono">https://...</code>).
            </p>
          </div>

          {/* Badge Callout */}
          <div>
            <FloatingLabelInput
              label="Badge Callout (Optional)"
              value={badgeText}
              onChange={(val) => setBadgeText(val)}
              placeholder="e.g. FEATURED, OFFICIAL LAUNCH, NEW"
            />
          </div>

          {/* Sort Order */}
          <div>
            <FloatingLabelInput
              label="Display Sort Order"
              type="number"
              value={String(sortOrder)}
              onChange={(val) => setSortOrder(parseInt(val, 10) || 0)}
              placeholder="0"
            />
          </div>
        </div>

        {/* Active Toggle Switch */}
        <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/40 flex items-center justify-between">
          <div>
            <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
              Active Status
            </label>
            <p className="text-[11px] text-zinc-500">
              When active, this slide appears in the hero carousel rotation on the public site.
            </p>
          </div>
          <Switch checked={isActive} onCheckedChange={setIsActive} />
        </div>
      </Card>

      {/* Visual Banners Card */}
      <Card className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/40 backdrop-blur-xl space-y-4 sm:space-y-5 shadow-sm">
        <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-300 uppercase tracking-wider">
          Responsive Banner Artwork
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Desktop Banner Image (21:9) */}
          <ImageInputWithLibrary
            label="Desktop Banner Artwork (21:9 ratio) *"
            value={desktopImageUrl}
            onChange={setDesktopImageUrl}
            required
            folder="general"
            defaultCategory="apps"
            previewShape="banner"
            aspectRatio="21:9"
            targetWidth={2520}
            targetHeight={1080}
            placeholder="Banner 21:9 URL or upload/select from library"
          />

          {/* Mobile Banner Image (3:4) */}
          <ImageInputWithLibrary
            label="Mobile Banner Artwork (3:4 ratio - Optional)"
            value={mobileImageUrl}
            onChange={setMobileImageUrl}
            folder="general"
            defaultCategory="apps"
            previewShape="portrait"
            aspectRatio="3:4"
            targetWidth={900}
            targetHeight={1200}
            placeholder="Banner 3:4 URL (falls back to desktop banner if empty)"
          />
        </div>
      </Card>
    </form>
  );
}
