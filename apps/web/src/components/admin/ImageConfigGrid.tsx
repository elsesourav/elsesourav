"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { formatDateTime, type AdminImageConfig } from "@/lib/view-models";
import { useAppDispatch } from "@/store/hooks";
import { enqueueNotification } from "@/store/slices/notificationsSlice";
import type { ApiResponse } from "@elsesourav/types";
import { useRef, useState } from "react";
import { Plus, Eye } from "lucide-react";

type ImageFormState = {
  name: string;
  section: string;
  url: string;
  isActive: boolean;
  metadata?: Record<string, any>;
};

function parseApiMessage(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;
  const candidate = payload as { ok?: boolean; error?: { message?: string } };
  if (candidate.ok === false && candidate.error?.message) {
    return candidate.error.message;
  }
  return null;
}

function isApiSuccess<T>(payload: unknown): payload is Extract<ApiResponse<T>, { ok: true }> {
  if (!payload || typeof payload !== "object") return false;
  const candidate = payload as { ok?: boolean; data?: T };
  return candidate.ok === true && "data" in candidate;
}

function toSortedConfigs(items: AdminImageConfig[]) {
  return [...items].sort((a, b) => {
    if (a.isActive !== b.isActive) return a.isActive ? -1 : 1;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });
}

export function ImageConfigGrid({
  title,
  section,
  initialConfigs,
  description,
}: {
  title: string;
  section: string;
  initialConfigs: AdminImageConfig[];
  description?: string;
}) {
  const dispatch = useAppDispatch();
  const [configs, setConfigs] = useState(() => toSortedConfigs(initialConfigs));

  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<ImageFormState>({
    name: "",
    section: section,
    url: "",
    isActive: false,
  });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const [editingConfigId, setEditingConfigId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<ImageFormState | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const [activatingConfigId, setActivatingConfigId] = useState<string | null>(null);

  const [deletingConfigId, setDeletingConfigId] = useState<string | null>(null);

  function applyConfigPatch(updatedItem: AdminImageConfig) {
    setConfigs((previous) =>
      toSortedConfigs(
        previous.map((item) => {
          if (item.id === updatedItem.id) return updatedItem;
          if (updatedItem.isActive && item.section === updatedItem.section) {
            return { ...item, isActive: false };
          }
          return item;
        }),
      ),
    );
  }

  async function onCreateConfig(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!createForm.url.trim()) {
      setCreateError("Image URL is required.");
      return;
    }

    setCreateError(null);
    setCreating(true);

    try {
      const response = await fetch("/api/admin/images/configs", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: createForm.name.trim() || `Uploaded Image`,
          section: createForm.section,
          url: createForm.url.trim(),
          isActive: createForm.isActive,
          metadata: createForm.metadata,
        }),
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok || !isApiSuccess<AdminImageConfig>(payload)) {
        setCreateError(parseApiMessage(payload) ?? "Failed to create image config. Please retry.");
        return;
      }

      setConfigs((previous) => {
        const nextItems = [payload.data, ...previous].map((item) =>
          payload.data.isActive && item.id !== payload.data.id && item.section === payload.data.section
            ? { ...item, isActive: false }
            : item,
        );
        return toSortedConfigs(nextItems);
      });
      setCreateForm({ name: "", section: section, url: "", isActive: false });
      setCreateOpen(false);
      dispatch(enqueueNotification({ tone: "success", message: `Image created successfully.` }));
    } catch (error) {
      setCreateError(error instanceof Error ? error.message : "Failed to create image config.");
    } finally {
      setCreating(false);
    }
  }

  async function onSaveConfigEdits(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingConfigId || !editForm) return;

    setEditError(null);
    setSavingEdit(true);

    try {
      const response = await fetch(`/api/admin/images/configs/${editingConfigId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: editForm.name.trim(),
          section: editForm.section,
          url: editForm.url.trim(),
          isActive: editForm.isActive,
          metadata: editForm.metadata,
        }),
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok || !isApiSuccess<AdminImageConfig>(payload)) {
        setEditError(parseApiMessage(payload) ?? "Failed to update image config.");
        return;
      }

      applyConfigPatch(payload.data);
      setEditingConfigId(null);
      setEditForm(null);
      dispatch(enqueueNotification({ tone: "success", message: `Image updated.` }));
    } catch (error) {
      setEditError(error instanceof Error ? error.message : "Failed to update config.");
    } finally {
      setSavingEdit(false);
    }
  }

  async function onConfirmActivate() {
    if (!activatingConfigId) return;

    try {
      const response = await fetch(`/api/admin/images/configs/${activatingConfigId}/activate`, {
        method: "POST",
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok || !isApiSuccess<AdminImageConfig>(payload)) {
        dispatch(enqueueNotification({ tone: "error", message: parseApiMessage(payload) ?? "Failed to activate image." }));
        return;
      }

      applyConfigPatch(payload.data);
      dispatch(enqueueNotification({ tone: "success", message: `Image activated.` }));
    } catch (error) {
      dispatch(enqueueNotification({ tone: "error", message: error instanceof Error ? error.message : "Failed to activate." }));
    } finally {
      setActivatingConfigId(null);
    }
  }

  async function onConfirmDelete() {
    if (!deletingConfigId) return;

    try {
      const response = await fetch(`/api/admin/images/configs/${deletingConfigId}`, {
        method: "DELETE",
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok || !isApiSuccess<{ deleted: boolean }>(payload)) {
        dispatch(enqueueNotification({ tone: "error", message: parseApiMessage(payload) ?? "Failed to delete image." }));
        return;
      }

      setConfigs((prev) => prev.filter((c) => c.id !== deletingConfigId));
      setEditingConfigId(null);
      setEditForm(null);
      dispatch(enqueueNotification({ tone: "success", message: `Image deleted.` }));
    } catch (error) {
      dispatch(enqueueNotification({ tone: "error", message: error instanceof Error ? error.message : "Failed to delete." }));
    } finally {
      setDeletingConfigId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold tracking-tight text-text-primary">{title}</h3>
          {description && <p className="text-sm text-text-muted mt-1">{description}</p>}
        </div>
        <Button variant="outline" size="sm" onClick={() => setCreateOpen(true)}>
          <Plus className="w-4 h-4 mr-2" /> Add Image
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {configs.map((config) => (
          <ImageConfigCard
            key={config.id}
            item={config}
            onEdit={() => {
              setEditingConfigId(config.id);
              setEditForm({
                name: config.name,
                section: config.section,
                url: config.url,
                isActive: config.isActive,
                metadata: config.metadata || {},
              });
            }}
            onActivate={() => setActivatingConfigId(config.id)}
            activating={activatingConfigId === config.id}
          />
        ))}
        {configs.length === 0 && (
          <div className="col-span-full rounded-2xl border border-dashed p-8 text-center text-sm text-[#5a647d]">
            No images uploaded yet. Click &quot;Add Image&quot; to upload one.
          </div>
        )}
      </div>

      {/* CREATE MODAL */}
      <Modal
        open={createOpen}
        onClose={() => {
          setCreateOpen(false);
          setCreateError(null);
        }}
        width="md"
        title={`Add Image to ${title}`}
      >
        <form onSubmit={onCreateConfig} className="p-4 sm:p-5">
          {createError && (
            <div className="mb-4 rounded bg-red-50 p-3 text-sm font-medium text-red-600">
              {createError}
            </div>
          )}

          <div className="space-y-6">
            <div className="space-y-1.5">
              <Label>Descriptive Name</Label>
              <Input
                value={createForm.name}
                onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                placeholder="e.g. My Profile Photo"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Image URL</Label>
              <div className="flex gap-2">
                <Input
                  type="url"
                  value={createForm.url}
                  onChange={(e) => setCreateForm({ ...createForm, url: e.target.value })}
                  placeholder="https://..."
                  required
                />
                <CloudinaryUploadButton onUpload={(url) => setCreateForm({ ...createForm, url })} />
              </div>
              {createForm.url && (
                <div className="mt-2 h-32 bg-gray-50 border rounded flex items-center justify-center p-2">
                  <img src={createForm.url} className="h-full object-contain" alt="Preview" />
                </div>
              )}
            </div>
            
            {createForm.section === "HELP_SUPPORT" && (
              <>
                <div className="space-y-1.5">
                  <Label>Title (Optional)</Label>
                  <Input
                    value={createForm.metadata?.title || ""}
                    onChange={(e) => setCreateForm({ ...createForm, metadata: { ...createForm.metadata, title: e.target.value } })}
                    placeholder="e.g. How can we help?"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Subtitle (Optional)</Label>
                  <Input
                    value={createForm.metadata?.subtitle || ""}
                    onChange={(e) => setCreateForm({ ...createForm, metadata: { ...createForm.metadata, subtitle: e.target.value } })}
                    placeholder="e.g. Search for articles..."
                  />
                </div>
              </>
            )}

            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={createForm.isActive}
                onChange={(e) => setCreateForm({ ...createForm, isActive: e.target.checked })}
                className="h-4 w-4"
              />
              Mark as active immediately
            </label>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setCreateOpen(false)} disabled={creating}>
              Cancel
            </Button>
            <Button type="submit" disabled={creating} loading={creating}>
              Upload
            </Button>
          </div>
        </form>
      </Modal>

      {/* EDIT MODAL */}
      <Modal
        open={editingConfigId !== null}
        onClose={() => {
          setEditingConfigId(null);
          setEditForm(null);
          setEditError(null);
        }}
        width="md"
        title="Edit Image Details"
      >
        <form onSubmit={onSaveConfigEdits} className="p-4 sm:p-5">
          {editError && (
            <div className="mb-4 rounded bg-red-50 p-3 text-sm font-medium text-red-600">
              {editError}
            </div>
          )}

          {editForm && (
            <div className="space-y-6">
              <div className="space-y-1.5">
                <Label>Descriptive Name</Label>
                <Input
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label>Image URL</Label>
                <div className="flex gap-2">
                  <Input
                    type="url"
                    value={editForm.url}
                    onChange={(e) => setEditForm({ ...editForm, url: e.target.value })}
                    required
                  />
                  <CloudinaryUploadButton onUpload={(url) => setEditForm({ ...editForm, url })} />
                </div>
                {editForm.url && (
                  <div className="mt-2 h-32 bg-gray-50 border rounded flex items-center justify-center p-2">
                    <img src={editForm.url} className="h-full object-contain" alt="Preview" />
                  </div>
                )}
              </div>
              
              {editForm.section === "HELP_SUPPORT" && (
                <>
                  <div className="space-y-1.5">
                    <Label>Title (Optional)</Label>
                    <Input
                      value={editForm.metadata?.title || ""}
                      onChange={(e) => setEditForm({ ...editForm, metadata: { ...editForm.metadata, title: e.target.value } })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Subtitle (Optional)</Label>
                    <Input
                      value={editForm.metadata?.subtitle || ""}
                      onChange={(e) => setEditForm({ ...editForm, metadata: { ...editForm.metadata, subtitle: e.target.value } })}
                    />
                  </div>
                </>
              )}

              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={editForm.isActive}
                  onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                  className="h-4 w-4"
                />
                Mark as active
              </label>
            </div>
          )}

          <div className="mt-6 flex justify-between gap-3">
            <Button 
              type="button" 
              variant="outline" 
              className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
              onClick={() => setDeletingConfigId(editingConfigId)} 
              disabled={savingEdit || (editForm?.isActive ?? false)}
            >
              Delete
            </Button>
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => setEditingConfigId(null)} disabled={savingEdit}>
                Cancel
              </Button>
              <Button type="submit" disabled={savingEdit} loading={savingEdit}>
                Save changes
              </Button>
            </div>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={deletingConfigId !== null}
        title="Delete Image"
        description="Are you sure you want to delete this image? This action cannot be undone."
        confirmLabel="Delete"
        confirmTone="danger"
        onCancel={() => setDeletingConfigId(null)}
        onConfirm={onConfirmDelete}
      />

      <ConfirmDialog
        open={activatingConfigId !== null}
        title="Activate Image"
        description="Are you sure you want to activate this image? It will immediately replace the currently active image for this section on the live site."
        confirmLabel="Activate"
        confirmTone="primary"
        onCancel={() => setActivatingConfigId(null)}
        onConfirm={onConfirmActivate}
      />
    </div>
  );
}

function CloudinaryUploadButton({ onUpload }: { onUpload: (url: string) => void }) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const signatureResponse = await fetch("/api/upload/cloudinary/sign", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ folder: "content/images" }),
      });

      const signaturePayload = await signatureResponse.json();
      if (!signatureResponse.ok || !signaturePayload.ok) throw new Error("Failed to get signature");

      const signData = signaturePayload.data;
      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", signData.apiKey);
      formData.append("timestamp", String(signData.timestamp));
      formData.append("signature", signData.signature);
      formData.append("folder", signData.folder);

      const uploadResponse = await fetch(`https://api.cloudinary.com/v1_1/${signData.cloudName}/auto/upload`, {
        method: "POST",
        body: formData,
      });

      const uploadResult = await uploadResponse.json();
      if (!uploadResponse.ok) throw new Error(uploadResult.error?.message || "Upload failed");

      onUpload(uploadResult.secure_url);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to upload image.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <>
      <Button type="button" variant="secondary" onClick={() => fileInputRef.current?.click()} disabled={uploading} loading={uploading}>
        Upload
      </Button>
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
    </>
  );
}

