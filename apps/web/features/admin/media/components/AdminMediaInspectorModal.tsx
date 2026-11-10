'use client';

import * as React from 'react';
import type { AdminMediaItem } from '@elsesourav/types';
import { Card, Button, Badge, IconButton } from '@elsesourav/ui';
import {
  Image as ImageIcon,
  X,
  AlertCircle,
  ExternalLink,
  Info,
  Trash2,
} from 'lucide-react';

interface AdminMediaInspectorModalProps {
  asset: AdminMediaItem | null;
  onClose: () => void;
  onDelete: (asset: AdminMediaItem) => void;
  isDeleting: boolean;
  deleteError: string | null;
}

export function AdminMediaInspectorModal({
  asset,
  onClose,
  onDelete,
  isDeleting,
  deleteError,
}: AdminMediaInspectorModalProps) {
  if (!asset) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 dark:bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <Card className="w-full max-w-2xl bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden p-4 sm:p-6 space-y-5 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3 shrink-0">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Media Asset Inspector</h3>
          </div>
          <IconButton
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={onClose}
            aria-label="Close Inspector"
            icon={<X className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />}
            className="rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
          />
        </div>

        {deleteError && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-500/30 text-xs text-rose-800 dark:text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{deleteError}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
          {/* Asset Preview */}
          <div className="space-y-2">
            <div className="aspect-square rounded-2xl bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 overflow-hidden flex items-center justify-center">
              <img
                src={asset.secureUrl}
                alt={asset.publicId}
                className="max-w-full max-h-full object-contain"
              />
            </div>
            <div className="flex justify-between items-center text-[11px] text-zinc-600 dark:text-zinc-400 font-mono">
              <span className="capitalize">Domain: {asset.domain}</span>
              <a
                href={asset.secureUrl}
                target="_blank"
                rel="noreferrer"
                className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                <span>Open Original</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Usage & Reference Information */}
          <div className="space-y-4 text-xs">
            <div className="space-y-1">
              <span className="text-zinc-500 dark:text-zinc-400 text-[11px] block">Media Asset ID</span>
              <span className="font-mono text-zinc-800 dark:text-zinc-200 break-all">{asset.publicId}</span>
            </div>

            <div className="space-y-2">
              <span className="text-zinc-900 dark:text-zinc-300 font-semibold flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <span>Application References ({asset.references.length})</span>
              </span>

              {asset.references.length === 0 ? (
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-500/20 text-amber-800 dark:text-amber-300 text-[11px]">
                  No active database resources currently reference this asset. It is an unreferenced
                  orphan.
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {asset.references.map((ref, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800/80 flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <div className="font-semibold text-zinc-900 dark:text-zinc-200 truncate">
                          {ref.resourceType}: {ref.resourceName}
                        </div>
                        <div className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono truncate">
                          Field: {ref.fieldName}
                        </div>
                      </div>
                      <Badge variant="success" className="text-[9px] uppercase font-mono shrink-0">
                        Active
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                copyValue={asset.secureUrl}
                className="text-xs rounded-xl"
              >
                Copy URL
              </Button>

              <Button
                type="button"
                variant="destructive"
                size="sm"
                disabled={isDeleting}
                loading={isDeleting}
                loadingText="Deleting..."
                onClick={() => onDelete(asset)}
                leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                className="text-xs rounded-xl"
              >
                Delete Asset
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
