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

type ImageFormState = {
  name: string;
  section: "HELP_SUPPORT" | "ABOUT_PROFILE";
  url: string;
  isActive: boolean;
};

function parseApiMessage(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }
  const candidate = payload as { ok?: boolean; error?: { message?: string } };
  if (candidate.ok === false && candidate.error?.message) {
    return candidate.error.message;
  }
  return null;
}

function isApiSuccess<T>(
  payload: unknown,
): payload is Extract<ApiResponse<T>, { ok: true }> {
  if (!payload || typeof payload !== "object") return false;
  const candidate = payload as { ok?: boolean; data?: T };
  return candidate.ok === true && "data" in candidate;
}

function toSortedConfigs(items: AdminImageConfig[]) {
  return [...items].sort((a, b) => {
    if (a.isActive !== b.isActive) {
      return a.isActive ? -1 : 1;
    }
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });
}

function createEmptyImageForm(): ImageFormState {
  return {
    name: "",
    section: "HELP_SUPPORT",
    url: "",
    isActive: false,
  };
}

function createImageFormFromItem(item: AdminImageConfig): ImageFormState {
  return {
    name: item.name,
    section: item.section,
    url: item.url,
    isActive: item.isActive,
  };
}

function validateImageForm(form: ImageFormState): string | null {
  if (form.name.trim().length < 2) {
    return "Name must be at least 2 characters.";
  }
  if (!form.url.trim()) {
    return "Image URL is required.";
  }
  return null;
}

