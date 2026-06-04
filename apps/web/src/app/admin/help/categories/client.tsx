"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { CategoryDndBoard } from "./CategoryDndBoard";

export function AdminHelpCategoriesClient({ initialCategories }: { initialCategories: any[] }) {
  const [categories, setCategories] = useState(initialCategories);
  
  useEffect(() => {
    setCategories(initialCategories);
  }, [initialCategories]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const router = useRouter();

  // Form State
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [parentId, setParentId] = useState("");

  const hasUnsavedChanges = JSON.stringify(categories.map(c => c.id)) !== JSON.stringify(initialCategories.map(c => c.id));

  const saveLayoutMutation = useMutation({
    mutationFn: async () => {
      const payload = categories.map((c, idx) => ({ id: c.id, orderIndex: idx }));
      const res = await fetch(`/api/admin/content/help/categories/reorder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to save layout");
      return res.json();
    },
    onSuccess: () => {
      router.refresh();
    },
    onError: (err) => alert(err.message),
  });

  const openCreate = () => {
    setEditingCategory(null);
    setName("");
    setSlug("");
    setDescription("");

    setParentId("");
    setIsModalOpen(true);
  };

  const openEdit = (cat: any) => {
    setEditingCategory(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description || "");
    setParentId(cat.parentId || "");
    setIsModalOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const url = editingCategory 
        ? `/api/admin/content/help/categories/${editingCategory.id}` 
        : `/api/admin/content/help/categories`;
      const method = editingCategory ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          slug,
          description: description || undefined,
          parentId: parentId || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to save category");
      }
      return res.json();
    },
    onSuccess: (data) => {
      setIsModalOpen(false);
      router.refresh();
      if (editingCategory) {
        setCategories(categories.map(c => c.id === editingCategory.id ? data.data : c));
      } else {
        setCategories([...categories, data.data]);
      }
    },
    onError: (err) => {
      alert(err.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/content/help/categories/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete category");
      return id;
    },
    onSuccess: (id) => {
      setCategories(categories.filter(c => c.id !== id));
      router.refresh();
      setDeletingId(null);
    },
    onError: (err) => {
      alert(err.message);
      setDeletingId(null);
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Categories</h2>
        <div className="flex items-center gap-3">
          {hasUnsavedChanges && (
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => setCategories(initialCategories)} disabled={saveLayoutMutation.isPending}>
                Cancel
              </Button>
              <Button variant="default" onClick={() => saveLayoutMutation.mutate()} disabled={saveLayoutMutation.isPending}>
                {saveLayoutMutation.isPending ? "Saving..." : "Save Layout"}
              </Button>
            </div>
          )}
          <Button onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Create Category
          </Button>
        </div>
      </div>

      <CategoryDndBoard 
        categories={categories}
        onCategoriesChange={setCategories}
        onEditCategory={openEdit}
        onDeleteCategory={setDeletingId}
      />

      <Modal 
        open={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingCategory ? "Edit Category" : "Create Category"}
      >
        <div className="space-y-4 pt-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Getting Started" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Parent Category</label>
            <select 
              value={parentId} 
              onChange={(e) => setParentId(e.target.value)}
              className="w-full rounded-md border border-border-subtle bg-bg-base px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary"
            >
              <option value="">None (Top Level)</option>
              {categories.map((c: any) => (
                <option key={c.id} value={c.id} disabled={editingCategory && c.id === editingCategory.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Slug</label>
            <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="e.g. getting-started" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Description</label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional description" />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
              {saveMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deletingId}
        onCancel={() => setDeletingId(null)}
        onConfirm={() => deletingId && deleteMutation.mutate(deletingId)}
        title="Delete Category"
        description="Are you sure you want to delete this category? This action cannot be undone."
        confirmLabel="Delete"
        confirmTone="danger"
      />
    </div>
  );
}
