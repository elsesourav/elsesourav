import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AppVersionService } from '../version.service';
import type { IAppVersionRepository, CreateAppVersionDto } from '@/repositories';
import type { AppVersion } from '@/types/version.types';
import { ok } from '@/lib/result';
import { createAppVersionSchema } from '@/schemas/version.schema';
import { isValidSemver, normalizeSemver, compareSemver } from '@/utils/semver';

describe('AppVersionService & Release History System', () => {
  let mockVersionRepo: IAppVersionRepository;
  let versionService: AppVersionService;

  const mockVersion1: AppVersion = {
    id: 'ver-1',
    appId: 'app-calc',
    version: '1.0.0',
    title: 'Initial Release',
    summary: 'First public release of the Scientific Calculator.',
    releaseNotes: '### New Features\n- Basic arithmetic\n- Scientific operations',
    highlights: ['Keyboard shortcuts', 'Full precision'],
    releaseDate: 1700000000000,
    status: 'published',
    isCurrent: false,
    createdAt: 1700000000000,
    updatedAt: 1700000000000,
  };

  const mockVersion2: AppVersion = {
    id: 'ver-2',
    appId: 'app-calc',
    version: '1.1.0',
    title: 'Graphing & Themes',
    summary: 'Added 2D graphing and dark theme options.',
    releaseNotes: '### New Features\n- 2D Canvas graphing\n- Sleek dark mode',
    highlights: ['Graphing engine', 'Dark theme'],
    releaseDate: 1700010000000,
    status: 'published',
    isCurrent: true,
    createdAt: 1700010000000,
    updatedAt: 1700010000000,
  };

  beforeEach(() => {
    mockVersionRepo = {
      findById: vi.fn(),
      findByVersion: vi.fn(),
      listByApp: vi.fn(),
      getLatest: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      checkVersionUnique: vi.fn(),
      setCurrentVersion: vi.fn(),
    };

    versionService = new AppVersionService(mockVersionRepo);
  });

  describe('1. SemVer Utility & Validation', () => {
    it('validates standard and pre-release SemVer strings', () => {
      expect(isValidSemver('1.0.0')).toBe(true);
      expect(isValidSemver('v1.2.3')).toBe(true);
      expect(isValidSemver('2.0.0-beta.1')).toBe(true);
      expect(isValidSemver('0.1.0-alpha+build.123')).toBe(true);

      expect(isValidSemver('1.0')).toBe(false);
      expect(isValidSemver('1')).toBe(false);
      expect(isValidSemver('beta-1')).toBe(false);
      expect(isValidSemver('1.0.0.0')).toBe(false);
      expect(isValidSemver('')).toBe(false);
    });

    it('normalizes version strings by removing optional leading v', () => {
      expect(normalizeSemver('v1.0.0')).toBe('1.0.0');
      expect(normalizeSemver('V2.1.0')).toBe('2.1.0');
      expect(normalizeSemver('1.0.0')).toBe('1.0.0');
    });

    it('accurately compares SemVer versions', () => {
      expect(compareSemver('1.1.0', '1.0.0')).toBeGreaterThan(0);
      expect(compareSemver('1.0.0', '1.1.0')).toBeLessThan(0);
      expect(compareSemver('1.0.0', '1.0.0')).toBe(0);
      expect(compareSemver('1.0.0', '1.0.0-beta.1')).toBeGreaterThan(0);
    });
  });

  describe('2. Version Creation and Conflict Prevention', () => {
    it('creates a valid release version when version is unique for the app', async () => {
      const createDto: CreateAppVersionDto = {
        appId: 'app-calc',
        version: 'v1.2.0',
        title: 'Performance Update',
        summary: 'Massive performance overhaul.',
        releaseNotes: 'Optimized rendering loop.',
        highlights: ['5x faster calculations'],
        status: 'published',
        isCurrent: true,
      };

      vi.mocked(mockVersionRepo.checkVersionUnique).mockResolvedValue(ok(true));
      vi.mocked(mockVersionRepo.create).mockResolvedValue(
        ok({
          ...mockVersion2,
          version: '1.2.0',
          title: createDto.title,
        })
      );

      const result = await versionService.createVersion('app-calc', createDto);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.version).toBe('1.2.0');
        expect(result.data.title).toBe('Performance Update');
      }
      expect(mockVersionRepo.checkVersionUnique).toHaveBeenCalledWith('app-calc', '1.2.0');
      expect(mockVersionRepo.create).toHaveBeenCalled();
    });

    it('rejects version creation if version already exists for the app', async () => {
      const createDto: CreateAppVersionDto = {
        appId: 'app-calc',
        version: '1.0.0',
        title: 'Duplicate Release',
        summary: 'Duplicate.',
        releaseNotes: 'Duplicate.',
        highlights: [],
        status: 'published',
        isCurrent: false,
      };

      vi.mocked(mockVersionRepo.checkVersionUnique).mockResolvedValue(ok(false));

      const result = await versionService.createVersion('app-calc', createDto);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('BAD_REQUEST');
        expect(result.error.message).toContain('already exists');
      }
      expect(mockVersionRepo.create).not.toHaveBeenCalled();
    });

    it('rejects malformed SemVer schema', () => {
      const invalidVersion = {
        appId: 'app-calc',
        version: 'not-a-semver',
        title: '',
        summary: '',
        releaseNotes: '',
      };

      const parsed = createAppVersionSchema.safeParse(invalidVersion);
      expect(parsed.success).toBe(false);
      if (!parsed.success) {
        const fields = parsed.error.issues.map((i) => i.path[0]);
        expect(fields).toContain('version');
        expect(fields).toContain('title');
        expect(fields).toContain('summary');
        expect(fields).toContain('releaseNotes');
      }
    });
  });

  describe('3. Version History & Latest Release Retrieval', () => {
    it('retrieves the latest published version', async () => {
      vi.mocked(mockVersionRepo.getLatest).mockResolvedValue(ok(mockVersion2));

      const result = await versionService.getLatestVersion('app-calc');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data?.version).toBe('1.1.0');
        expect(result.data?.isCurrent).toBe(true);
      }
      expect(mockVersionRepo.getLatest).toHaveBeenCalledWith('app-calc');
    });

    it('lists version history with cursor pagination', async () => {
      vi.mocked(mockVersionRepo.listByApp).mockResolvedValue(
        ok({
          items: [mockVersion2, mockVersion1],
          hasMore: false,
          nextCursor: undefined,
        })
      );

      const result = await versionService.listVersions('app-calc', { limit: 10 });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.items).toHaveLength(2);
        expect(result.data.items[0]?.version).toBe('1.1.0');
        expect(result.data.items[1]?.version).toBe('1.0.0');
      }
      expect(mockVersionRepo.listByApp).toHaveBeenCalledWith('app-calc', { limit: 10 });
    });

    it('retrieves version by specific version number', async () => {
      vi.mocked(mockVersionRepo.findByVersion).mockResolvedValue(ok(mockVersion1));

      const result = await versionService.getVersionByNumber('app-calc', '1.0.0');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data?.version).toBe('1.0.0');
      }
      expect(mockVersionRepo.findByVersion).toHaveBeenCalledWith('app-calc', '1.0.0');
    });
  });

  describe('4. Lifecycle & Current Version Setting', () => {
    it('sets the current active production version', async () => {
      const activeVersion: AppVersion = {
        ...mockVersion1,
        isCurrent: true,
      };

      vi.mocked(mockVersionRepo.setCurrentVersion).mockResolvedValue(ok(activeVersion));

      const result = await versionService.setCurrentVersion('app-calc', 'ver-1');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.isCurrent).toBe(true);
      }
      expect(mockVersionRepo.setCurrentVersion).toHaveBeenCalledWith('app-calc', 'ver-1');
    });

    it('archives a version release', async () => {
      const archivedVersion: AppVersion = {
        ...mockVersion1,
        status: 'archived',
      };

      vi.mocked(mockVersionRepo.update).mockResolvedValue(ok(archivedVersion));

      const result = await versionService.archiveVersion('app-calc', 'ver-1');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.status).toBe('archived');
      }
      expect(mockVersionRepo.update).toHaveBeenCalledWith('app-calc', 'ver-1', {
        status: 'archived',
      });
    });
  });
});
