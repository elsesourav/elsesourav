'use client';

import * as React from 'react';
import { Card, Button, Input, Badge } from '@elsesourav/ui';
import type { AdminMediaItem, MediaDomain, MediaFolder } from '@elsesourav/types';
import {
  adminGetMediaListAction,
  adminUploadImageFileAction,
} from '../actions/admin-media-actions';
import {
  Image as ImageIcon,
  Search,
  Upload,
  X,
  Check,
  Loader2,
  Folder,
  Layers,
  Sparkles,
} from 'lucide-react';

interface MediaPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  currentValue?: string;
  defaultCategory?: MediaDomain | 'all';
  title?: string;
}

const CATEGORIES: Array<{ id: string; label: string; domain?: MediaDomain }> = [
  { id: 'all', label: 'All Media' },
  { id: 'users', label: 'Avatars & Profile', domain: 'users' },
  { id: 'apps', label: 'Apps & Tools', domain: 'apps' },
  { id: 'blog', label: 'Devlogs & Blog', domain: 'blog' },
  { id: 'general', label: 'General', domain: 'general' },
];

export function MediaPickerModal({
  isOpen,
  onClose,
  onSelect,
  currentValue,
  defaultCategory = 'all',
  title = 'Select from Media Library',
}: MediaPickerModalProps) {
  const [items, setItems] = React.useState<readonly AdminMediaItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState<string>(defaultCategory);
  const [isUploading, setIsUploading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const loadMedia = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminGetMediaListAction({
        domain: selectedCategory !== 'all' ? (selectedCategory as MediaDomain) : undefined,
        search: search.trim() || undefined,
        limit: 60,
      });

      if (res.success && res.data) {
        setItems(res.data.items);
      } else {
        setError(res.error || 'Failed to load media');
      }
    } catch {
      setError('Error loading media assets');
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, search]);

  React.useEffect(() => {
    if (isOpen) {
      void loadMedia();
    }
  }, [isOpen, loadMedia]);

  const handleUploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);

    const folder: MediaFolder =
      selectedCategory === 'users'
        ? 'users'
        : selectedCategory === 'apps'
          ? 'apps'
          : selectedCategory === 'blog'
            ? 'blog'
            : 'general';
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    try {
      const res = await adminUploadImageFileAction(formData);
      if (res.success && res.url) {
        onSelect(res.url);
        onClose();
      } else {
        setError(res.error || 'Failed to upload image');
      }
    } catch {
      setError('Upload failed');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <Card className="w-full max-w-4xl bg-zinc-950 border-zinc-800 rounded-3xl p-5 sm:p-6 space-y-4 max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3.5 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-950/80 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-100">{title}</h3>
              <p className="text-[11px] text-zinc-400">
                Browse library assets or upload a new image directly.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleUploadFile}
              disabled={isUploading}
            />
            <Button
              type="button"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs rounded-xl gap-1.5 h-8 px-3"
            >
              {isUploading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Upload className="w-3.5 h-3.5" />
              )}
              <span>{isUploading ? 'Uploading...' : 'Upload New'}</span>
            </Button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-zinc-800 text-white border border-zinc-700'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[200px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <Input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search assets..."
              className="bg-zinc-900 border-zinc-800 pl-8 text-xs rounded-xl h-8 text-zinc-200"
            />
          </div>
        </div>

        {error && (
          <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-500/30 text-xs text-rose-300">
            {error}
          </div>
        )}

        {/* Gallery Grid */}
        <div className="flex-1 overflow-y-auto min-h-[300px] max-h-[55vh] pr-1">
          {loading ? (
            <div className="h-64 flex flex-col items-center justify-center gap-2 text-zinc-500 text-xs">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
              <span>Loading media assets...</span>
            </div>
          ) : items.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center gap-3 text-center p-6 border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/30">
              <ImageIcon className="w-8 h-8 text-zinc-600" />
              <div className="space-y-1">
                <p className="text-xs font-semibold text-zinc-300">No media assets found</p>
                <p className="text-[11px] text-zinc-500">
                  Upload an image file directly to start your library.
                </p>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs rounded-xl border-zinc-700"
              >
                Upload Image
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {items.map((item) => {
                const isSelected = currentValue === item.secureUrl;
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      onSelect(item.secureUrl);
                      onClose();
                    }}
                    className={`group relative rounded-2xl border overflow-hidden cursor-pointer transition-all bg-zinc-900/80 ${
                      isSelected
                        ? 'border-indigo-500 ring-2 ring-indigo-500/40'
                        : 'border-zinc-800 hover:border-zinc-700 hover:shadow-lg'
                    }`}
                  >
                    <div className="aspect-square bg-zinc-950 flex items-center justify-center overflow-hidden">
                      <img
                        src={item.secureUrl}
                        alt={item.publicId}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    <div className="p-2 bg-zinc-900 border-t border-zinc-800/80 flex items-center justify-between gap-1.5">
                      <span className="text-[11px] text-zinc-300 truncate font-mono">
                        {item.publicId.split('/').pop()}
                      </span>
                      <Badge
                        variant="outline"
                        className="text-[9px] px-1 py-0 border-zinc-700 text-zinc-400 capitalize shrink-0"
                      >
                        {item.domain}
                      </Badge>
                    </div>

                    {isSelected && (
                      <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-md">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
