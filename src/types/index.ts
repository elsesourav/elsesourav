/**
 * Core Type Definitions for ElseSourav
 * Strict types without `any`
 */

export type NavigationItem = {
  readonly label: string;
  readonly path: string;
  readonly iconName?: string;
  readonly isExternal?: boolean;
};

export type SystemStatus = 'ready' | 'building' | 'maintenance';

export interface AppMetadata {
  readonly name: string;
  readonly version: string;
  readonly status: SystemStatus;
  readonly environment: 'development' | 'production' | 'test';
}
