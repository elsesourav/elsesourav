'use client';

import * as React from 'react';
import { Card } from '@elsesourav/ui';
import { FloatingLabelInput } from '@elsesourav/ui/interior';
import { ImageInputWithLibrary } from '@/features/admin/media/components/ImageInputWithLibrary';
import { AdminAppScreenshotsManager } from './AdminAppScreenshotsManager';
import { Upload } from 'lucide-react';

interface AdminAppMediaSectionProps {
  iconUrl: string;
  setIconUrl: (val: string) => void;
  featuredImageUrl: string;
  setFeaturedImageUrl: (val: string) => void;
  featuredImageMobileUrl: string;
  setFeaturedImageMobileUrl: (val: string) => void;
  screenshots?: string[];
  setScreenshots?: (val: string[]) => void;
  demoUrl: string;
  setDemoUrl: (val: string) => void;
  videoUrl: string;
  setVideoUrl: (val: string) => void;
}

export function AdminAppMediaSection({
  iconUrl,
  setIconUrl,
  featuredImageUrl,
  setFeaturedImageUrl,
  featuredImageMobileUrl,
  setFeaturedImageMobileUrl,
  screenshots = [],
  setScreenshots,
  demoUrl,
  setDemoUrl,
  videoUrl,
  setVideoUrl,
}: AdminAppMediaSectionProps) {
  return (
    <Card className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/40 backdrop-blur-xl space-y-4 sm:space-y-5 shadow-sm">
      <div className="flex items-center gap-2 text-xs font-bold text-zinc-800 dark:text-zinc-300 uppercase tracking-wider">
        <Upload className="w-4 h-4 text-purple-600 dark:text-purple-400" />
        <span>Media Assets & Banners</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* App Icon */}
        <ImageInputWithLibrary
          label="Application Icon"
          value={iconUrl}
          onChange={setIconUrl}
          required
          folder="apps"
          defaultCategory="apps"
          previewShape="square"
          placeholder="Icon URL or upload/select from library"
        />

        {/* Desktop Banner Image (21:9) */}
        <ImageInputWithLibrary
          label="Desktop Featured Banner (21:9 ratio)"
          value={featuredImageUrl}
          onChange={setFeaturedImageUrl}
          folder="apps"
          defaultCategory="apps"
          previewShape="banner"
          placeholder="Banner 21:9 URL or upload/select from library"
        />

        {/* Mobile Banner Image (3:4) */}
        <ImageInputWithLibrary
          label="Mobile Featured Banner (3:4 ratio)"
          value={featuredImageMobileUrl}
          onChange={setFeaturedImageMobileUrl}
          folder="apps"
          defaultCategory="apps"
          previewShape="portrait"
          placeholder="Banner 3:4 URL or upload/select from library"
        />

        {/* Demo URL */}
        <FloatingLabelInput
          label="Interactive Demo URL"
          type="url"
          value={demoUrl}
          onChange={(val) => setDemoUrl(val)}
          placeholder="https://demo.elsesourav.com/..."
        />

        {/* Video URL */}
        <div className="sm:col-span-2">
          <FloatingLabelInput
            label="Showcase Video URL"
            type="url"
            value={videoUrl}
            onChange={(val) => setVideoUrl(val)}
            placeholder="https://youtube.com/..."
          />
        </div>
      </div>

      {/* Multiple Gallery Screenshots & Showcase Images */}
      {setScreenshots && (
        <AdminAppScreenshotsManager
          screenshots={screenshots}
          onChange={setScreenshots}
        />
      )}
    </Card>
  );
}
