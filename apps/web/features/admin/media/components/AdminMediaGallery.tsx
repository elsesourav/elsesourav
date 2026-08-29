'use client';

import type {
  AdminMediaItem,
  AdminMediaListResult,
  MediaDomain,
  MediaFolder,
  MediaType,
} from '@elsesourav/types';
import { Badge, Button, Card, Input } from '@elsesourav/ui';
import {
  AlertCircle,
  AlertTriangle,
  Check,
  CheckCircle2,
  Copy,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  Info,
  Layers,
  LifeBuoy,
  Loader2,
  Package,
  Search,
  Trash2,
  Upload,
  Users,
  X,
} from 'lucide-react';
import * as React from 'react';
import { adminDeleteMediaAction, adminUploadImageFileAction } from '../actions/admin-media-actions';

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
  const [copiedId, setCopiedId] = React.useState<string | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [deleteError, setDeleteError] = React.useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = React.useState<string | null>(null);

  // Direct upload modal states
  const [isUploadOpen, setIsUploadOpen] = React.useState(false);
  const [uploadFolder, setUploadFolder] = React.useState<MediaFolder>('general');
  const [uploadType, setUploadType] = React.useState<MediaType>('generic');
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState<number>(0);
  const [uploadError, setUploadError] = React.useState<string | null>(null);

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

  const handleCopyUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

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

  const handleDirectUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);
    setUploadProgress(20);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', uploadFolder);

      setUploadProgress(50);
      const res = await adminUploadImageFileAction(formData);

      if (!res.success || !res.url) {
        throw new Error(res.error || 'Upload failed');
      }

      setUploadProgress(100);

      const newItem: AdminMediaItem = {
        id: res.publicId || file.name,
        publicId: res.publicId || file.name,
        secureUrl: res.url,
        domain: uploadFolder as MediaDomain,
        format: file.type.split('/')[1] || 'image',
        bytes: file.size,
        createdAt: Date.now(),
        isReferenced: false,
        references: [],
      };

      setItems((prev) => [newItem, ...prev]);
      setIsUploadOpen(false);
      setActionSuccess(`Asset uploaded successfully to ${res.publicId || file.name}!`);
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Failed to upload asset');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const getDomainIcon = (domain: MediaDomain) => {
    switch (domain) {
      case 'apps':
        return <Package className="w-3 h-3 text-cyan-400" />;
      case 'blog':
        return <FileText className="w-3 h-3 text-purple-400" />;
      case 'users':
        return <Users className="w-3 h-3 text-amber-400" />;
      case 'support':
        return <LifeBuoy className="w-3 h-3 text-rose-400" />;
      default:
        return <Layers className="w-3 h-3 text-zinc-400" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 rounded-3xl border-zinc-800/80 bg-zinc-900/40 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-950/60 border border-indigo-500/30 text-indigo-400">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-zinc-400 block font-medium">Total Media Assets</span>
              <span className="text-xl font-bold font-mono text-zinc-100">{items.length}</span>
            </div>
          </div>
        </Card>

        <Card className="p-4 rounded-3xl border-zinc-800/80 bg-zinc-900/40 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-zinc-400 block font-medium">Actively Referenced</span>
              <span className="text-xl font-bold font-mono text-emerald-300">
                {initialData.totalReferenced}
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-4 rounded-3xl border-zinc-800/80 bg-zinc-900/40 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-950/60 border border-amber-500/30 text-amber-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-zinc-400 block font-medium">
                Unreferenced / Orphans
              </span>
              <span className="text-xl font-bold font-mono text-amber-300">
                {initialData.totalOrphans}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {actionSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex items-center gap-2.5 text-xs text-emerald-300 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Action & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by public ID, URL, or resource..."
              className="bg-zinc-900/60 border-zinc-800 text-xs pl-9 rounded-xl text-zinc-100 placeholder:text-zinc-500"
            />
          </div>

          {/* Domain Dropdown */}
          <select
            value={selectedDomain}
            onChange={(e) => setSelectedDomain(e.target.value)}
            className="bg-zinc-900/60 border border-zinc-800 text-xs rounded-xl px-3 py-2 text-zinc-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Domains</option>
            <option value="apps">Apps</option>
            <option value="blog">Blog</option>
            <option value="help">Help</option>
            <option value="users">Users</option>
            <option value="support">Support</option>
            <option value="general">General</option>
          </select>

          {/* Status Dropdown */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-zinc-900/60 border border-zinc-800 text-xs rounded-xl px-3 py-2 text-zinc-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Statuses</option>
            <option value="referenced">Referenced Only</option>
            <option value="orphan">Unreferenced (Orphans)</option>
          </select>
        </div>

        {/* Upload Button */}
        <Button
          onClick={() => setIsUploadOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl gap-2 shadow-lg px-4 py-2 shrink-0"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Media</span>
        </Button>
      </div>

      {/* Media Grid */}
      {filteredItems.length === 0 ? (
        <Card className="p-16 rounded-3xl border-zinc-800/80 bg-zinc-900/40 backdrop-blur-xl text-center space-y-3">
          <ImageIcon className="w-10 h-10 text-zinc-600 mx-auto" />
          <h4 className="text-sm font-semibold text-zinc-300">No media assets found</h4>
          <p className="text-xs text-zinc-500 max-w-xs mx-auto">
            No media assets match your search and filter criteria.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {filteredItems.map((asset) => {
            return (
              <Card
                key={asset.publicId}
                className="group relative rounded-2xl border-zinc-800/80 bg-zinc-900/40 backdrop-blur-xl overflow-hidden flex flex-col justify-between hover:border-zinc-700 transition-all shadow-sm"
              >
                {/* Thumbnail Container */}
                <div
                  onClick={() => setSelectedAsset(asset)}
                  className="aspect-square w-full bg-zinc-950/80 flex items-center justify-center overflow-hidden cursor-pointer relative"
                >
                  <img
                    src={asset.secureUrl}
                    alt={asset.publicId}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />

                  {/* Domain Badge */}
                  <div className="absolute top-2 left-2">
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-zinc-950/80 backdrop-blur border border-zinc-800 text-[9px] font-mono uppercase text-zinc-300">
                      {getDomainIcon(asset.domain)}
                      <span>{asset.domain}</span>
                    </span>
                  </div>

                  {/* Reference Status */}
                  <div className="absolute top-2 right-2">
                    {asset.isReferenced ? (
                      <Badge variant="success" className="text-[9px] py-0 px-1 font-mono">
                        Used ({asset.references.length})
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="text-[9px] py-0 px-1 border-amber-500/40 text-amber-300 bg-amber-950/60 font-mono"
                      >
                        Unused
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Footer Metadata & Actions */}
                <div className="p-2.5 space-y-2 bg-zinc-900/80 border-t border-zinc-800/60">
                  <div
                    className="truncate font-mono text-[10px] text-zinc-300 font-semibold"
                    title={asset.publicId}
                  >
                    {asset.publicId.split('/').pop() || asset.publicId}
                  </div>

                  <div className="flex items-center justify-between gap-1 pt-1 border-t border-zinc-800/40">
                    <button
                      type="button"
                      onClick={() => handleCopyUrl(asset.secureUrl, asset.publicId)}
                      className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
                      title="Copy Public URL"
                    >
                      {copiedId === asset.publicId ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedAsset(asset)}
                      className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-indigo-300 transition-colors"
                      title="Inspect Usage & References"
                    >
                      <Info className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteAsset(asset)}
                      className="p-1 rounded-lg hover:bg-rose-950/60 text-zinc-400 hover:text-rose-400 transition-colors"
                      title="Delete from Media Storage"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Asset Inspector Modal */}
      {selectedAsset && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl bg-zinc-900 border-zinc-800 rounded-3xl overflow-hidden p-6 space-y-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-zinc-100">Media Asset Inspector</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedAsset(null);
                  setDeleteError(null);
                }}
                className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {deleteError && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{deleteError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Asset Preview */}
              <div className="space-y-2">
                <div className="aspect-square rounded-2xl bg-zinc-950 border border-zinc-800 overflow-hidden flex items-center justify-center">
                  <img
                    src={selectedAsset.secureUrl}
                    alt={selectedAsset.publicId}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
                <div className="flex justify-between items-center text-[11px] text-zinc-500 font-mono">
                  <span>Domain: {selectedAsset.domain}</span>
                  <a
                    href={selectedAsset.secureUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-indigo-400 hover:underline flex items-center gap-1"
                  >
                    <span>Open Original</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Usage & Reference Information */}
              <div className="space-y-4 text-xs">
                <div className="space-y-1">
                  <span className="text-zinc-500 block text-[11px]">Media Asset ID</span>
                  <span className="font-mono text-zinc-200 break-all">
                    {selectedAsset.publicId}
                  </span>
                </div>

                <div className="space-y-2">
                  <span className="text-zinc-400 font-semibold block flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Application References ({selectedAsset.references.length})</span>
                  </span>

                  {selectedAsset.references.length === 0 ? (
                    <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/20 text-amber-300 text-[11px]">
                      No active database resources currently reference this asset. It is an
                      unreferenced orphan.
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {selectedAsset.references.map((ref, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded-xl bg-zinc-950/50 border border-zinc-800/80 flex items-center justify-between"
                        >
                          <div>
                            <div className="font-semibold text-zinc-200">
                              {ref.resourceType}: {ref.resourceName}
                            </div>
                            <div className="text-[10px] text-zinc-500 font-mono">
                              Field: {ref.fieldName}
                            </div>
                          </div>
                          <span className="text-[10px] uppercase font-mono text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-500/20">
                            Active
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="pt-4 border-t border-zinc-800 flex items-center justify-between gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopyUrl(selectedAsset.secureUrl, selectedAsset.publicId)}
                    className="text-xs rounded-xl gap-1.5"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy URL</span>
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isDeleting}
                    onClick={() => handleDeleteAsset(selectedAsset)}
                    className="border-rose-900/60 text-rose-400 hover:bg-rose-950/40 text-xs rounded-xl gap-1.5"
                  >
                    {isDeleting ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                    <span>Delete Asset</span>
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Upload Dialog Modal */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-zinc-900 border-zinc-800 rounded-3xl p-6 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Upload className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-zinc-100">Upload to Media Library</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsUploadOpen(false);
                  setUploadError(null);
                }}
                className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {uploadError && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            <div className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-zinc-400 block font-medium">Target Storage Folder</label>
                <select
                  value={uploadFolder}
                  onChange={(e) => setUploadFolder(e.target.value as MediaFolder)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="general">general (General application media)</option>
                  <option value="apps">apps (App icons & banners)</option>
                  <option value="blog">blog (Devlog post covers)</option>
                  <option value="help">help (Knowledge base tutorial diagrams)</option>
                  <option value="users">users (User profile avatars)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-zinc-400 block font-medium">Media Purpose</label>
                <select
                  value={uploadType}
                  onChange={(e) => setUploadType(e.target.value as MediaType)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="generic">Generic Asset</option>
                  <option value="app_icon">App Icon</option>
                  <option value="app_screenshot">App Screenshot / Banner</option>
                  <option value="blog_cover">Blog Cover</option>
                  <option value="help_image">Help Guide Illustration</option>
                  <option value="avatar">User Avatar</option>
                </select>
              </div>

              <div className="space-y-2 pt-2">
                <label className="text-zinc-400 block font-medium">Select Image File</label>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif"
                  disabled={isUploading}
                  onChange={handleDirectUpload}
                  className="w-full text-xs text-zinc-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 cursor-pointer"
                />
              </div>

              {isUploading && (
                <div className="space-y-2 pt-2">
                  <div className="flex justify-between text-[11px] text-zinc-400">
                    <span>Direct Uploading to Media Library...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
