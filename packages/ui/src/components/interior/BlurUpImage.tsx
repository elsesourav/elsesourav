'use client';

import React, { useRef, useState } from 'react';
import { motion, useIsomorphicLayoutEffect, useReducedMotion } from 'motion/react';

const DEVELOP = { duration: 0.65, ease: [0.23, 1, 0.32, 1] } as const;

const INSTANT = { duration: 0 } as const;

const CACHE = new Set<string>();

export type BlurUpStatus = 'loading' | 'ready' | 'error';

export type UseBlurUpImageOptions = {
  src?: string;
  srcSet?: string;
  onReady?: () => void;
  onError?: () => void;
};

export function useBlurUpImage({ src, srcSet, onReady, onError }: UseBlurUpImageOptions) {
  const ref = useRef<HTMLImageElement>(null);
  const isPreloaded = Boolean(src && CACHE.has(src));
  const [state, setState] = useState<{
    status: BlurUpStatus;
    instant: boolean;
  }>({
    status: isPreloaded ? 'ready' : 'loading',
    instant: isPreloaded,
  });

  const ready = useRef(onReady);
  ready.current = onReady;
  const failed = useRef(onError);
  failed.current = onError;

  useIsomorphicLayoutEffect(() => {
    const img = ref.current;

    const set = (status: BlurUpStatus, instant: boolean) =>
      setState((prev) =>
        prev.status === status && prev.instant === instant ? prev : { status, instant }
      );

    if (!img || !src) {
      set('loading', false);
      return;
    }

    let alive = true;

    const cached = (img.complete && img.naturalWidth > 0) || isPreloaded;

    const reveal = () => {
      if (!alive) return;
      if (src) CACHE.add(src);
      set('ready', cached);
      ready.current?.();
    };

    const fail = () => {
      if (!alive) return;
      set('error', cached);
      failed.current?.();
    };

    if (img.complete) {
      if (cached) reveal();
      else fail();
      return () => {
        alive = false;
      };
    }

    set('loading', false);

    const onLoad = () => {
      if (!alive) return;
      if (typeof img.decode === 'function') {
        img.decode()
          .then(reveal)
          .catch(() => {
            if (img.naturalWidth > 0) {
              reveal();
            } else {
              fail();
            }
          });
        return;
      }
      reveal();
    };

    img.addEventListener('load', onLoad);
    img.addEventListener('error', fail);

    return () => {
      alive = false;
      img.removeEventListener('load', onLoad);
      img.removeEventListener('error', fail);
    };
  }, [src, srcSet, isPreloaded]);

  return {
    ref,
    status: state.status,
    instant: state.instant,
    loaded: state.status === 'ready',
  };
}

export type BlurUpImageProps = {
  src?: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  placeholder?: string;
  color?: string;
  blur?: number;
  radius?: number;
  srcSet?: string;
  sizes?: string;
  loading?: 'lazy' | 'eager';
  fetchPriority?: 'high' | 'low' | 'auto';
  onReady?: () => void;
  onError?: () => void;
  className?: string;
  imgClassName?: string;
};

export function BlurUpImage({
  src,
  alt,
  width,
  height,
  fill = false,
  placeholder,
  color,
  blur = 14,
  radius,
  srcSet,
  sizes,
  loading = 'lazy',
  fetchPriority,
  onReady,
  onError,
  className = '',
  imgClassName = '',
}: BlurUpImageProps) {
  const reduced = useReducedMotion();
  const { ref, status, instant } = useBlurUpImage({
    src,
    srcSet,
    onReady,
    onError,
  });

  const shown = status === 'ready';
  const still = reduced === true || instant;
  const transition = still ? INSTANT : DEVELOP;
  const resolvedRadius = radius !== undefined ? radius : fill ? undefined : 11;

  return (
    <div
      data-interior="blur-up-image"
      aria-busy={status === 'loading'}
      style={{
        aspectRatio: fill ? undefined : width && height ? `${width} / ${height}` : undefined,
        borderRadius: resolvedRadius,
        backgroundColor: color,
      }}
      className={
        fill
          ? `absolute inset-0 h-full w-full overflow-hidden ${className}`
          : `relative w-full overflow-hidden bg-[var(--interior-bg-subtle)] dark:bg-white/15 ${className}`
      }
    >
      {placeholder ? (
        <img
          src={placeholder}
          alt=""
          aria-hidden
          draggable={false}
          className={`absolute inset-0 h-full w-full object-cover ${imgClassName}`}
          style={{ filter: `blur(${blur}px)`, transform: 'scale(1.08)' }}
        />
      ) : null}

      <motion.img
        ref={ref}
        src={src}
        srcSet={srcSet}
        sizes={sizes}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        loading={loading}
        fetchPriority={fetchPriority}
        decoding="async"
        draggable={false}
        className={`absolute inset-0 h-full w-full object-cover ${imgClassName}`}
        initial={false}
        animate={
          still
            ? { opacity: shown ? 1 : 0 }
            : shown
              ? {
                  opacity: 1,
                  filter: 'blur(0px) saturate(1)',
                  scale: 1,
                }
              : {
                  opacity: 0,
                  filter: 'blur(18px) saturate(0.6)',
                  scale: 1.06,
                }
        }
        transition={transition}
      />

      {status === 'error' ? (
        <motion.div
          aria-hidden
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={transition}
          className="absolute inset-0 grid place-items-center bg-white text-[var(--interior-fg-subtle)] dark:bg-[var(--interior-bg-elevated)] dark:text-[var(--interior-fg-muted)]"
        >
          <svg width="22" height="22" viewBox="0 0 256 256" fill="currentColor">
            <path d="M216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16h64a8,8,0,0,0,7.59-5.47l14.83-44.48L163,151.43a8.07,8.07,0,0,0,4.46-4.46l14.62-36.55,44.48-14.83A8,8,0,0,0,232,88V56A16,16,0,0,0,216,40ZM112.41,157.47,98.23,200H40V172l52-52,30.42,30.42L117,152.57A8,8,0,0,0,112.41,157.47ZM216,82.23,173.47,96.41a8,8,0,0,0-4.9,4.62l-14.72,36.82L138.58,144l-35.27-35.27a16,16,0,0,0-22.62,0L40,149.37V56H216Zm12.68,33a8,8,0,0,0-7.21-1.1l-23.8,7.94a8,8,0,0,0-4.9,4.61l-14.31,35.77-35.77,14.31a8,8,0,0,0-4.61,4.9l-7.94,23.8A8,8,0,0,0,137.73,216H216a16,16,0,0,0,16-16V121.73A8,8,0,0,0,228.68,115.24ZM216,200H148.83l3.25-9.75,35.51-14.2a8.07,8.07,0,0,0,4.46-4.46l14.2-35.51,9.75-3.25Z" />
          </svg>
        </motion.div>
      ) : null}
    </div>
  );
}

export default BlurUpImage;
