'use client';

import * as React from 'react';
import { Card, Button, Badge } from '@elsesourav/ui';
import { ImageInputWithLibrary } from '@/features/admin/media/components/ImageInputWithLibrary';
import { CanvasLogoLoader } from '@/components/loading/CanvasLogoLoader';
import { AnimatedLoadingText } from '@/components/loading/AnimatedLoadingText';
import { extractLogoPixelsFromUrl } from '@/components/loading/extractLogoPixels';
import { parseLogoPixels, type LogoPixelTuple } from '@/components/loading/logoPixelData';
import { Sparkles, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';

export interface AdminBrandLogoSectionProps {
  settings: Record<string, string>;
  handleChange: (key: string, value: string) => void;
}

export function AdminBrandLogoSection({
  settings,
  handleChange,
}: AdminBrandLogoSectionProps) {
  const currentLogoUrl = settings['site_logo_url'] || '';
  const currentPixelsJson = settings['site_logo_pixels_json'] || '';

  const [isSampling, setIsSampling] = React.useState(false);
  const [sampleError, setSampleError] = React.useState<string | null>(null);
  const [sampleSuccess, setSampleSuccess] = React.useState<string | null>(null);
  const [activePreviewPixels, setActivePreviewPixels] = React.useState<LogoPixelTuple[] | null>(
    null
  );

  // Initialize preview pixels from settings if present
  React.useEffect(() => {
    if (currentPixelsJson) {
      const parsed = parseLogoPixels(currentPixelsJson);
      if (parsed.length > 20) {
        setActivePreviewPixels(parsed);
      }
    }
  }, [currentPixelsJson]);

  // Extract lightweight pixel points matrix from logo (SVG or raster)
  const handleExtractPixels = async (urlToSample?: string) => {
    const targetUrl = urlToSample || currentLogoUrl || '/logo.png';
    setIsSampling(true);
    setSampleError(null);
    setSampleSuccess(null);

    try {
      const result = await extractLogoPixelsFromUrl(targetUrl, 64);
      if (result.pixels.length < 10) {
        throw new Error('Image contains too few non-transparent pixels. Please check the image format.');
      }

      handleChange('site_logo_pixels_json', result.base64);
      setActivePreviewPixels(result.pixels);
      setSampleSuccess(`Extracted and stored ${result.count} lightweight particles successfully!`);
    } catch (err) {
      setSampleError(err instanceof Error ? err.message : 'Failed to sample pixels from image');
    } finally {
      setIsSampling(false);
    }
  };

  const pixelCount = activePreviewPixels ? activePreviewPixels.length : 146;

  return (
    <div className="space-y-4 pt-2">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Brand Assets &amp; Lightweight Loading Screen System</span>
          </h4>
          <p className="text-xs text-zinc-600 dark:text-zinc-400">
            Configure dynamic brand icon, SVG vectors, and pre-computed lightweight canvas loading particles.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Inputs (7 cols): Logo & SVG settings */}
        <div className="lg:col-span-7 space-y-4">
          <ImageInputWithLibrary
            label="Site Brand Icon / Monogram (SVG / WebP / PNG)"
            value={currentLogoUrl}
            onChange={(val) => {
              handleChange('site_logo_url', val);
              if (val) {
                // Auto-trigger lightweight pixel extraction on upload or selection
                handleExtractPixels(val);
              }
            }}
            folder="general"
            defaultCategory="general"
            previewShape="square"
            placeholder="Logo URL or upload SVG / PNG"
          />

          <ImageInputWithLibrary
            label="Horizontal Brand Wordmark / Logo SVG (Optional)"
            value={settings['site_brand_logo_url'] || ''}
            onChange={(val) => handleChange('site_brand_logo_url', val)}
            folder="general"
            defaultCategory="general"
            previewShape="banner"
            placeholder="Horizontal brand logo SVG URL"
          />

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleExtractPixels()}
              disabled={isSampling}
              className="border-indigo-200 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-xs flex items-center gap-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSampling ? 'animate-spin' : ''}`} />
              <span>{isSampling ? 'Extracting Pixels...' : 'Re-generate Lightweight Pixels'}</span>
            </Button>

            <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
              {pixelCount.toLocaleString()} uniform particles (~876 bytes)
            </span>
          </div>

          {sampleSuccess && (
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>{sampleSuccess}</span>
            </div>
          )}

          {sampleError && (
            <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-500/30 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
              <span>{sampleError}</span>
            </div>
          )}
        </div>

        {/* Right Preview Card (5 cols): Live Canvas Interactive Preview */}
        <div className="lg:col-span-5">
          <Card className="p-4 border-indigo-200 dark:border-indigo-500/20 bg-zinc-50 dark:bg-zinc-950/80 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden shadow-inner">
            <div className="w-full flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800 text-[11px] font-mono text-zinc-600 dark:text-zinc-400">
              <span>Loading Screen Preview</span>
              <Badge variant="outline" className="text-[10px] text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-500/30">
                Lightweight 60fps
              </Badge>
            </div>

            <div className="py-4 flex flex-col items-center">
              <CanvasLogoLoader
                size={180}
                durationMs={520}
                pixelData={activePreviewPixels || undefined}
                active={true}
              />
              <div className="mt-2 text-center">
                <span className="text-xs font-semibold tracking-wider uppercase text-zinc-800 dark:text-zinc-200">
                  {settings['site_name'] || 'ElseSourav'}
                </span>
                <AnimatedLoadingText label="Loading Studio" />
              </div>
            </div>

            <p className="text-[10px] text-zinc-500 dark:text-zinc-400 text-center leading-normal pt-1">
              Live preview reflects exact zero-lag in-memory particle convergence and energy glow sweep.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