export function AdminImageConfigsClient({
  initialConfigs,
}: {
  initialConfigs: AdminImageConfig[];
}) {
  const dispatch = useAppDispatch();
  const [configs, setConfigs] = useState(() => toSortedConfigs(initialConfigs));

  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<ImageFormState>(
    createEmptyImageForm(),
  );
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const [editingConfigId, setEditingConfigId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<ImageFormState | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const [activatingConfigId, setActivatingConfigId] = useState<string | null>(
    null,
  );

  function applyConfigPatch(updatedItem: AdminImageConfig) {
    setConfigs((previous) =>
      toSortedConfigs(
        previous.map((item) => {
          if (item.id === updatedItem.id) {
            return updatedItem;
          }
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

    const validationError = validateImageForm(createForm);
    if (validationError) {
      setCreateError(validationError);
      return;
    }

    setCreateError(null);
    setCreating(true);

    try {
      const response = await fetch("/api/admin/images/configs", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: createForm.name.trim(),
          section: createForm.section,
          url: createForm.url.trim(),
          isActive: createForm.isActive,
        }),
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok || !isApiSuccess<AdminImageConfig>(payload)) {
        setCreateError(
          parseApiMessage(payload) ??
            "Failed to create image config. Please retry.",
        );
        return;
      }

      setConfigs((previous) => {
        const nextItems = [payload.data, ...previous].map((item) =>
          payload.data.isActive &&
          item.id !== payload.data.id &&
          item.section === payload.data.section
            ? { ...item, isActive: false }
            : item,
        );
        return toSortedConfigs(nextItems);
      });
      setCreateForm(createEmptyImageForm());
      setCreateOpen(false);
      dispatch(
        enqueueNotification({
          tone: "success",
          message: `Image Config \"${payload.data.name}\" created successfully.`,
        }),
      );
    } catch (error) {
      setCreateError(
        error instanceof Error
          ? error.message
          : "Failed to create image config.",
      );
    } finally {
      setCreating(false);
    }
  }

  async function onSaveConfigEdits(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingConfigId || !editForm) return;

    const validationError = validateImageForm(editForm);
    if (validationError) {
      setEditError(validationError);
      return;
    }

    setEditError(null);
    setSavingEdit(true);

    try {
      const response = await fetch(
        `/api/admin/images/configs/${editingConfigId}`,
        {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            name: editForm.name.trim(),
            section: editForm.section,
            url: editForm.url.trim(),
            isActive: editForm.isActive,
          }),
        },
      );

      const payload = await response.json().catch(() => null);
      if (!response.ok || !isApiSuccess<AdminImageConfig>(payload)) {
        setEditError(
          parseApiMessage(payload) ?? "Failed to update image config. Retry.",
        );
        return;
      }

      applyConfigPatch(payload.data);
      setEditingConfigId(null);
      setEditForm(null);
      dispatch(
        enqueueNotification({
          tone: "success",
          message: `Image Config \"${payload.data.name}\" updated.`,
        }),
      );
    } catch (error) {
      setEditError(
        error instanceof Error ? error.message : "Failed to update config.",
      );
    } finally {
      setSavingEdit(false);
    }
  }

  async function onConfirmActivate() {
    if (!activatingConfigId) return;

    try {
      const response = await fetch(
        `/api/admin/images/configs/${activatingConfigId}/activate`,
        {
          method: "POST",
        },
      );

      const payload = await response.json().catch(() => null);
      if (!response.ok || !isApiSuccess<AdminImageConfig>(payload)) {
        dispatch(
          enqueueNotification({
            tone: "error",
            message:
              parseApiMessage(payload) ?? "Failed to activate image config.",
          }),
        );
        return;
      }

      applyConfigPatch(payload.data);
      dispatch(
        enqueueNotification({
          tone: "success",
          message: `Image Config \"${payload.data.name}\" is now active.`,
        }),
      );
    } catch (error) {
      dispatch(
        enqueueNotification({
          tone: "error",
          message:
            error instanceof Error ? error.message : "Failed to activate.",
        }),
      );
    } finally {
      setActivatingConfigId(null);
    }
  }

  const helpSupportConfigs = configs.filter(
    (c) => c.section === "HELP_SUPPORT",
  );
  const aboutConfigs = configs.filter((c) => c.section === "ABOUT_PROFILE");

  return (
    <div className="space-y-12">
      <div className="flex justify-end">
        <Button onClick={() => setCreateOpen(true)}>Add Image Config</Button>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-bold tracking-tight text-text-primary">
          Help & Support Images
        </h3>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {helpSupportConfigs.map((config) => (
            <ImageConfigCard
              key={config.id}
              item={config}
              onEdit={() => {
                setEditingConfigId(config.id);
                setEditForm(createImageFormFromItem(config));
              }}
              onActivate={() => setActivatingConfigId(config.id)}
              activating={activatingConfigId === config.id}
            />
          ))}
          {helpSupportConfigs.length === 0 && (
            <div className="col-span-full rounded-2xl border border-dashed p-8 text-center text-sm text-[#5a647d]">
              No images uploaded for Help & Support yet.
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-bold tracking-tight text-text-primary">
          About Profile Images
        </h3>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {aboutConfigs.map((config) => (
            <ImageConfigCard
              key={config.id}
              item={config}
              onEdit={() => {
                setEditingConfigId(config.id);
                setEditForm(createImageFormFromItem(config));
              }}
              onActivate={() => setActivatingConfigId(config.id)}
              activating={activatingConfigId === config.id}
            />
          ))}
          {aboutConfigs.length === 0 && (
            <div className="col-span-full rounded-2xl border border-dashed p-8 text-center text-sm text-[#5a647d]">
              No images uploaded for About Profile yet.
            </div>
          )}
        </div>
      </div>

      {/* CREATE MODAL */}
      <Modal
        open={createOpen}
        onClose={() => {
          setCreateOpen(false);
          setCreateError(null);
        }}
        width="md"
        title="Add Image Config"
      >
        <form onSubmit={onCreateConfig} className="p-4 sm:p-5">
          {createError && (
            <div className="mb-4 rounded bg-red-50 p-3 text-sm font-medium text-red-600">
              {createError}
            </div>
          )}

          <ImageEditorFields form={createForm} onChange={setCreateForm} />

          <div className="mt-6 flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setCreateOpen(false);
                setCreateError(null);
              }}
              disabled={creating}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={creating} loading={creating}>
              Create Config
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
        title="Edit Image Config"
      >
        <form onSubmit={onSaveConfigEdits} className="p-4 sm:p-5">
          {editError && (
            <div className="mb-4 rounded bg-red-50 p-3 text-sm font-medium text-red-600">
              {editError}
            </div>
          )}

          {editForm && (
            <ImageEditorFields form={editForm} onChange={setEditForm} />
          )}

          <div className="mt-6 flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setEditingConfigId(null);
                setEditForm(null);
                setEditError(null);
              }}
              disabled={savingEdit}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={savingEdit} loading={savingEdit}>
              Save changes
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={activatingConfigId !== null}
        title="Activate Image Config"
        description="Are you sure you want to activate this configuration? All users will immediately see the updated image for this section."
        confirmLabel="Activate"
        confirmTone="primary"
        onCancel={() => setActivatingConfigId(null)}
        onConfirm={onConfirmActivate}
      />
    </div>
  );
}

