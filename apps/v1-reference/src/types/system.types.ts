/**
 * System and Application Metadata Types
 */

export type Environment = 'development' | 'production' | 'test';

export type SystemStatus = 'ready' | 'building' | 'maintenance' | 'offline';

export interface AppMetadata {
  readonly name: string;
  readonly tagline: string;
  readonly version: string;
  readonly status: SystemStatus;
  readonly environment: Environment;
}
