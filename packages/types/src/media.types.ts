import type { ID, Timestamp } from './common.types';

export type MediaType = 'avatar' | 'app_icon' | 'app_screenshot' | 'blog_cover' | 'help_image' | 'generic';

export type MediaFolder = 'users' | 'apps' | 'blog' | 'help' | 'general';

export interface MediaAsset {
  readonly id: ID;
  readonly publicId: string;
  readonly secureUrl: string;
  readonly mediaType: MediaType;
  readonly folder: string;
  readonly format: string;
  readonly width: number;
  readonly height: number;
  readonly bytes: number;
  readonly createdAt: Timestamp;
  readonly ownerUserId?: ID;
}

export interface MediaUploadSignature {
  readonly signature: string;
  readonly timestamp: number;
  readonly cloudName: string;
  readonly apiKey: string;
  readonly folder: string;
  readonly publicId?: string;
}

export interface MediaTransformationOptions {
  readonly width?: number;
  readonly height?: number;
  readonly crop?: 'fill' | 'scale' | 'fit' | 'thumb' | 'limit' | 'pad';
  readonly gravity?: 'face' | 'center' | 'auto';
  readonly quality?: 'auto' | 'auto:good' | 'auto:eco' | 'auto:low' | number;
  readonly format?: 'auto' | 'webp' | 'avif' | 'png' | 'jpg';
  readonly dpr?: 'auto' | 1 | 2 | 3;
}

export interface DirectUploadParams {
  readonly folder: MediaFolder;
  readonly mediaType: MediaType;
  readonly ownerUserId?: string;
  readonly customPublicId?: string;
}
