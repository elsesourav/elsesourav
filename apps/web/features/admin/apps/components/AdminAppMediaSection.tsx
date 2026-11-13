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
  featuredImageUrl?: string;
  setFeaturedImageUrl?: (val: string) => void;
  featuredImageMobileUrl?: string;
  setFeaturedImageMobileUrl?: (val: string) => void;
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
  featuredImageUrl = '',
  setFeaturedImageUrl,
  featuredImageMobileUrl = '',
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
        <span>Media Assets & Showcase Visuals</span>
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
          aspectRatio="1:1"
          targetWidth={512}
          targetHeight={512}
          placeholder="Icon URL or upload/select from library"
        />

        {/* Demo URL */}
        <FloatingLabelInput
          label="Interactive Demo URL"
          type="url"
          value={demoUrl}
          onChange={(val) => setDemoUrl(val)}
          placeholder="https://demo.elsesourav.com/..."
        />

        {/* Mandatory Landscape Cover Image (16:9) */}
        {setFeaturedImageUrl && (
          <ImageInputWithLibrary
            label="Landscape Cover Image (16:9)"
            value={featuredImageUrl}
            onChange={setFeaturedImageUrl}
            required
            folder="apps"
            defaultCategory="apps"
            previewShape="banner"
            aspectRatio="16:9"
            targetWidth={1600}
            targetHeight={900}
            placeholder="Landscape 16:9 cover URL or upload/select"
          />
        )}

        {/* Mandatory Portrait Cover Image (9:16) */}
        {setFeaturedImageMobileUrl && (
          <ImageInputWithLibrary
            label="Portrait Cover Image (9:16)"
            value={featuredImageMobileUrl}
            onChange={setFeaturedImageMobileUrl}
            required
            folder="apps"
            defaultCategory="apps"
            previewShape="portrait"
            aspectRatio="9:16"
            targetWidth={900}
            targetHeight={1600}
            placeholder="Portrait 9:16 cover URL or upload/select"
          />
        )}

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
