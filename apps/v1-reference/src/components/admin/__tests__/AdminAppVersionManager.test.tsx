import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AdminAppVersionManager } from '../AdminAppVersionManager';
import { appVersionService } from '@/services/version.service';
import type { AppVersion } from '@/types/version.types';
import { ok } from '@/lib/result';

describe('Admin App Version Manager (Prompt 48)', () => {
  const mockVersions: AppVersion[] = [
    {
      id: 'ver-2',
      appId: 'app-1',
      version: '2.0.0',
      title: 'Major Engine Upgrade',
      summary: 'Complete rewrite in WebAssembly',
      releaseNotes: '### Changes in 2.0.0\n- High performance engine\n- Dark mode support',
      highlights: ['WASM Kernel', 'Zero latency rendering'],
      releaseDate: 1700000000000,
      status: 'published',
      isCurrent: true,
      createdAt: 1700000000000,
      updatedAt: 1700000000000,
    },
    {
      id: 'ver-1',
      appId: 'app-1',
      version: '1.0.0',
      title: 'Initial Release',
      summary: 'First public version',
      releaseNotes: 'First release notes',
      highlights: ['Basic functionality'],
      releaseDate: 1690000000000,
      status: 'published',
      isCurrent: false,
      createdAt: 1690000000000,
      updatedAt: 1690000000000,
    },
    {
      id: 'ver-3',
      appId: 'app-1',
      version: '2.1.0-beta',
      title: 'Experimental Cloud Sync',
      summary: 'Beta preview of cloud sync',
      releaseNotes: 'Draft release notes',
      highlights: [],
      releaseDate: 1705000000000,
      status: 'draft',
      isCurrent: false,
      createdAt: 1705000000000,
      updatedAt: 1705000000000,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    vi.spyOn(appVersionService, 'listVersions').mockResolvedValue(
      ok({ items: mockVersions, hasMore: false })
    );

    vi.spyOn(appVersionService, 'createVersion').mockImplementation(async (appId, dto) =>
      ok({
        id: 'new-ver-1',
        appId,
        version: dto.version,
        title: dto.title,
        summary: dto.summary,
        releaseNotes: dto.releaseNotes,
        highlights: dto.highlights || [],
        releaseDate: dto.releaseDate || Date.now(),
        status: dto.status || 'draft',
        isCurrent: Boolean(dto.isCurrent),
        createdAt: 1700000000000,
        updatedAt: 1700000000000,
      })
    );

    vi.spyOn(appVersionService, 'publishVersion').mockImplementation(async (_appId, versionId) => {
      const match = mockVersions.find((v) => v.id === versionId) || mockVersions[0];
      return ok({
        ...match!,
        status: 'published',
      });
    });

    vi.spyOn(appVersionService, 'setCurrentVersion').mockImplementation(
      async (_appId, versionId) => {
        const match = mockVersions.find((v) => v.id === versionId) || mockVersions[0];
        return ok({
          ...match!,
          isCurrent: true,
        });
      }
    );

    vi.spyOn(appVersionService, 'archiveVersion').mockImplementation(async (_appId, versionId) => {
      const match = mockVersions.find((v) => v.id === versionId) || mockVersions[0];
      return ok({
        ...match!,
        status: 'archived',
      });
    });
  });

  it('1. Renders historical versions and live build status badge', async () => {
    render(<AdminAppVersionManager appId="app-1" />);

    expect(await screen.findByText('v2.0.0')).toBeInTheDocument();
    expect(screen.getByText('Major Engine Upgrade')).toBeInTheDocument();
    expect(screen.getByText('Current Live Build')).toBeInTheDocument();
    expect(screen.getByText('v1.0.0')).toBeInTheDocument();
    expect(screen.getByText('v2.1.0-beta')).toBeInTheDocument();
  });

  it('2. Expands and collapses changelog release notes and highlights', async () => {
    const user = userEvent.setup();
    render(<AdminAppVersionManager appId="app-1" />);

    await screen.findByText('v2.0.0');

    expect(screen.queryByText('WASM Kernel')).not.toBeInTheDocument();

    const expandBtn = screen.getAllByRole('button', { name: /Expand changelog/i })[0];
    await user.click(expandBtn!);

    expect(screen.getByText('WASM Kernel')).toBeInTheDocument();
    expect(screen.getByText(/Zero latency rendering/i)).toBeInTheDocument();
  });

  it('3. Creates a new release with semver validation', async () => {
    const user = userEvent.setup();
    render(<AdminAppVersionManager appId="app-1" />);

    const newBtn = await screen.findByRole('button', { name: /New Release/i });
    await user.click(newBtn);

    expect(screen.getByRole('dialog', { name: /Create Release Version/i })).toBeInTheDocument();

    const verInput = screen.getByLabelText(/Version Number/i);
    const titleInput = screen.getByLabelText(/Release Title/i);

    // Test invalid semver
    await user.type(verInput, 'invalid-version');
    await user.type(titleInput, 'Test Title');

    const submitBtn = within(screen.getByRole('dialog')).getByRole('button', {
      name: /Create Release/i,
    });
    await user.click(submitBtn);

    expect(screen.getByText(/Please enter a valid semantic version/i)).toBeInTheDocument();

    // Fix semver
    await user.clear(verInput);
    await user.type(verInput, '2.2.0');
    await user.click(submitBtn);

    expect(appVersionService.createVersion).toHaveBeenCalled();
  });

  it('4. Publishes a draft version', async () => {
    const user = userEvent.setup();
    render(<AdminAppVersionManager appId="app-1" />);

    await screen.findByText('v2.1.0-beta');

    const publishBtn = screen.getByRole('button', { name: /Publish/i });
    await user.click(publishBtn);

    expect(appVersionService.publishVersion).toHaveBeenCalledWith('app-1', 'ver-3');
  });

  it('5. Archives a version with confirmation dialog', async () => {
    const user = userEvent.setup();
    render(<AdminAppVersionManager appId="app-1" />);

    await screen.findByText('v1.0.0');

    const archiveBtn = screen.getByRole('button', { name: /Archive version 1.0.0/i });
    await user.click(archiveBtn);

    expect(screen.getByRole('dialog', { name: /Archive Release/i })).toBeInTheDocument();

    const confirmBtn = within(screen.getByRole('dialog')).getByRole('button', {
      name: /Archive Release/i,
    });
    await user.click(confirmBtn);

    expect(appVersionService.archiveVersion).toHaveBeenCalledWith('app-1', 'ver-1');
  });
});
