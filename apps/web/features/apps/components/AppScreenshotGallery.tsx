'use client';

import * as React from 'react';
import Image from 'next/image';
import { getAppScreenshotUrl } from '@elsesourav/media';
import { Card } from '@elsesourav/ui';
import { ChevronLeft, ChevronRight, ImageIcon } from 'lucide-react';

interface AppScreenshotGalleryProps {
  appName: string;
  screenshots: readonly string[];
}

export function AppScreenshotGallery({ appName, screenshots }: AppScreenshotGalleryProps) {
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  if (!screenshots || screenshots.length === 0) {
    return null;
  }

  const currentScreenshot = screenshots[selectedIndex] || screenshots[0];
  const transformedUrl = currentScreenshot ? getAppScreenshotUrl(currentScreenshot, 1280, 720) : '';

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
        <ImageIcon className="w-5 h-5 text-indigo-400" /> Screenshots & Interface
      </h2>

      {/* Main Preview Container */}
      <Card className="relative overflow-hidden rounded-2xl border-zinc-800 bg-zinc-950/80 p-2 aspect-video flex items-center justify-center">
        {transformedUrl ? (
          <Image
            src={transformedUrl}
            alt={`${appName} screenshot preview ${selectedIndex + 1}`}
            width={1280}
            height={720}
            unoptimized
            className="w-full h-full object-contain rounded-xl"
          />
        ) : null}

        {/* Navigation Arrows */}
        {screenshots.length > 1 && (
          <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none">
            <button
              type="button"
              onClick={() =>
                setSelectedIndex((prev) => (prev > 0 ? prev - 1 : screenshots.length - 1))
              }
              className="pointer-events-auto w-10 h-10 rounded-full bg-zinc-900/80 border border-zinc-700/80 text-white flex items-center justify-center hover:bg-zinc-800 shadow-xl transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              aria-label="Previous screenshot"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() =>
                setSelectedIndex((prev) => (prev < screenshots.length - 1 ? prev + 1 : 0))
              }
              className="pointer-events-auto w-10 h-10 rounded-full bg-zinc-900/80 border border-zinc-700/80 text-white flex items-center justify-center hover:bg-zinc-800 shadow-xl transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              aria-label="Next screenshot"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </Card>

      {/* Thumbnail Strip */}
      {screenshots.length > 1 && (
        <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar">
          {screenshots.map((src, idx) => {
            const thumbUrl = getAppScreenshotUrl(src, 240, 135);
            const isSelected = selectedIndex === idx;
            return (
              <button
                key={src}
                type="button"
                onClick={() => setSelectedIndex(idx)}
                className={`relative w-28 aspect-video rounded-lg overflow-hidden border-2 transition-all shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                  isSelected
                    ? 'border-indigo-500 ring-2 ring-indigo-500/20'
                    : 'border-zinc-800 opacity-60 hover:opacity-100'
                }`}
                aria-label={`View screenshot ${idx + 1}`}
              >
                <Image
                  src={thumbUrl}
                  alt={`${appName} thumbnail ${idx + 1}`}
                  width={240}
                  height={135}
                  unoptimized
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