function ImageConfigCard({
  item,
  onEdit,
  onActivate,
  activating,
}: {
  item: AdminImageConfig;
  onEdit: () => void;
  onActivate: () => void;
  activating: boolean;
}) {
  return (
    <Card className="flex flex-col justify-between overflow-hidden">
      <div 
        className="h-32 w-full bg-gray-100 flex items-center justify-center relative border-b p-2 cursor-pointer group"
        onClick={onEdit}
      >
        <img src={item.url} alt={item.name} className="w-full h-full object-contain" />
        <div className="absolute top-2 right-2">
          <Badge variant={item.isActive ? "success" : "secondary"} className="shadow-sm">
            {item.isActive ? "Active" : "Inactive"}
          </Badge>
        </div>
        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <a 
            href={item.url} 
            target="_blank" 
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="p-1.5 bg-white/90 shadow rounded-md text-gray-700 hover:text-blue-600 hover:bg-white flex items-center justify-center backdrop-blur-sm"
            title="View full image"
          >
            <Eye className="w-4 h-4" />
          </a>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div>
          <CardTitle className="text-base line-clamp-1">{item.name}</CardTitle>
          <CardDescription className="mt-1 text-xs">Updated {formatDateTime(item.updatedAt)}</CardDescription>
        </div>

        <div className="flex items-center gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={onEdit} className="w-full">
            Edit
          </Button>
          <Button
            variant={item.isActive ? "secondary" : "default"}
            size="sm"
            onClick={onActivate}
            disabled={item.isActive || activating}
            loading={activating}
            className="w-full"
          >
            {item.isActive ? "Activated" : "Activate"}
          </Button>
        </div>
      </div>
    </Card>
  );
}