function ImageEditorFields({
  form,
  onChange,
}: {
  form: ImageFormState;
  onChange: (value: ImageFormState) => void;
}) {
  function updateField<Key extends keyof ImageFormState>(
    key: Key,
    value: ImageFormState[Key],
  ) {
    onChange({
      ...form,
      [key]: value,
    });
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <Label htmlFor="image-name">Descriptive Name</Label>
        <Input
          id="image-name"
          value={form.name}
          onChange={(event) => updateField("name", event.target.value)}
          maxLength={120}
          required
          placeholder="e.g. Summer Promotion Background"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="image-section">Section</Label>
        <select
          id="image-section"
          className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          value={form.section}
          onChange={(event) =>
            updateField(
              "section",
              event.target.value as ImageFormState["section"],
            )
          }
        >
          <option value="HELP_SUPPORT">Help & Support</option>
          <option value="ABOUT_PROFILE">About Profile</option>
        </select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="image-url">Image URL</Label>
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <Input
            id="image-url"
            type="url"
            value={form.url}
            onChange={(event) => updateField("url", event.target.value)}
            placeholder="https://..."
            className="flex-1 w-full"
            required
          />
          <CloudinaryUploadButton onUpload={(url) => updateField("url", url)} />
        </div>
        {form.url && (
          <div className="mt-2 rounded border p-2 overflow-hidden bg-gray-50 flex items-center justify-center min-h-25">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={form.url}
              alt="Preview"
              className="max-h-37.5 object-contain"
            />
          </div>
        )}
      </div>

      <label className="inline-flex items-center gap-2 rounded-lg border border-black/10 bg-[#f8fbff] px-3 py-2 text-sm text-[#1a2439]">
        <input
          type="checkbox"
          checked={form.isActive}
          onChange={(event) => updateField("isActive", event.target.checked)}
          className="h-4 w-4"
        />
        Mark as active on save
      </label>
    </div>
  );
}

function CloudinaryUploadButton({
  onUpload,
}: {
  onUpload: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const signatureResponse = await fetch("/api/upload/cloudinary/sign", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ folder: "content/image-configs" }),
      });

      const signaturePayload = await signatureResponse.json();
      if (!signatureResponse.ok || !signaturePayload.ok) {
        throw new Error("Failed to get signature");
      }

      const signData = signaturePayload.data;
      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", signData.apiKey);
      formData.append("timestamp", String(signData.timestamp));
      formData.append("signature", signData.signature);
      formData.append("folder", signData.folder);

      const uploadResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${signData.cloudName}/auto/upload`,
        {
          method: "POST",
          body: formData,
        },
      );

      const uploadResult = await uploadResponse.json();
      if (!uploadResponse.ok) {
        throw new Error(uploadResult.error?.message || "Upload failed");
      }

      onUpload(uploadResult.secure_url);
    } catch (error) {
      console.error("Upload error:", error);
      alert(error instanceof Error ? error.message : "Failed to upload image.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <>
      <Button
        type="button"
        variant="secondary"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        loading={uploading}
        className="w-full sm:w-auto"
      >
        Upload
      </Button>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
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
      {/* Image Preview Area */}
      <div className="h-32 w-full bg-gray-100 flex items-center justify-center relative border-b">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.url}
          alt={item.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 right-2">
          <Badge
            variant={item.isActive ? "success" : "secondary"}
            className="shadow-sm"
          >
            {item.isActive ? "Active" : "Inactive"}
          </Badge>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div>
          <CardTitle className="text-base line-clamp-1">{item.name}</CardTitle>
          <CardDescription className="mt-1 text-xs">
            Updated {formatDateTime(item.updatedAt)}
          </CardDescription>
        </div>

        <div className="flex items-center gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
            className="w-full"
          >
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
