import type { ID, Timestamp } from './common.types';

/**
 * Tag Domain Entity
 */
export interface Tag {
  readonly id: ID;
  readonly name: string;
  readonly slug: string;
  readonly description?: string;
  readonly color?: string;
  readonly isActive: boolean;
  readonly createdAt: Timestamp;
  readonly updatedAt: Timestamp;
}
