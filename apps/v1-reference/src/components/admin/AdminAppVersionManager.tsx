import React, { useState, useEffect, useCallback } from 'react';
import {
  GitBranch,
  Plus,
  Edit2,
  Send,
  Archive,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Button, Badge, Input, Skeleton, Dialog } from '@/components/ui';
import { appVersionService } from '@/services/version.service';
import type { AppVersion, AppVersionStatus } from '@/types/version.types';
import { isValidSemver } from '@/utils/semver';
import { formatDate } from '@/utils/format';
import './AdminAppVersionManager.css';

export interface AdminAppVersionManagerProps {
  readonly appId: string;
  readonly onVersionChange?: (newCurrentVersion: string) => void;
}

export const AdminAppVersionManager: React.FC<AdminAppVersionManagerProps> = ({
  appId,
  onVersionChange,
}) => {
  const [versions, setVersions] = useState<readonly AppVersion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Expanded release notes
  const [expandedVersionId, setExpandedVersionId] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVersion, setEditingVersion] = useState<AppVersion | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [formVersion, setFormVersion] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formSummary, setFormSummary] = useState('');
  const [formReleaseNotes, setFormReleaseNotes] = useState('');
  const [formHighlights, setFormHighlights] = useState<string[]>([]);
  const [newHighlightInput, setNewHighlightInput] = useState('');
  const [formIsCurrent, setFormIsCurrent] = useState(false);
  const [formStatus, setFormStatus] = useState<AppVersionStatus>('draft');

  // Confirmation Modal
  const [archiveTarget, setArchiveTarget] = useState<AppVersion | null>(null);
  const [isArchiving, setIsArchiving] = useState(false);

  const fetchVersions = useCallback(async () => {
    if (!appId || appId === 'temp') {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const res = await appVersionService.listVersions(appId, {
      limit: 50,
      orderBy: 'releaseDate',
      orderDirection: 'desc',
    });

    if (res.success) {
      setVersions(res.data.items);
    } else {
      setError(res.error.message);
    }
    setIsLoading(false);
  }, [appId]);

  useEffect(() => {
    void fetchVersions();
  }, [fetchVersions]);

  const handleOpenCreateModal = () => {
    setEditingVersion(null);
    setFormVersion('');
    setFormTitle('');
    setFormSummary('');
    setFormReleaseNotes('');
    setFormHighlights([]);
    setNewHighlightInput('');
    setFormIsCurrent(versions.length === 0);
    setFormStatus('draft');
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (ver: AppVersion) => {
    setEditingVersion(ver);
    setFormVersion(ver.version);
    setFormTitle(ver.title);
    setFormSummary(ver.summary || '');
    setFormReleaseNotes(ver.releaseNotes || '');
    setFormHighlights([...(ver.highlights || [])]);
    setNewHighlightInput('');
    setFormIsCurrent(ver.isCurrent);
    setFormStatus(ver.status);
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleAddHighlight = () => {
    const trimmed = newHighlightInput.trim();
    if (trimmed && !formHighlights.includes(trimmed)) {
      setFormHighlights([...formHighlights, trimmed]);
      setNewHighlightInput('');
    }
  };

  const handleRemoveHighlight = (idx: number) => {
    setFormHighlights(formHighlights.filter((_, i) => i !== idx));
  };

  const handleSaveVersion = async () => {
    const trimmedVersion = formVersion.trim();
    if (!trimmedVersion) {
      setModalError('Version number is required.');
      return;
    }

    if (!isValidSemver(trimmedVersion)) {
      setModalError('Please enter a valid semantic version (e.g. 1.0.0, 2.1.3-beta).');
      return;
    }

    if (!formTitle.trim()) {
      setModalError('Release title is required.');
      return;
    }

    setIsSaving(true);
    setModalError(null);

    const payload = {
      appId,
      version: trimmedVersion,
      title: formTitle.trim(),
      summary: formSummary.trim(),
      releaseNotes: formReleaseNotes.trim(),
      highlights: formHighlights,
      releaseDate: Date.now(),
      status: formStatus,
      isCurrent: formIsCurrent,
    };

    if (editingVersion) {
      const res = await appVersionService.updateVersion(appId, editingVersion.id, payload);
      if (res.success) {
        setVersions((prev) => prev.map((v) => (v.id === editingVersion.id ? res.data : v)));
        if (formIsCurrent) {
          onVersionChange?.(res.data.version);
        }
        setIsModalOpen(false);
      } else {
        setModalError(res.error.message);
      }
    } else {
      const res = await appVersionService.createVersion(appId, payload);
      if (res.success) {
        setVersions((prev) => [res.data, ...prev]);
        if (formIsCurrent) {
          onVersionChange?.(res.data.version);
        }
        setIsModalOpen(false);
      } else {
        setModalError(res.error.message);
      }
    }

    setIsSaving(false);
  };

  const handlePublishVersion = async (ver: AppVersion) => {
    const res = await appVersionService.publishVersion(appId, ver.id);
    if (res.success) {
      setVersions((prev) => prev.map((v) => (v.id === ver.id ? res.data : v)));
    } else {
      setError(res.error.message);
    }
  };

  const handleSetCurrent = async (ver: AppVersion) => {
    const res = await appVersionService.setCurrentVersion(appId, ver.id);
    if (res.success) {
      setVersions((prev) =>
        prev.map((v) => ({
          ...v,
          isCurrent: v.id === ver.id,
        }))
      );
      onVersionChange?.(ver.version);
    } else {
      setError(res.error.message);
    }
  };

  const handleConfirmArchive = async () => {
    if (!archiveTarget) return;

    setIsArchiving(true);
    const res = await appVersionService.archiveVersion(appId, archiveTarget.id);
    setIsArchiving(false);
    setArchiveTarget(null);

    if (res.success) {
      setVersions((prev) => prev.map((v) => (v.id === archiveTarget.id ? res.data : v)));
    } else {
      setError(res.error.message);
    }
  };

  return (
    <div className="admin-version-manager">
      <div className="admin-version-manager__header">
        <div>
          <h3 className="admin-version-manager__title">Release History & Changelog</h3>
          <p className="admin-version-manager__subtitle">
            Manage semantic versions, changelog highlights, and release publication.
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={handleOpenCreateModal}
          leftIcon={<Plus size={14} />}
        >
          New Release
        </Button>
      </div>

      {error && (
        <div className="admin-version-error" role="alert">
          <AlertCircle size={16} aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      {isLoading ? (
        <div className="admin-version-loading" aria-busy="true">
          <Skeleton variant="rectangular" width="100%" height="60px" className="mb-2" />
          <Skeleton variant="rectangular" width="100%" height="60px" />
        </div>
      ) : versions.length === 0 ? (
        <div className="admin-version-empty">
          <GitBranch size={32} aria-hidden="true" />
          <p>No release versions registered for this application yet.</p>
          <Button variant="outline" size="sm" onClick={handleOpenCreateModal}>
            Create Initial Release
          </Button>
        </div>
      ) : (
        <div className="admin-version-list">
          {versions.map((ver) => {
            const isExpanded = expandedVersionId === ver.id;
            return (
              <div key={ver.id} className="admin-version-item">
                <div className="admin-version-item__summary-row">
                  <div className="admin-version-item__left">
                    <span className="admin-version-number">v{ver.version}</span>
                    <span className="admin-version-title">{ver.title}</span>
                    {ver.isCurrent && (
                      <Badge variant="accent" size="sm">
                        Current Live Build
                      </Badge>
                    )}
                    <Badge
                      variant={
                        ver.status === 'published'
                          ? 'success'
                          : ver.status === 'archived'
                            ? 'warning'
                            : 'default'
                      }
                      size="sm"
                    >
                      {ver.status.toUpperCase()}
                    </Badge>
                  </div>

                  <div className="admin-version-item__right">
                    <span className="admin-version-date">{formatDate(ver.releaseDate)}</span>

                    <div className="admin-version-actions">
                      {!ver.isCurrent && ver.status === 'published' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => void handleSetCurrent(ver)}
                        >
                          Set Current
                        </Button>
                      )}

                      {ver.status === 'draft' && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => void handlePublishVersion(ver)}
                          leftIcon={<Send size={13} />}
                        >
                          Publish
                        </Button>
                      )}

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenEditModal(ver)}
                        aria-label={`Edit version ${ver.version}`}
                        leftIcon={<Edit2 size={13} />}
                      />

                      {ver.status !== 'archived' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setArchiveTarget(ver)}
                          aria-label={`Archive version ${ver.version}`}
                          leftIcon={<Archive size={13} />}
                        />
                      )}

                      <button
                        type="button"
                        className="admin-version-expand-btn"
                        onClick={() => setExpandedVersionId(isExpanded ? null : ver.id)}
                        aria-label={isExpanded ? 'Collapse changelog' : 'Expand changelog'}
                      >
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="admin-version-expanded">
                    {ver.summary && <p className="admin-version-sum">{ver.summary}</p>}
                    {ver.highlights && ver.highlights.length > 0 && (
                      <div className="admin-version-highlights">
                        <strong>Highlights:</strong>
                        <ul>
                          {ver.highlights.map((h, i) => (
                            <li key={i}>{h}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {ver.releaseNotes && (
                      <div className="admin-version-notes">
                        <strong>Release Notes:</strong>
                        <pre>{ver.releaseNotes}</pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Version Modal */}
      <Dialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          editingVersion ? `Edit Release v${editingVersion.version}` : 'Create Release Version'
        }
        description="Register a new software build with semantic versioning and release notes."
      >
        <div className="admin-version-form">
          {modalError && (
            <div className="admin-version-error" role="alert">
              <AlertCircle size={16} aria-hidden="true" />
              <span>{modalError}</span>
            </div>
          )}

          <div className="admin-version-field">
            <label htmlFor="ver-number" className="admin-version-label">
              Version Number (SemVer) <span className="text-danger">*</span>
            </label>
            <Input
              id="ver-number"
              value={formVersion}
              onChange={(e) => setFormVersion(e.target.value)}
              placeholder="e.g. 1.2.0"
              required
            />
          </div>

          <div className="admin-version-field">
            <label htmlFor="ver-title" className="admin-version-label">
              Release Title <span className="text-danger">*</span>
            </label>
            <Input
              id="ver-title"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder="e.g. Performance Update & Dark Mode"
              required
            />
          </div>

          <div className="admin-version-field">
            <label htmlFor="ver-summary" className="admin-version-label">
              Release Summary
            </label>
            <Input
              id="ver-summary"
              value={formSummary}
              onChange={(e) => setFormSummary(e.target.value)}
              placeholder="Brief tagline for changelog summary..."
            />
          </div>

          <div className="admin-version-field">
            <label htmlFor="ver-notes" className="admin-version-label">
              Detailed Release Notes (Markdown)
            </label>
            <textarea
              id="ver-notes"
              className="admin-version-textarea"
              value={formReleaseNotes}
              onChange={(e) => setFormReleaseNotes(e.target.value)}
              placeholder="Detailed changelog and technical notes..."
              rows={5}
            />
          </div>

          {/* Highlights List */}
          <div className="admin-version-field">
            <label className="admin-version-label">Feature Highlights</label>
            <div className="admin-version-add-row">
              <Input
                value={newHighlightInput}
                onChange={(e) => setNewHighlightInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddHighlight();
                  }
                }}
                placeholder="Add highlight and press Enter..."
                aria-label="Add release highlight"
              />
              <Button variant="secondary" size="sm" onClick={handleAddHighlight}>
                Add
              </Button>
            </div>
            {formHighlights.length > 0 && (
              <ul className="admin-version-highlights-list">
                {formHighlights.map((h, i) => (
                  <li key={i}>
                    <span>{h}</span>
                    <button type="button" onClick={() => handleRemoveHighlight(i)}>
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <label className="admin-version-checkbox-row">
            <input
              type="checkbox"
              checked={formIsCurrent}
              onChange={(e) => setFormIsCurrent(e.target.checked)}
            />
            <span>Set as Current Live Version</span>
          </label>

          <div className="admin-version-dialog-actions">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={() => void handleSaveVersion()} isLoading={isSaving}>
              {editingVersion ? 'Save Release' : 'Create Release'}
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Archive Confirmation Dialog */}
      <Dialog
        isOpen={Boolean(archiveTarget)}
        onClose={() => setArchiveTarget(null)}
        title="Archive Release"
        description={`Are you sure you want to archive release v${archiveTarget?.version}? It will remain in historical logs but marked as archived.`}
      >
        <div className="admin-version-dialog-actions">
          <Button variant="secondary" onClick={() => setArchiveTarget(null)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => void handleConfirmArchive()}
            isLoading={isArchiving}
          >
            Archive Release
          </Button>
        </div>
      </Dialog>
    </div>
  );
};
