'use client';

import * as React from 'react';
import type { AdminMediaItem, AdminMediaListResult } from '@elsesourav/types';
import { Button, Card, Input } from '@elsesourav/ui';
import { Dropdown } from '@elsesourav/ui/interior';
import {
  AlertTriangle,
  CheckCircle2,
  Image as ImageIcon,
  Search,
  Upload,
} from 'lucide-react';
import { adminDeleteMediaAction } from '../actions/admin-media-actions';
import { AdminMediaCard } from './AdminMediaCard';
import { AdminMediaInspectorModal } from './AdminMediaInspectorModal';
import { AdminMediaUploadModal } from './AdminMediaUploadModal';

const DOMAIN_ITEMS = [
  { value: 'all', label: 'All Domains' },
  { value: 'apps', label: 'Apps' },
  { value: 'blog', label: 'Updates' },
  { value: 'help', label: 'Help' },
  { value: 'users', label: 'Users' },
  { value: 'support', label: 'Support' },
  { value: 'general', label: 'General' },
];

const STATUS_ITEMS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'referenced', label: 'Referenced Only' },
  { value: 'orphan', label: 'Unreferenced (Orphans)' },
];

interface AdminMediaGalleryProps {
  initialData: AdminMediaListResult;
}

export function AdminMediaGallery({ initialData }: AdminMediaGalleryProps) {
  const [items, setItems] = React.useState<readonly AdminMediaItem[]>(initialData.items);
  const [search, setSearch] = React.useState('');
  const [selectedDomain, setSelectedDomain] = React.useState<string>('all');
  const [selectedStatus, setSelectedStatus] = React.useState<string>('all');

  // Inspector & modal states
  const [selectedAsset, setSelectedAsset] = React.useState<AdminMediaItem | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [deleteError, setDeleteError] = React.useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = React.useState<string | null>(null);

  // Direct upload modal state
  const [isUploadOpen, setIsUploadOpen] = React.useState(false);

  const filteredItems = React.useMemo(() => {
    return items.filter((item) => {
      // Search filter
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesPublicId = item.publicId.toLowerCase().includes(q);
        const matchesUrl = item.secureUrl.toLowerCase().includes(q);
        const matchesRef = item.references.some((r) => r.resourceName.toLowerCase().includes(q));
        if (!matchesPublicId && !matchesUrl && !matchesRef) return false;
      }

      // Domain filter
      if (selectedDomain !== 'all') {
        if (item.domain !== selectedDomain) return false;
      }

      // Status filter
      if (selectedStatus !== 'all') {
        if (selectedStatus === 'referenced' && !item.isReferenced) return false;
        if (selectedStatus === 'orphan' && item.isReferenced) return false;
      }

      return true;
    });
  }, [items, search, selectedDomain, selectedStatus]);

  const handleDeleteAsset = async (asset: AdminMediaItem, force = false) => {
    if (asset.isReferenced && !force) {
      const confirmForce = window.confirm(
        `WARNING: This media asset is referenced by ${asset.references.length} application resource(s). Deleting it will result in broken media on the live site.\n\nDo you want to FORCE delete this asset?`
      );
      if (!confirmForce) return;
      return handleDeleteAsset(asset, true);
    }

    if (
      !window.confirm(`Are you sure you want to delete asset "${asset.publicId}" from storage?`)
    ) {
      return;
    }

    setIsDeleting(true);
    setDeleteError(null);

    try {
      const res = await adminDeleteMediaAction(asset.publicId, force);
      if (res.success) {
        setItems((prev) => prev.filter((i) => i.publicId !== asset.publicId));
        setSelectedAsset(null);
        setActionSuccess(`Asset "${asset.publicId}" successfully deleted.`);
        setTimeout(() => setActionSuccess(null), 4000);
      } else {
        setDeleteError(res.error || 'Failed to delete asset');
      }
    } catch {
      setDeleteError('An unexpected error occurred deleting the media asset.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUploadSuccess = (newItem: AdminMediaItem) => {
    setItems((prev) => [newItem, ...prev]);
    setActionSuccess(`Asset "${newItem.publicId}" uploaded successfully!`);
    setTimeout(() => setActionSuccess(null), 4000);
  };

  const handleBatchUploadSuccess = (newItems: AdminMediaItem[]) => {
    setItems((prev) => [...newItems, ...prev]);
    setActionSuccess(`Successfully uploaded ${newItems.length} media asset(s)!`);
    setTimeout(() => setActionSuccess(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Overview Metric Cards: Responsive Mobile Grid vs Desktop Cards */}
      <div className="hidden sm:grid sm:grid-cols-3 gap-4">
        <Card className="p-4 rounded-3xl border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/40 backdrop-blur-xl shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400 shrink-0">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-zinc-500 dark:text-zinc-400 block font-medium">Total Media Assets</span>
              <span className="text-xl font-bold font-mono text-zinc-900 dark:text-zinc-100">{items.length}</span>
            </div>
          </div>
        </Card>

        <Card className="p-4 rounded-3xl border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/40 backdrop-blur-xl shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400 shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-zinc-500 dark:text-zinc-400 block font-medium">Actively Referenced</span>
              <span className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-300">
                {initialData.totalReferenced}
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-4 rounded-3xl border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/40 backdrop-blur-xl shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-500/30 text-amber-600 dark:text-amber-400 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-zinc-500 dark:text-zinc-400 block font-medium">
                Unreferenced / Orphans
              </span>
              <span className="text-xl font-bold font-mono text-amber-600 dark:text-amber-300">
                {initialData.totalOrphans}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Compact Mobile Metric Pill: 65px instead of 300px */}
      <div className="grid grid-cols-3 sm:hidden gap-2">
        <div className="p-2.5 rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 text-center shadow-sm">
          <span className="text-base font-bold font-mono text-zinc-900 dark:text-zinc-100 block">{items.length}</span>
          <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider block">Total</span>
        </div>
        <div className="p-2.5 rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 text-center shadow-sm">
          <span className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-300 block">{initialData.totalReferenced}</span>
          <span className="text-[10px] text-emerald-600/80 dark:text-emerald-500/80 font-medium uppercase tracking-wider block">In Use</span>
        </div>
        <div className="p-2.5 rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 text-center shadow-sm">
          <span className="text-base font-bold font-mono text-amber-600 dark:text-amber-300 block">{initialData.totalOrphans}</span>
          <span className="text-[10px] text-amber-600/80 dark:text-amber-500/80 font-medium uppercase tracking-wider block">Orphans</span>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3 sm:p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-500/30 flex items-center gap-2.5 text-xs text-emerald-700 dark:text-emerald-300 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Action & Filter Bar */}
      <div className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-3 items-center">
          {/* Search Input */}
          <div className="relative sm:col-span-6 lg:col-span-5">
            <Search className="w-4 h-4 text-zinc-400 dark:text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <Input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by public ID, URL, or resource..."
              className="bg-white dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800 text-xs pl-9 rounded-xl text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 h-9 shadow-sm"
            />
          </div>

          {/* Domain & Status Dropdowns: side-by-side 2-col grid on mobile */}
          <div className="grid grid-cols-2 sm:col-span-6 lg:col-span-5 gap-2">
            <Dropdown
              items={DOMAIN_ITEMS}
              value={selectedDomain}
              onChange={(val) => setSelectedDomain(val)}
              className="w-full"
            />
            <Dropdown
              items={STATUS_ITEMS}
              value={selectedStatus}
              onChange={(val) => setSelectedStatus(val)}
              className="w-full"
            />
          </div>

          {/* Upload Button: desktop inline CTA */}
          <div className="hidden lg:flex lg:col-span-2 justify-end">
            <Button
              onClick={() => setIsUploadOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl gap-1.5 shadow-lg px-3.5 py-2 w-full justify-center"
            >
              <Upload className="w-3.5 h-3.5 shrink-0" />
              <span>Upload</span>
            </Button>
          </div>
        </div>

        {/* Mobile Upload Button: full-width bar for thumb accessibility */}
        <div className="lg:hidden">
          <Button
            onClick={() => setIsUploadOpen(true)}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl gap-2 shadow-lg py-2.5 justify-center"
          >
            <Upload className="w-4 h-4 shrink-0" />
            <span>Upload Media Asset</span>
          </Button>
        </div>

        {/* Results Count Line */}
        <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 dark:text-zinc-400 px-1">
          <span>
            Showing <strong className="text-zinc-900 dark:text-zinc-200">{filteredItems.length}</strong> of{' '}
            <strong className="text-zinc-900 dark:text-zinc-200">{items.length}</strong> assets
          </span>
          {(selectedDomain !== 'all' || selectedStatus !== 'all' || search.trim()) && (
            <Button
              type="button"
              variant="ghost"
              size="xs"
              onClick={() => {
                setSearch('');
                setSelectedDomain('all');
                setSelectedStatus('all');
              }}
              className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 text-[11px] h-6 px-2 rounded-lg"
            >
              Clear filters
            </Button>
          )}
        </div>
      </div>

      {/* Media Grid */}
      {filteredItems.length === 0 ? (
        <Card className="p-12 sm:p-16 rounded-3xl border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/40 backdrop-blur-xl text-center space-y-3 shadow-sm">
          <ImageIcon className="w-10 h-10 text-zinc-400 dark:text-zinc-600 mx-auto" />
          <h4 className="text-sm font-semibold text-zinc-800 dark:text-zinc-300">No media assets found</h4>
          <p className="text-xs text-zinc-500 max-w-xs mx-auto">
            No media assets match your search and filter criteria.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
          {filteredItems.map((asset) => (
            <AdminMediaCard
              key={asset.publicId}
              asset={asset}
              onInspect={setSelectedAsset}
              onDelete={handleDeleteAsset}
            />
          ))}
        </div>
      )}

      {/* Asset Inspector Modal */}
      <AdminMediaInspectorModal
        asset={selectedAsset}
        onClose={() => {
          setSelectedAsset(null);
          setDeleteError(null);
        }}
        onDelete={handleDeleteAsset}
        isDeleting={isDeleting}
        deleteError={deleteError}
      />

      {/* Upload Dialog Modal */}
      <AdminMediaUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={handleUploadSuccess}
        onBatchUploadSuccess={handleBatchUploadSuccess}
      />
    </div>
  );
}
