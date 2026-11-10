'use client';

import * as React from 'react';
import type { AdminMediaItem, MediaDomain } from '@elsesourav/types';
import { Card, Badge, IconButton } from '@elsesourav/ui';
import {
  Package,
  FileText,
  Users,
  LifeBuoy,
  Layers,
  HelpCircle,
  Copy,
  Info,
  Trash2,
  Image as ImageIcon,
} from 'lucide-react';

interface AdminMediaCardProps {
  asset: AdminMediaItem;
  onInspect: (asset: AdminMediaItem) => void;
  onDelete: (asset: AdminMediaItem) => void;
}

function getDomainIcon(domain: MediaDomain) {
  switch (domain) {
    case 'apps':
      return <Package className="w-2.5 h-2.5 text-cyan-400 shrink-0" />;
    case 'blog':
      return <FileText className="w-2.5 h-2.5 text-purple-400 shrink-0" />;
    case 'users':
      return <Users className="w-2.5 h-2.5 text-amber-400 shrink-0" />;
    case 'support':
      return <LifeBuoy className="w-2.5 h-2.5 text-rose-400 shrink-0" />;
    case 'help':
      return <HelpCircle className="w-2.5 h-2.5 text-emerald-400 shrink-0" />;
    default:
      return <Layers className="w-2.5 h-2.5 text-zinc-400 shrink-0" />;
  }
}

export function AdminMediaCard({ asset, onInspect, onDelete }: AdminMediaCardProps) {
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [imgError, setImgError] = React.useState(false);
  const imgRef = React.useRef<HTMLImageElement | null>(null);
  const fileName = asset.publicId.split('/').pop() || asset.publicId;

  React.useEffect(() => {
    if (imgRef.current && imgRef.current.complete) {
      if (imgRef.current.naturalWidth > 0) {
        setIsLoaded(true);
      } else {
        setImgError(true);
      }
    }
  }, []);

  return (
    <Card className="group relative rounded-2xl border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/40 backdrop-blur-xl overflow-hidden flex flex-col justify-between hover:border-zinc-300 dark:hover:border-zinc-700 transition-all shadow-sm">
      {/* Thumbnail Container */}
      <div
        onClick={() => onInspect(asset)}
        className="aspect-square w-full bg-zinc-100 dark:bg-zinc-950 flex items-center justify-center overflow-hidden cursor-pointer relative select-none"
      >
        {/* Skeleton / Fallback Placeholder */}
        {(!isLoaded || imgError) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-3 text-zinc-400 dark:text-zinc-600 space-y-1 bg-zinc-100 dark:bg-zinc-950">
            <ImageIcon className="w-5 h-5 text-zinc-400 dark:text-zinc-700" />
            <span className="text-[9px] font-mono text-zinc-500 dark:text-zinc-600 uppercase">
              {asset.format || 'IMG'}
            </span>
          </div>
        )}

        {!imgError && (
          <img
            ref={imgRef}
            src={asset.secureUrl}
            alt=""
            aria-hidden="true"
            onLoad={() => setIsLoaded(true)}
            onError={() => setImgError(true)}
            className={`w-full h-full object-cover group-hover:scale-105 transition-all duration-300 ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        )}

        {/* Top Badges Bar: Separated & Non-colliding */}
        <div className="absolute top-0 left-0 right-0 p-1.5 flex items-center justify-between gap-1 pointer-events-none z-10 bg-gradient-to-b from-black/60 to-transparent">
          {/* Domain Badge */}
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-zinc-950/80 backdrop-blur border border-zinc-700/60 text-[8.5px] font-mono uppercase text-zinc-200 max-w-[48%] truncate shrink-0">
            {getDomainIcon(asset.domain)}
            <span className="truncate">{asset.domain}</span>
          </span>

          {/* Reference Status Badge */}
          <div className="max-w-[48%] truncate shrink-0">
            {asset.isReferenced ? (
              <Badge variant="success" className="text-[8.5px] py-0 px-1 font-mono truncate">
                Used ({asset.references.length})
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="text-[8.5px] py-0 px-1 border-amber-500/40 text-amber-300 bg-amber-950/60 font-mono truncate"
              >
                Unused
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Footer Metadata & Actions */}
      <div className="p-2 sm:p-2.5 space-y-1.5 sm:space-y-2 bg-zinc-50/80 dark:bg-zinc-900/80 border-t border-zinc-200/80 dark:border-zinc-800/60">
        <div
          className="truncate font-mono text-[10px] text-zinc-800 dark:text-zinc-300 font-semibold"
          title={asset.publicId}
        >
          {fileName}
        </div>

        <div className="flex items-center justify-between gap-1 pt-1 border-t border-zinc-200/80 dark:border-zinc-800/40">
          <IconButton
            type="button"
            variant="ghost"
            size="icon-xs"
            icon={<Copy className="w-3 h-3 text-zinc-500 dark:text-zinc-400" />}
            copyValue={asset.secureUrl}
            aria-label="Copy Public URL"
            title="Copy Public URL"
            className="rounded-lg hover:text-zinc-900 dark:hover:text-zinc-200"
          />

          <IconButton
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={() => onInspect(asset)}
            aria-label="Inspect Usage & References"
            title="Inspect Usage & References"
            icon={<Info className="w-3 h-3 text-zinc-500 dark:text-zinc-400" />}
            className="rounded-lg hover:text-indigo-600 dark:hover:text-indigo-300"
          />

          <IconButton
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={() => onDelete(asset)}
            aria-label="Delete from Media Storage"
            title="Delete from Media Storage"
            icon={<Trash2 className="w-3 h-3 text-zinc-500 dark:text-zinc-400" />}
            className="rounded-lg hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/60"
          />
        </div>
      </div>
    </Card>
  );
}
