import React, { useState, useEffect, useCallback } from 'react';
import { ImageOff } from 'lucide-react';
import { isSafeImageUrl } from '@/utils/url-safety';
import './Image.css';

export interface ImageProps
  extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt' | 'loading' | 'onError' | 'onLoad'> {
  readonly src?: string | null;
  readonly alt: string;
  readonly width?: number | string;
  readonly height?: number | string;
  readonly aspectRatio?: string | number;
  readonly loading?: 'lazy' | 'eager';
  readonly decoding?: 'async' | 'sync' | 'auto';
  readonly priority?: boolean;
  readonly as?: 'div' | 'span';
  readonly fallback?: React.ReactNode;
  readonly fallbackIcon?: React.ReactNode;
  readonly fallbackText?: string;
  readonly objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  readonly containerClassName?: string;
  readonly containerStyle?: React.CSSProperties;
  readonly onLoad?: (event: React.SyntheticEvent<HTMLImageElement>) => void;
  readonly onError?: (event: React.SyntheticEvent<HTMLImageElement>) => void;
}

export const Image: React.FC<ImageProps> = ({
  src,
  alt,
  width,
  height,
  aspectRatio,
  loading = 'lazy',
  decoding = 'async',
  priority = false,
  as: Component = 'span',
  fallback,
  fallbackIcon,
  fallbackText,
  objectFit = 'cover',
  className = '',
  containerClassName = '',
  style,
  containerStyle,
  onLoad,
  onError,
  ...restProps
}) => {
  const isSafe = isSafeImageUrl(src);
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error' | 'empty'>(
    !src || !isSafe ? 'empty' : 'loading'
  );

  // Sync status if src changes
  useEffect(() => {
    if (!src || !isSafeImageUrl(src)) {
      setStatus('empty');
    } else {
      setStatus('loading');
    }
  }, [src]);

  const handleLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      setStatus('loaded');
      if (onLoad) {
        onLoad(e);
      }
    },
    [onLoad]
  );

  const handleError = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      setStatus('error');
      if (onError) {
        onError(e);
      }
    },
    [onError]
  );

  const effectiveLoading = priority ? 'eager' : loading;
  const effectiveDecoding = decoding;
  const fetchPriority = priority ? 'high' : undefined;

  const combinedContainerStyle: React.CSSProperties = {
    ...containerStyle,
    ...(aspectRatio ? { aspectRatio: String(aspectRatio) } : {}),
    ...(width !== undefined ? { width: typeof width === 'number' ? `${width}px` : width } : {}),
    ...(height !== undefined ? { height: typeof height === 'number' ? `${height}px` : height } : {}),
  };

  const imageStyle: React.CSSProperties = {
    ...style,
    objectFit,
  };

  const isFailed = status === 'error' || status === 'empty';

  return (
    <Component
      className={`ui-image-container ${aspectRatio ? 'ui-image-container--has-aspect' : ''} ${containerClassName}`.trim()}
      style={combinedContainerStyle}
    >
      {status === 'loading' && <span className="ui-image-skeleton" aria-hidden="true" />}

      {isFailed ? (
        fallback !== undefined ? (
          fallback
        ) : (
          <span className="ui-image-fallback" role="img" aria-label={alt || 'Image unavailable'}>
            <span className="ui-image-fallback__icon" aria-hidden="true">
              {fallbackIcon || <ImageOff size={24} />}
            </span>
            {fallbackText && <span className="ui-image-fallback__text">{fallbackText}</span>}
          </span>
        )
      ) : (
        <img
          src={src || ''}
          alt={alt}
          width={typeof width === 'number' ? width : undefined}
          height={typeof height === 'number' ? height : undefined}
          loading={effectiveLoading}
          decoding={effectiveDecoding}
          fetchPriority={fetchPriority}
          className={`ui-image ui-image--${status} ${className}`.trim()}
          style={imageStyle}
          onLoad={handleLoad}
          onError={handleError}
          {...restProps}
        />
      )}
    </Component>
  );
};
