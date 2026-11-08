'use client';

import * as React from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Maximize2 } from 'lucide-react';
import { IconButton } from '@elsesourav/ui';

interface AppMediaVideoCardProps {
  videoUrl: string;
  posterUrl?: string | null;
  appName: string;
  className?: string;
}

export function AppMediaVideoCard({
  videoUrl,
  posterUrl,
  appName,
  className = '',
}: AppMediaVideoCardProps) {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = React.useState(false);
  const [isMuted, setIsMuted] = React.useState(true);
  const [_isLoaded, setIsLoaded] = React.useState(false);

  // Check if it's a direct video file (mp4, webm, etc.) or an embed
  const isDirectVideo = React.useMemo(() => {
    return (
      videoUrl.endsWith('.mp4') ||
      videoUrl.endsWith('.webm') ||
      videoUrl.endsWith('.ogg') ||
      videoUrl.includes('blob.core') ||
      videoUrl.includes('supabase.co/storage') ||
      (!videoUrl.includes('youtube.com') &&
        !videoUrl.includes('youtu.be') &&
        !videoUrl.includes('vimeo.com'))
    );
  }, [videoUrl]);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  const handleRestart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.currentTime = 0;
    videoRef.current.play();
    setIsPlaying(true);
  };

  const handleFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!containerRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      containerRef.current.requestFullscreen().catch(() => {});
    }
  };

  if (!isDirectVideo) {
    // If YouTube or Vimeo embed
    const embedUrl = videoUrl.includes('watch?v=')
      ? videoUrl.replace('watch?v=', 'embed/')
      : videoUrl.includes('youtu.be/')
        ? videoUrl.replace('youtu.be/', 'www.youtube.com/embed/')
        : videoUrl;

    return (
      <div
        ref={containerRef}
        className={`relative aspect-[16/10] shrink-0 rounded-xl overflow-hidden border border-[hsl(var(--border))] dark:border-zinc-800/80 bg-[hsl(var(--card))] dark:bg-zinc-950 shadow-md hover:shadow-xl shadow-black/8 dark:shadow-black/40 transition-all duration-300 group ${
          className || 'w-[86vw] sm:w-[calc(50%-8px)]'
        }`}
      >
        <iframe
          src={`${embedUrl}?autoplay=0&rel=0&modestbranding=1`}
          title={`${appName} Video Showcase`}
          className="w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onClick={togglePlay}
      className={`relative aspect-[16/10] shrink-0 rounded-xl overflow-hidden border border-[hsl(var(--border))] dark:border-zinc-800/80 bg-[hsl(var(--card))] dark:bg-zinc-950 shadow-md hover:shadow-xl shadow-black/8 dark:shadow-black/40 transition-all duration-300 group cursor-pointer select-none ${
        className || 'w-[86vw] sm:w-[calc(50%-8px)]'
      }`}
    >
      <video
        ref={videoRef}
        src={videoUrl}
        poster={posterUrl || undefined}
        loop
        muted={isMuted}
        playsInline
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onLoadedData={() => setIsLoaded(true)}
        className="w-full h-full object-cover"
      />

      {/* Subtle bottom gradient that fades in ONLY on hover alongside controls */}
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 focus-within:opacity-100 max-sm:opacity-100 transition-opacity duration-300" />

      {/* Styled Bottom Controls Bar: Replay on left, Play/Mute/Expand on right with smooth transition on hover */}
      <div className="absolute inset-x-3 bottom-3 flex items-center justify-between gap-2 p-1.5 rounded-2xl bg-black/70 hover:bg-black/80 dark:bg-zinc-950/80 dark:hover:bg-zinc-950/90 border border-white/15 dark:border-zinc-800/80 backdrop-blur-xl pointer-events-auto opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 focus-within:opacity-100 focus-within:translate-y-0 max-sm:opacity-100 max-sm:translate-y-0 transition-all duration-300 ease-out">
        {/* Left: Replay Button */}
        <IconButton
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={handleRestart}
          aria-label="Replay Video"
          icon={<RotateCcw className="w-4 h-4 sm:w-4.5 sm:h-4.5" />}
          className="rounded-xl bg-white/10 hover:bg-white/20 text-white"
        />

        {/* Right Action Group: Play/Pause, Mute/Unmute, Fullscreen/Expand */}
        <div className="flex items-center gap-1.5">
          {/* Play/Pause */}
          <IconButton
            type="button"
            variant="primary"
            size="icon-sm"
            onClick={togglePlay}
            aria-label={isPlaying ? 'Pause video' : 'Play video'}
            icon={
              isPlaying ? (
                <Pause className="w-4 h-4 sm:w-4.5 sm:h-4.5 fill-white" />
              ) : (
                <Play className="w-4 h-4 sm:w-4.5 sm:h-4.5 ml-0.5 fill-white" />
              )
            }
            className="rounded-xl shadow-md shadow-indigo-600/30 text-white"
          />

          {/* Mute/Unmute */}
          <IconButton
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={toggleMute}
            aria-label={isMuted ? 'Unmute video' : 'Mute video'}
            icon={
              isMuted ? (
                <VolumeX className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-zinc-300" />
              ) : (
                <Volume2 className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-emerald-400" />
              )
            }
            className="rounded-xl bg-white/10 hover:bg-white/20 text-white"
          />

          {/* Fullscreen / Expand (in the same bottom-right position as the image card expand button) */}
          <IconButton
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={handleFullscreen}
            aria-label="Fullscreen video"
            icon={<Maximize2 className="w-4 h-4 sm:w-4.5 sm:h-4.5" />}
            className="rounded-xl bg-white/10 hover:bg-white/20 text-white"
          />
        </div>
      </div>
    </div>
  );
}
