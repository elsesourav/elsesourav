import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Tag as TagIcon,
  Plus,
  Search,
  Edit2,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { Button, Badge, Input, Skeleton, Dialog } from '@/components/ui';
import { classificationService } from '@/services/classification.service';
import { tagRepository } from '@/repositories';
import type { Tag } from '@/types/tag.types';
import { slugify } from '@/utils/slug';
import './AdminTagsPage.css';

export const AdminTagsPage: React.FC = () => {
  const [tags, setTags] = useState<readonly Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formColor, setFormColor] = useState('');
  const [formIsActive, setFormIsActive] = useState(true);
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);

  // Confirmation Modal
  const [deactivateTarget, setDeactivateTarget] = useState<Tag | null>(null);
  const [isDeactivating, setIsDeactivating] = useState(false);

  const fetchTags = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const res = await tagRepository.findMany({
      limit: 100,
      orderBy: 'name',
      orderDirection: 'asc',
    });

    if (res.success) {
      setTags(res.data.items);
    } else {
      setError(res.error.message);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    void fetchTags();
  }, [fetchTags]);

  const handleOpenCreateModal = () => {
    setEditingTag(null);
    setFormName('');
    setFormSlug('');
    setFormDescription('');
    setFormColor('');
    setFormIsActive(true);
    setIsSlugManuallyEdited(false);
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (tag: Tag) => {
    setEditingTag(tag);
    setFormName(tag.name);
    setFormSlug(tag.slug);
    setFormDescription(tag.description || '');
    setFormColor(tag.color || '');
    setFormIsActive(tag.isActive);
    setIsSlugManuallyEdited(true);
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleNameChange = (val: string) => {
    const normalized = val.toLowerCase();
    setFormName(normalized);
    if (!editingTag && !isSlugManuallyEdited) {
      setFormSlug(slugify(normalized));
    }
  };

  const handleSaveTag = async () => {
    const normalizedName = formName.trim().toLowerCase();
    if (!normalizedName) {
      setModalError('Tag name is required.');
      return;
    }

    const cleanSlug = slugify(formSlug.trim() || normalizedName);
    if (!cleanSlug) {
      setModalError('A valid slug is required.');
      return;
    }

    // Duplicate check in existing local list
    const existing = tags.find(
      (t) =>
        t.id !== editingTag?.id &&
        (t.name.toLowerCase() === normalizedName || t.slug.toLowerCase() === cleanSlug)
    );
    if (existing) {
      setModalError(`A tag with name "${normalizedName}" or slug "${cleanSlug}" already exists.`);
      return;
    }

    setIsSaving(true);
    setModalError(null);

    const payload = {
      name: normalizedName,
      slug: cleanSlug,
      description: formDescription.trim() || undefined,
      color: formColor.trim() || undefined,
      isActive: formIsActive,
    };

    if (editingTag) {
      const res = await classificationService.updateTag(editingTag.id, payload);
      if (res.success) {
        setTags((prev) => prev.map((t) => (t.id === editingTag.id ? res.data : t)));
        setIsModalOpen(false);
      } else {
        setModalError(res.error.message);
      }
    } else {
      const res = await classificationService.createTag(payload);
      if (res.success) {
        setTags((prev) => [...prev, res.data]);
        setIsModalOpen(false);
      } else {
        setModalError(res.error.message);
      }
    }

    setIsSaving(false);
  };

  const handleConfirmDeactivate = async () => {
    if (!deactivateTarget) return;

    setIsDeactivating(true);
    const updatedStatus = !deactivateTarget.isActive;

    const res = await classificationService.updateTag(deactivateTarget.id, {
      isActive: updatedStatus,
    });

    setIsDeactivating(false);
    setDeactivateTarget(null);

    if (res.success) {
      setTags((prev) => prev.map((t) => (t.id === deactivateTarget.id ? res.data : t)));
    } else {
      setError(res.error.message);
    }
  };

  // Filtered tags
  const filteredTags = useMemo(() => {
    let result = [...tags];

    if (filterActive === 'active') {
      result = result.filter((t) => t.isActive);
    } else if (filterActive === 'inactive') {
      result = result.filter((t) => !t.isActive);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.slug.toLowerCase().includes(q) ||
          t.description?.toLowerCase().includes(q)
      );
    }

    return result.sort((a, b) => a.name.localeCompare(b.name));
  }, [tags, filterActive, searchQuery]);

  return (
    <div className="admin-tags-page">
      {/* Header */}
      <header className="admin-tags-header">
        <div className="admin-tags-header__title-group">
          <h1 className="admin-tags-header__title">Discovery Tags</h1>
          <p className="admin-tags-header__subtitle">
            Manage discovery keywords, search tags, and platform taxonomy labels.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={handleOpenCreateModal}
          leftIcon={<Plus size={16} />}
        >
          Add Tag
        </Button>
      </header>

      {/* Error Alert */}
      {error && (
        <div className="admin-tags-error" role="alert">
          <AlertCircle size={18} aria-hidden="true" />
          <span>{error}</span>
          <Button variant="secondary" size="sm" onClick={() => void fetchTags()}>
            Retry
          </Button>
        </div>
      )}

      {/* Controls Bar */}
      <div className="admin-tags-controls">
        <div className="admin-tags-search">
          <Input
            type="search"
            placeholder="Search tags by name, slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search size={15} />}
            aria-label="Search tags"
          />
        </div>

        <div className="admin-tags-filter">
          <select
            value={filterActive}
            onChange={(e) => setFilterActive(e.target.value as 'all' | 'active' | 'inactive')}
            className="admin-tags-select"
            aria-label="Filter by active status"
          >
            <option value="all">All Tags ({tags.length})</option>
            <option value="active">Active Only ({tags.filter((t) => t.isActive).length})</option>
            <option value="inactive">
              Inactive Only ({tags.filter((t) => !t.isActive).length})
            </option>
          </select>
        </div>
      </div>

      {/* Tags Table */}
      <div className="admin-tags-table-wrapper" role="region" aria-label="Tags Table">
        {isLoading ? (
          <div className="admin-tags-loading" aria-busy="true">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="admin-tags-skeleton-row">
                <Skeleton variant="text" width="25%" height="20px" />
                <Skeleton variant="text" width="35%" height="16px" />
                <Skeleton variant="rectangular" width="70px" height="24px" />
              </div>
            ))}
          </div>
        ) : filteredTags.length === 0 ? (
          <div className="admin-tags-empty">
            <TagIcon size={40} aria-hidden="true" />
            <h2 className="admin-tags-empty__title">No Tags Found</h2>
            <p className="admin-tags-empty__desc">
              {searchQuery || filterActive !== 'all'
                ? 'No tags match your filter criteria.'
                : 'No discovery tags created yet. Add your first tag.'}
            </p>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleOpenCreateModal}
              leftIcon={<Plus size={15} />}
            >
              Add Tag
            </Button>
          </div>
        ) : (
          <table className="admin-tags-table">
            <thead>
              <tr>
                <th scope="col">Tag & Slug</th>
                <th scope="col">Description</th>
                <th scope="col">Status</th>
                <th scope="col" style={{ textAlign: 'right' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredTags.map((tag) => (
                <tr key={tag.id} className="admin-tags-row">
                  {/* Tag Name & Slug */}
                  <td>
                    <div className="admin-tags-identity">
                      <span className="admin-tags-chip">#{tag.name}</span>
                      <span className="admin-tags-slug">/{tag.slug}</span>
                    </div>
                  </td>

                  {/* Description */}
                  <td>
                    <span className="admin-tags-desc">
                      {tag.description || <span className="text-muted">No description</span>}
                    </span>
                  </td>

                  {/* Status */}
                  <td>
                    <Badge variant={tag.isActive ? 'success' : 'default'} size="sm">
                      {tag.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>

                  {/* Actions */}
                  <td style={{ textAlign: 'right' }}>
                    <div className="admin-tags-actions">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenEditModal(tag)}
                        aria-label={`Edit tag ${tag.name}`}
                        title="Edit Tag"
                        leftIcon={<Edit2 size={14} />}
                      />

                      <Button
                        variant={tag.isActive ? 'ghost' : 'secondary'}
                        size="sm"
                        onClick={() => setDeactivateTarget(tag)}
                        title={tag.isActive ? 'Deactivate Tag' : 'Activate Tag'}
                        aria-label={
                          tag.isActive ? `Deactivate ${tag.name}` : `Activate ${tag.name}`
                        }
                        leftIcon={tag.isActive ? <XCircle size={14} /> : <CheckCircle size={14} />}
                      >
                        {tag.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create / Edit Tag Modal */}
      <Dialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTag ? 'Edit Tag' : 'Add Discovery Tag'}
        description="Configure normalized search labels and platform keywords."
      >
        <div className="admin-tags-form">
          {modalError && (
            <div className="admin-tags-error" role="alert">
              <AlertCircle size={16} aria-hidden="true" />
              <span>{modalError}</span>
            </div>
          )}

          <div className="admin-tags-form-field">
            <label htmlFor="tag-name" className="admin-tags-label">
              Tag Name <span className="text-danger">*</span>
            </label>
            <Input
              id="tag-name"
              value={formName}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. typescript, webassembly"
              required
            />
          </div>

          <div className="admin-tags-form-field">
            <label htmlFor="tag-slug" className="admin-tags-label">
              URL Slug <span className="text-danger">*</span>
            </label>
            <Input
              id="tag-slug"
              value={formSlug}
              onChange={(e) => {
                setIsSlugManuallyEdited(true);
                setFormSlug(slugify(e.target.value));
              }}
              placeholder="e.g. typescript"
              required
            />
          </div>

          <div className="admin-tags-form-field">
            <label htmlFor="tag-desc" className="admin-tags-label">
              Description
            </label>
            <Input
              id="tag-desc"
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="Tag description..."
            />
          </div>

          <label className="admin-tags-checkbox-row">
            <input
              type="checkbox"
              checked={formIsActive}
              onChange={(e) => setFormIsActive(e.target.checked)}
            />
            <span>Active (Used for search suggestions and tag chips)</span>
          </label>

          <div className="admin-tags-dialog-actions">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={() => void handleSaveTag()} isLoading={isSaving}>
              {editingTag ? 'Save Changes' : 'Create Tag'}
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Deactivate Confirmation Modal */}
      <Dialog
        isOpen={Boolean(deactivateTarget)}
        onClose={() => setDeactivateTarget(null)}
        title={deactivateTarget?.isActive ? 'Deactivate Tag' : 'Activate Tag'}
        description={
          deactivateTarget?.isActive
            ? `Are you sure you want to deactivate "#${deactivateTarget?.name}"? The tag will be hidden from search tag clouds and suggestions.`
            : `Activate "#${deactivateTarget?.name}" to restore suggestions.`
        }
      >
        <div className="admin-tags-dialog-actions">
          <Button variant="secondary" onClick={() => setDeactivateTarget(null)}>
            Cancel
          </Button>
          <Button
            variant={deactivateTarget?.isActive ? 'destructive' : 'primary'}
            onClick={() => void handleConfirmDeactivate()}
            isLoading={isDeactivating}
          >
            {deactivateTarget?.isActive ? 'Deactivate Tag' : 'Activate Tag'}
          </Button>
        </div>
      </Dialog>
    </div>
  );
};
