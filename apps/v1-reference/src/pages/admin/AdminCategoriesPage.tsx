import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { FolderTree, Plus, Search, Edit2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Button, Badge, Input, Skeleton, Dialog } from '@/components/ui';
import { classificationService } from '@/services/classification.service';
import { categoryRepository } from '@/repositories';
import type { Category } from '@/types/category.types';
import { slugify } from '@/utils/slug';
import './AdminCategoriesPage.css';

export const AdminCategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<readonly Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formIcon, setFormIcon] = useState('');
  const [formOrderIndex, setFormOrderIndex] = useState(0);
  const [formIsActive, setFormIsActive] = useState(true);
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);

  // Confirmation Modal
  const [deactivateTarget, setDeactivateTarget] = useState<Category | null>(null);
  const [isDeactivating, setIsDeactivating] = useState(false);

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const res = await categoryRepository.findMany({
      limit: 100,
      orderBy: 'orderIndex',
      orderDirection: 'asc',
    });

    if (res.success) {
      setCategories(res.data.items);
    } else {
      setError(res.error.message);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    void fetchCategories();
  }, [fetchCategories]);

  const handleOpenCreateModal = () => {
    setEditingCategory(null);
    setFormName('');
    setFormSlug('');
    setFormDescription('');
    setFormIcon('');
    setFormOrderIndex(categories.length);
    setFormIsActive(true);
    setIsSlugManuallyEdited(false);
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setFormName(cat.name);
    setFormSlug(cat.slug);
    setFormDescription(cat.description || '');
    setFormIcon(cat.icon || '');
    setFormOrderIndex(cat.orderIndex || 0);
    setFormIsActive(cat.isActive);
    setIsSlugManuallyEdited(true);
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleNameChange = (val: string) => {
    setFormName(val);
    if (!editingCategory && !isSlugManuallyEdited) {
      setFormSlug(slugify(val));
    }
  };

  const handleSaveCategory = async () => {
    if (!formName.trim()) {
      setModalError('Category name is required.');
      return;
    }

    const slug = slugify(formSlug.trim() || formName.trim());
    if (!slug) {
      setModalError('A valid slug is required.');
      return;
    }

    setIsSaving(true);
    setModalError(null);

    const payload = {
      name: formName.trim(),
      slug,
      description: formDescription.trim() || undefined,
      icon: formIcon.trim() || undefined,
      orderIndex: Number(formOrderIndex) || 0,
      isActive: formIsActive,
    };

    if (editingCategory) {
      const res = await classificationService.updateCategory(editingCategory.id, payload);
      if (res.success) {
        setCategories((prev) => prev.map((c) => (c.id === editingCategory.id ? res.data : c)));
        setIsModalOpen(false);
      } else {
        setModalError(res.error.message);
      }
    } else {
      const res = await classificationService.createCategory(payload);
      if (res.success) {
        setCategories((prev) => [...prev, res.data]);
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

    const res = await classificationService.updateCategory(deactivateTarget.id, {
      isActive: updatedStatus,
    });

    setIsDeactivating(false);
    setDeactivateTarget(null);

    if (res.success) {
      setCategories((prev) => prev.map((c) => (c.id === deactivateTarget.id ? res.data : c)));
    } else {
      setError(res.error.message);
    }
  };

  // Filtered categories
  const filteredCategories = useMemo(() => {
    let result = [...categories];

    if (filterActive === 'active') {
      result = result.filter((c) => c.isActive);
    } else if (filterActive === 'inactive') {
      result = result.filter((c) => !c.isActive);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.slug.toLowerCase().includes(q) ||
          c.description?.toLowerCase().includes(q)
      );
    }

    return result.sort((a, b) => a.orderIndex - b.orderIndex);
  }, [categories, filterActive, searchQuery]);

  return (
    <div className="admin-categories-page">
      {/* Header */}
      <header className="admin-categories-header">
        <div className="admin-categories-header__title-group">
          <h1 className="admin-categories-header__title">Software Categories</h1>
          <p className="admin-categories-header__subtitle">
            Manage application classification, taxonomy hierarchy, order index, and visibility
            across the store.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={handleOpenCreateModal}
          leftIcon={<Plus size={16} />}
        >
          Add Category
        </Button>
      </header>

      {/* Error Alert */}
      {error && (
        <div className="admin-categories-error" role="alert">
          <AlertCircle size={18} aria-hidden="true" />
          <span>{error}</span>
          <Button variant="secondary" size="sm" onClick={() => void fetchCategories()}>
            Retry
          </Button>
        </div>
      )}

      {/* Controls Bar */}
      <div className="admin-categories-controls">
        <div className="admin-categories-search">
          <Input
            type="search"
            placeholder="Search categories by name, slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search size={15} />}
            aria-label="Search categories"
          />
        </div>

        <div className="admin-categories-filter">
          <select
            value={filterActive}
            onChange={(e) => setFilterActive(e.target.value as 'all' | 'active' | 'inactive')}
            className="admin-categories-select"
            aria-label="Filter by active status"
          >
            <option value="all">All Categories ({categories.length})</option>
            <option value="active">
              Active Only ({categories.filter((c) => c.isActive).length})
            </option>
            <option value="inactive">
              Inactive Only ({categories.filter((c) => !c.isActive).length})
            </option>
          </select>
        </div>
      </div>

      {/* Categories Table */}
      <div className="admin-categories-table-wrapper" role="region" aria-label="Categories Table">
        {isLoading ? (
          <div className="admin-categories-loading" aria-busy="true">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="admin-categories-skeleton-row">
                <Skeleton variant="text" width="20px" height="20px" />
                <Skeleton variant="text" width="30%" height="20px" />
                <Skeleton variant="text" width="20%" height="16px" />
                <Skeleton variant="rectangular" width="80px" height="24px" />
              </div>
            ))}
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="admin-categories-empty">
            <FolderTree size={40} aria-hidden="true" />
            <h2 className="admin-categories-empty__title">No Categories Found</h2>
            <p className="admin-categories-empty__desc">
              {searchQuery || filterActive !== 'all'
                ? 'No categories match your filter criteria.'
                : 'No software categories configured yet. Add your first category.'}
            </p>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleOpenCreateModal}
              leftIcon={<Plus size={15} />}
            >
              Add Category
            </Button>
          </div>
        ) : (
          <table className="admin-categories-table">
            <thead>
              <tr>
                <th scope="col" style={{ width: '60px' }}>
                  Order
                </th>
                <th scope="col">Name & Slug</th>
                <th scope="col">Description</th>
                <th scope="col">Status</th>
                <th scope="col" style={{ textAlign: 'right' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredCategories.map((cat) => (
                <tr key={cat.id} className="admin-categories-row">
                  {/* Order Index */}
                  <td>
                    <Badge variant="mono" size="sm">
                      #{cat.orderIndex}
                    </Badge>
                  </td>

                  {/* Name & Slug */}
                  <td>
                    <div className="admin-categories-identity">
                      <span className="admin-categories-name">{cat.name}</span>
                      <span className="admin-categories-slug">/{cat.slug}</span>
                    </div>
                  </td>

                  {/* Description */}
                  <td>
                    <span className="admin-categories-desc">
                      {cat.description || <span className="text-muted">No description</span>}
                    </span>
                  </td>

                  {/* Status */}
                  <td>
                    <Badge variant={cat.isActive ? 'success' : 'default'} size="sm">
                      {cat.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>

                  {/* Actions */}
                  <td style={{ textAlign: 'right' }}>
                    <div className="admin-categories-actions">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenEditModal(cat)}
                        aria-label={`Edit ${cat.name}`}
                        title="Edit Category"
                        leftIcon={<Edit2 size={14} />}
                      />

                      <Button
                        variant={cat.isActive ? 'ghost' : 'secondary'}
                        size="sm"
                        onClick={() => setDeactivateTarget(cat)}
                        title={cat.isActive ? 'Deactivate Category' : 'Activate Category'}
                        aria-label={
                          cat.isActive ? `Deactivate ${cat.name}` : `Activate ${cat.name}`
                        }
                        leftIcon={cat.isActive ? <XCircle size={14} /> : <CheckCircle size={14} />}
                      >
                        {cat.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create / Edit Category Modal */}
      <Dialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? 'Edit Category' : 'Add Category'}
        description="Configure taxonomy classification and catalog ordering."
      >
        <div className="admin-categories-form">
          {modalError && (
            <div className="admin-categories-error" role="alert">
              <AlertCircle size={16} aria-hidden="true" />
              <span>{modalError}</span>
            </div>
          )}

          <div className="admin-categories-form-field">
            <label htmlFor="cat-name" className="admin-categories-label">
              Category Name <span className="text-danger">*</span>
            </label>
            <Input
              id="cat-name"
              value={formName}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. Developer Tools"
              required
            />
          </div>

          <div className="admin-categories-form-field">
            <label htmlFor="cat-slug" className="admin-categories-label">
              URL Slug <span className="text-danger">*</span>
            </label>
            <Input
              id="cat-slug"
              value={formSlug}
              onChange={(e) => {
                setIsSlugManuallyEdited(true);
                setFormSlug(slugify(e.target.value));
              }}
              placeholder="e.g. developer-tools"
              required
            />
            <span className="admin-categories-hint">
              Public URL: /categories/{formSlug || 'slug'}
            </span>
          </div>

          <div className="admin-categories-form-field">
            <label htmlFor="cat-desc" className="admin-categories-label">
              Description
            </label>
            <Input
              id="cat-desc"
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="Brief description for category listings..."
            />
          </div>

          <div className="admin-categories-form-field">
            <label htmlFor="cat-order" className="admin-categories-label">
              Display Order Index
            </label>
            <Input
              id="cat-order"
              type="number"
              value={formOrderIndex}
              onChange={(e) => setFormOrderIndex(Number(e.target.value))}
            />
          </div>

          <label className="admin-categories-checkbox-row">
            <input
              type="checkbox"
              checked={formIsActive}
              onChange={(e) => setFormIsActive(e.target.checked)}
            />
            <span>Active (Visible on public store and navigation)</span>
          </label>

          <div className="admin-categories-dialog-actions">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => void handleSaveCategory()}
              isLoading={isSaving}
            >
              {editingCategory ? 'Save Changes' : 'Create Category'}
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Deactivate Confirmation Modal */}
      <Dialog
        isOpen={Boolean(deactivateTarget)}
        onClose={() => setDeactivateTarget(null)}
        title={deactivateTarget?.isActive ? 'Deactivate Category' : 'Activate Category'}
        description={
          deactivateTarget?.isActive
            ? `Are you sure you want to deactivate "${deactivateTarget?.name}"? The category will be hidden from public catalog navigation, but existing apps assigned to this category will not be broken.`
            : `Activate "${deactivateTarget?.name}" to restore visibility in public catalog navigation.`
        }
      >
        <div className="admin-categories-dialog-actions">
          <Button variant="secondary" onClick={() => setDeactivateTarget(null)}>
            Cancel
          </Button>
          <Button
            variant={deactivateTarget?.isActive ? 'destructive' : 'primary'}
            onClick={() => void handleConfirmDeactivate()}
            isLoading={isDeactivating}
          >
            {deactivateTarget?.isActive ? 'Deactivate Category' : 'Activate Category'}
          </Button>
        </div>
      </Dialog>
    </div>
  );
};
