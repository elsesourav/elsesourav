import type { ID, Timestamp } from './common.types';

/**
 * Supported Media Asset Types
 */
export type AppMediaType =
  'icon' | 'hero' | 'screenshot' | 'video' | 'social' | 'gallery' | 'other';

/**
 * App Media Metadata Entity (Subcollection: /apps/{appId}/media/{mediaId})
 */
export interface AppMedia {
  readonly id: ID;
  readonly appId: ID;
  readonly type: AppMediaType;
  readonly url: string;
  readonly altText: string;
  readonly title?: string;
  readonly width?: number;
  readonly height?: number;
  readonly orderIndex: number;
  readonly isPrimary?: boolean;
  readonly isDecorative?: boolean;
  readonly isActive: boolean;
  readonly createdAt: Timestamp;
  readonly updatedAt: Timestamp;
}
