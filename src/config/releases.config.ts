export interface PlatformRelease {
  readonly version: string;
  readonly date: string;
  readonly title: string;
  readonly summary: string;
  readonly highlights: readonly string[];
  readonly categories: {
    readonly added?: readonly string[];
    readonly changed?: readonly string[];
    readonly fixed?: readonly string[];
    readonly security?: readonly string[];
    readonly performance?: readonly string[];
  };
}

export const PLATFORM_RELEASES: readonly PlatformRelease[] = [
  {
    version: '0.1.0',
    date: '2026-08-28',
    title: 'Initial Production Release Candidate',
    summary:
      'Comprehensive single-publisher platform launch featuring software directory, editorial blog, user library, support engine, and admin control center.',
    highlights: [
      'Full public application catalog with categorized discovery and version tracking',
      'Authenticated user personal library and support ticketing system',
      'Admin control center with real-time health diagnostics and audit trail',
      'Production-grade privacy-preserving error logging and performance telemetry',
      'Automated CI/CD validation pipelines with ephemeral PR preview channels',
    ],
    categories: {
      added: [
        'Single-publisher application showcase & downloads',
        'User authentication & personal software library',
        'Support ticket management and threaded messaging',
        'Centralized error telemetry & health diagnostics',
        'Automated GitHub Actions CI/CD workflows',
      ],
      changed: [
        'Modular Firebase Web SDK 12 architecture',
        'High-contrast glassmorphic design token system',
      ],
      security: [
        'Strict Firestore security rules with role-based access control',
        'Deep recursive privacy redaction on all telemetry',
      ],
      performance: [
        'Deterministic Vite manual chunking and immutable asset caching',
      ],
    },
  },
];

export function getLatestPlatformRelease(): PlatformRelease {
  const latest = PLATFORM_RELEASES[0];
  if (!latest) {
    return {
      version: '0.1.0',
      date: '2026-08-28',
      title: 'Initial Release',
      summary: 'ElseSourav platform release',
      highlights: ['Initial release'],
      categories: {},
    };
  }
  return latest;
}
