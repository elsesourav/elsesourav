import type { ID, Timestamp } from './common.types';

/**
 * App Version Release Status
 */
export type AppVersionStatus = 'draft' | 'published' | 'archived';

/**
 * App Version Entity (Subcollection: /apps/{appId}/versions/{versionId})
 */
export interface AppVersion {
  readonly id: ID;
  readonly appId: ID;
  readonly version: string;
  readonly title: string;
  readonly summary: string;
  readonly releaseNotes: string;
  readonly highlights: readonly string[];
  readonly releaseDate: Timestamp;
  readonly status: AppVersionStatus;
  readonly isCurrent: boolean;
  readonly minOsVersion?: string;
  readonly downloadUrl?: string;
  readonly fileSize?: string;
  readonly createdAt: Timestamp;
  readonly updatedAt: Timestamp;
}
