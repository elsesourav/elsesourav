'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card, Badge, Input, IconButton, Button } from '@elsesourav/ui';
import { Dropdown } from '@elsesourav/ui/interior';
import type { CarouselSlide } from '@elsesourav/types';
import {
  deleteCarouselSlideAction,
  toggleCarouselSlideActiveAction,
  reorderCarouselSlidesAction,
} from '../actions/admin-carousel-actions';
import {
  ArrowDown,
  ArrowUp,
  Edit,
  ExternalLink,
  GalleryHorizontalEnd,
  Plus,
  Search,
  Trash2,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

export interface AdminCarouselTableProps {
  initialSlides: readonly CarouselSlide[];
}

export function AdminCarouselTable({ initialSlides }: AdminCarouselTableProps) {
  const [slides, setSlides] = React.useState<CarouselSlide[]>([...initialSlides]);
  const [search, setSearch] = React.useState('');
  const [selectedStatus, setSelectedStatus] = React.useState<string>('all');
  const [isDeletingId, setIsDeletingId] = React.useState<string | null>(null);
  const [isReordering, setIsReordering] = React.useState(false);

  // Sync when initialSlides changes
  React.useEffect(() => {
    setSlides([...initialSlides]);
  }, [initialSlides]);

  const statusItems = React.useMemo(
    () => [
      { value: 'all', label: 'All Statuses' },
      { value: 'active', label: 'Active Slides' },
      { value: 'inactive', label: 'Inactive / Hidden' },
    ],
    []
  );

  const filteredSlides = React.useMemo(() => {
    return slides.filter((slide) => {
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesTitle = slide.title.toLowerCase().includes(q);
        const matchesSubtitle = slide.subtitle?.toLowerCase().includes(q) ?? false;
        const matchesBadge = slide.badgeText?.toLowerCase().includes(q) ?? false;
        const matchesUrl = slide.targetUrl.toLowerCase().includes(q);
        if (!matchesTitle && !matchesSubtitle && !matchesBadge && !matchesUrl) return false;
      }

      if (selectedStatus === 'active' && !slide.isActive) return false;
      if (selectedStatus === 'inactive' && slide.isActive) return false;

      return true;
    });
  }, [slides, search, selectedStatus]);

  const handleToggleActive = async (slideId: string) => {
    // Optimistic update
    setSlides((prev) =>
      prev.map((s) => (s.id === slideId ? { ...s, isActive: !s.isActive } : s))
    );

    try {
      const res = await toggleCarouselSlideActiveAction(slideId);
      if (!res.success) {
        // Rollback
        setSlides([...initialSlides]);
      }
    } catch {
      setSlides([...initialSlides]);
    }
  };

  const handleDelete = async (slideId: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete carousel slide "${title}"?`)) return;

    setIsDeletingId(slideId);
    try {
      const res = await deleteCarouselSlideAction(slideId);
      if (res.success) {
        setSlides((prev) => prev.filter((s) => s.id !== slideId));
      }
    } catch {
      // Non-blocking
    } finally {
      setIsDeletingId(null);
    }
  };

  const handleMoveSlide = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= slides.length) return;

    const newSlides = [...slides];
    const [moved] = newSlides.splice(index, 1);
    if (!moved) return;
    newSlides.splice(targetIndex, 0, moved);

    // Update local sortOrders
    const reordered = newSlides.map((s, idx) => ({ ...s, sortOrder: idx }));
    setSlides(reordered);
    setIsReordering(true);

    try {
      await reorderCarouselSlidesAction(reordered.map((s) => s.id));
    } catch {
      // Rollback on failure
      setSlides([...initialSlides]);
    } finally {
      setIsReordering(false);
    }
  };

  return (
    <div className="space-y-5 sm:space-y-6 w-full max-w-full">
      {/* Search & Actions Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2.5 sm:gap-3 flex-1 min-w-0">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[200px] max-w-full sm:max-w-sm">
            <Search className="w-4 h-4 text-zinc-400 dark:text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search slides by title, badge, or URL..."
              className="bg-white dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800 text-xs pl-9 rounded-xl text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 w-full shadow-sm"
            />
          </div>

          {/* Status Filter */}
          <Dropdown
            items={statusItems}
            value={selectedStatus}
            onChange={(val) => setSelectedStatus(val)}
            className="w-full sm:w-44"
          />
        </div>

        {/* Add New Slide CTA */}
        <Link href="/admin/carousel/new" className="shrink-0">
          <Button
            variant="primary"
            size="sm"
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 rounded-xl shadow-sm text-xs font-semibold px-4"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Hero Slide</span>
          </Button>
        </Link>
      </div>

      {/* Main Container */}
      <Card className="rounded-2xl sm:rounded-3xl border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/40 backdrop-blur-xl overflow-hidden w-full shadow-sm">
        {filteredSlides.length === 0 ? (
          <div className="py-12 sm:py-16 px-4 text-center space-y-3">
            <GalleryHorizontalEnd className="w-10 h-10 text-zinc-400 dark:text-zinc-600 mx-auto" />
            <h4 className="text-sm font-semibold text-zinc-800 dark:text-zinc-300">
              No carousel slides found
            </h4>
            <p className="text-xs text-zinc-500 max-w-xs mx-auto leading-relaxed">
              No slides match your selected filters. Create a new slide to showcase products,
              updates, or announcements.
            </p>
            <div className="pt-2">
              <Link href="/admin/carousel/new">
                <Button variant="outline" size="sm" className="rounded-xl text-xs">
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Create First Slide
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Desktop / Tablet View (Table) */}
            <div className="hidden sm:block overflow-x-auto w-full">
              <table className="w-full text-left text-xs text-zinc-700 dark:text-zinc-300 border-collapse table-fixed">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/80 dark:bg-zinc-950/40 text-zinc-600 dark:text-zinc-400 font-medium">
                    <th className="py-3 px-4 font-semibold w-16 text-center">Order</th>
                    <th className="py-3 px-4 font-semibold w-36">Visual (21:9)</th>
                    <th className="py-3 px-4 font-semibold">Title & Badge</th>
                    <th className="py-3 px-4 font-semibold hidden md:table-cell w-44">Target URL</th>
                    <th className="py-3 px-4 font-semibold w-24 text-center">Status</th>
                    <th className="py-3 px-4 font-semibold text-right w-36">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200/80 dark:divide-zinc-800/50">
                  {filteredSlides.map((slide, index) => (
                    <tr
                      key={slide.id}
                      className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors group"
                    >
                      {/* Sort Order & Reorder Controls */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            disabled={index === 0 || isReordering}
                            onClick={() => handleMoveSlide(index, 'up')}
                            aria-label="Move up"
                            className="p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:hover:bg-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <span className="font-mono text-[11px] text-zinc-500 font-semibold w-5 text-center">
                            {index + 1}
                          </span>
                          <button
                            type="button"
                            disabled={index === slides.length - 1 || isReordering}
                            onClick={() => handleMoveSlide(index, 'down')}
                            aria-label="Move down"
                            className="p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:hover:bg-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                      {/* Desktop Image Banner Thumbnail (21:9) */}
                      <td className="py-3 px-4">
                        <div className="w-28 aspect-[21/9] rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/60 overflow-hidden relative group/thumb shadow-xs">
                          {slide.desktopImageUrl ? (
                            <img
                              src={slide.desktopImageUrl}
                              alt={slide.title}
                              className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-400">
                              <GalleryHorizontalEnd className="w-4 h-4" />
                            </div>
                          )}
                          {slide.mobileImageUrl && (
                            <span className="absolute bottom-1 right-1 px-1 py-0.2 bg-black/70 text-white text-[9px] font-mono rounded backdrop-blur-xs">
                              3:4
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Title, Badge & Subtitle */}
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            {slide.badgeText && (
                              <Badge
                                variant="outline"
                                className="text-[9px] uppercase font-mono px-1.5 py-0 leading-tight bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800/60"
                              >
                                {slide.badgeText}
                              </Badge>
                            )}
                            <span className="font-semibold text-zinc-900 dark:text-zinc-100 truncate text-xs sm:text-sm">
                              {slide.title}
                            </span>
                          </div>
                          {slide.subtitle && (
                            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate max-w-sm">
                              {slide.subtitle}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Target URL */}
                      <td className="py-3 px-4 hidden md:table-cell">
                        <a
                          href={slide.targetUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 font-mono text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline max-w-[160px] truncate"
                        >
                          <span className="truncate">{slide.targetUrl}</span>
                          <ExternalLink className="w-3 h-3 shrink-0 opacity-70" />
                        </a>
                      </td>

                      {/* Status Toggle */}
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(slide.id)}
                          className="inline-flex items-center gap-1 cursor-pointer focus:outline-none"
                          title={slide.isActive ? 'Click to deactivate' : 'Click to activate'}
                        >
                          {slide.isActive ? (
                            <Badge
                              variant="success"
                              className="text-[10px] font-medium px-2 py-0.5"
                            >
                              <CheckCircle2 className="w-2.5 h-2.5 mr-1" />
                              Active
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="text-[10px] font-medium px-2 py-0.5 text-zinc-400 border-zinc-300 dark:border-zinc-700"
                            >
                              <XCircle className="w-2.5 h-2.5 mr-1 text-zinc-400" />
                              Hidden
                            </Badge>
                          )}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link href={`/admin/carousel/${slide.id}`}>
                            <IconButton
                              size="sm"
                              variant="ghost"
                              aria-label={`Edit ${slide.title}`}
                              icon={<Edit className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-400" />}
                            />
                          </Link>
                          <IconButton
                            size="sm"
                            variant="ghost"
                            aria-label={`Delete ${slide.title}`}
                            disabled={isDeletingId === slide.id}
                            onClick={() => handleDelete(slide.id, slide.title)}
                            icon={<Trash2 className="w-3.5 h-3.5 text-rose-500 hover:text-rose-600" />}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile View (Card List) */}
            <div className="block sm:hidden divide-y divide-zinc-200/80 dark:divide-zinc-800/50">
              {filteredSlides.map((slide, index) => (
                <div key={slide.id} className="p-3.5 space-y-3">
                  {/* Banner & Badge */}
                  <div className="w-full aspect-[21/9] rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/60 overflow-hidden relative shadow-xs">
                    {slide.desktopImageUrl ? (
                      <img
                        src={slide.desktopImageUrl}
                        alt={slide.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-400">
                        <GalleryHorizontalEnd className="w-5 h-5" />
                      </div>
                    )}
                    {slide.badgeText && (
                      <span className="absolute top-2 left-2 px-2 py-0.5 bg-black/70 text-white text-[9px] font-mono font-semibold rounded backdrop-blur-xs">
                        {slide.badgeText}
                      </span>
                    )}
                    <span className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/70 text-white text-[10px] font-mono rounded backdrop-blur-xs">
                      #{index + 1}
                    </span>
                  </div>

                  {/* Title & Subtitle */}
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm truncate">
                        {slide.title}
                      </h4>
                      <button
                        type="button"
                        onClick={() => handleToggleActive(slide.id)}
                        className="shrink-0"
                      >
                        {slide.isActive ? (
                          <Badge variant="success" className="text-[9px] px-1.5 py-0.5">
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[9px] px-1.5 py-0.5 text-zinc-400">
                            Hidden
                          </Badge>
                        )}
                      </button>
                    </div>
                    {slide.subtitle && (
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 mt-0.5">
                        {slide.subtitle}
                      </p>
                    )}
                  </div>

                  {/* Target URL */}
                  <div className="text-[11px] font-mono text-zinc-500 truncate flex items-center gap-1">
                    <span className="text-zinc-400">Target:</span>
                    <a
                      href={slide.targetUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-indigo-600 dark:text-indigo-400 hover:underline truncate"
                    >
                      {slide.targetUrl}
                    </a>
                  </div>

                  {/* Reorder and Action Buttons Bar */}
                  <div className="flex items-center justify-between pt-1 border-t border-zinc-100 dark:border-zinc-800/40">
                    <div className="flex items-center gap-1">
                      <Button
                        size="xs"
                        variant="ghost"
                        disabled={index === 0 || isReordering}
                        onClick={() => handleMoveSlide(index, 'up')}
                        className="h-7 px-2 text-xs"
                      >
                        <ArrowUp className="w-3.5 h-3.5 mr-1" />
                        Up
                      </Button>
                      <Button
                        size="xs"
                        variant="ghost"
                        disabled={index === slides.length - 1 || isReordering}
                        onClick={() => handleMoveSlide(index, 'down')}
                        className="h-7 px-2 text-xs"
                      >
                        <ArrowDown className="w-3.5 h-3.5 mr-1" />
                        Down
                      </Button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Link href={`/admin/carousel/${slide.id}`}>
                        <Button size="xs" variant="outline" className="h-7 px-2.5 text-xs rounded-lg">
                          <Edit className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                      </Link>
                      <Button
                        size="xs"
                        variant="ghost"
                        disabled={isDeletingId === slide.id}
                        onClick={() => handleDelete(slide.id, slide.title)}
                        className="h-7 px-2 text-xs text-rose-500 hover:text-rose-600"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
