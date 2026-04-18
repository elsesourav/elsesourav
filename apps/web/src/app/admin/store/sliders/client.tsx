"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { formatDateTime, type AdminSlider } from "@/lib/view-models";
import { useAppDispatch } from "@/store/hooks";
import { enqueueNotification } from "@/store/slices/notificationsSlice";
import type { ApiResponse } from "@elsesourav/types";
import Image from "next/image";
import { useMemo, useState } from "react";

type SliderType = "HERO" | "FEATURED" | "PROMO";

type SliderFormState = {
  title: string;
  description: string;
  type: SliderType;
  imageUrl: string;
  linkUrl: string;
  appId: string;
  orderIndex: string;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
};

type AppOption = {
  id: string;
  title: string;
  slug: string;
  status: string;
};

const sliderTypeOptions: SliderType[] = ["HERO", "FEATURED", "PROMO"];

function parseApiMessage(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const candidate = payload as {
    ok?: boolean;
    error?: {
      message?: string;
    };
  };

  if (candidate.ok === false && candidate.error?.message) {
    return candidate.error.message;
  }

  return null;
}

function isApiSuccess<T>(
  payload: unknown,
): payload is Extract<ApiResponse<T>, { ok: true }> {
  if (!payload || typeof payload !== "object") {
    return false;
  }

  const candidate = payload as {
    ok?: boolean;
    data?: T;
  };

  return candidate.ok === true && "data" in candidate;
}

function toDateTimeLocal(value: string | null): string {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

function toIsoOrUndefined(value: string): string | undefined {
  if (!value) {
    return undefined;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return undefined;
  }

  return date.toISOString();
}

function toSortedSliders(items: AdminSlider[]): AdminSlider[] {
  return [...items].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
}

function createEmptyForm(): SliderFormState {
  return {
    title: "",
    description: "",
    type: "HERO",
    imageUrl: "",
    linkUrl: "",
    appId: "",
    orderIndex: "0",
    startsAt: "",
    endsAt: "",
    isActive: true,
  };
}

function createFormFromItem(item: AdminSlider): SliderFormState {
  return {
    title: item.title,
    description: item.description ?? "",
    type: item.type,
    imageUrl: item.imageUrl ?? "",
    linkUrl: item.linkUrl ?? "",
    appId: item.appId ?? "",
    orderIndex: String(item.orderIndex),
    startsAt: toDateTimeLocal(item.startsAt),
    endsAt: toDateTimeLocal(item.endsAt),
    isActive: item.isActive,
  };
}

function validateForm(form: SliderFormState): string | null {
  if (form.title.trim().length < 3) {
    return "Slider title must contain at least 3 characters.";
  }

  if (form.description.trim().length > 500) {
    return "Description must be 500 characters or fewer.";
  }

  if (form.imageUrl.trim()) {
    try {
      new URL(form.imageUrl.trim());
    } catch {
      return "Please provide a valid image URL.";
    }
  }

  if (form.linkUrl.trim()) {
    try {
      new URL(form.linkUrl.trim());
    } catch {
      return "Slider link URL must be a valid URL.";
    }
  }

  if (!sliderTypeOptions.includes(form.type)) {
    return "Please choose a valid slider type.";
  }

  const orderIndex = Number(form.orderIndex);
  if (!Number.isInteger(orderIndex) || orderIndex < 0) {
    return "Order index must be an integer greater than or equal to 0.";
  }

  if (form.startsAt && form.endsAt) {
    const startsAt = new Date(form.startsAt);
    const endsAt = new Date(form.endsAt);

    if (endsAt <= startsAt) {
      return "End time must be after start time.";
    }
  }

  return null;
}

function SliderVisualPreview({
  title,
  description,
  imageUrl,
  type,
  appLabel,
}: {
  title: string;
  description: string;
  imageUrl: string;
  type: SliderType;
  appLabel: string;
}) {
  return (
    <article className="relative overflow-hidden rounded-[1.35rem] border border-black/10 bg-[#0f172a] text-white">
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={title || "Slider preview"}
          width={1280}
          height={540}
          className="h-48 w-full object-cover"
          unoptimized
        />
      ) : (
        <div className="h-48 w-full bg-[linear-gradient(130deg,#123f8f,#1f5ed4_50%,#8cb1f8)]" />
      )}
      <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/80 via-black/35 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 space-y-1 p-4">
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full border border-white/25 bg-white/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]">
            {type}
          </span>
          {appLabel ? (
            <span className="rounded-full border border-white/25 bg-white/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]">
              {appLabel}
            </span>
          ) : null}
        </div>
        <p className="line-clamp-1 text-sm font-semibold">
          {title || "Slider title preview"}
        </p>
        <p className="line-clamp-2 text-xs text-blue-100">
          {description || "No description provided."}
        </p>
      </div>
    </article>
  );
}

function SliderCard({
  item,
  onEdit,
  onDisable,
  disabling,
}: {
  item: AdminSlider;
  onEdit: () => void;
  onDisable: () => void;
  disabling: boolean;
}) {
  const appLabel = item.app
    ? `${item.app.title} / ${item.app.slug}`
    : "No app link";

  return (
    <Card className="overflow-hidden p-0">
      <SliderVisualPreview
        title={item.title}
        description={item.description ?? ""}
        imageUrl={item.imageUrl ?? ""}
        type={item.type}
        appLabel={appLabel}
      />
      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle>{item.title}</CardTitle>
            <CardDescription className="mt-1 line-clamp-1">
              {appLabel}
            </CardDescription>
          </div>
          <Badge tone={item.isActive ? "success" : "neutral"}>
            {item.isActive ? "Active" : "Disabled"}
          </Badge>
        </div>

        <div className="grid gap-1 text-xs text-[#59637b]">
          <p>Type: {item.type}</p>
          <p>Order: {item.orderIndex}</p>
          <p>Starts: {formatDateTime(item.startsAt)}</p>
          <p>Ends: {formatDateTime(item.endsAt)}</p>
          <p>Updated: {formatDateTime(item.updatedAt)}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button tone="secondary" size="sm" onClick={onEdit}>
            Edit slider
          </Button>
          <Button
            tone="danger"
            size="sm"
            onClick={onDisable}
            disabled={disabling || !item.isActive}
          >
            {disabling ? "Disabling..." : "Disable"}
          </Button>
        </div>
      </div>
    </Card>
  );
}

function SliderEditorFields({
  form,
  onChange,
  appOptions,
}: {
  form: SliderFormState;
  onChange: (nextState: SliderFormState) => void;
  appOptions: AppOption[];
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="space-y-1.5 lg:col-span-2">
        <Label htmlFor="slider-title">Title</Label>
        <Input
          id="slider-title"
          value={form.title}
          onChange={(event) =>
            onChange({
              ...form,
              title: event.target.value,
            })
          }
          maxLength={120}
          required
        />
      </div>

      <div className="space-y-1.5 lg:col-span-2">
        <Label htmlFor="slider-description">Description (optional)</Label>
        <Input
          id="slider-description"
          value={form.description}
          onChange={(event) =>
            onChange({
              ...form,
              description: event.target.value,
            })
          }
          maxLength={500}
          placeholder="Short promotional copy"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="slider-type">Type</Label>
        <select
          id="slider-type"
          className="w-full rounded-lg border border-black/20 bg-white px-3 py-2 text-sm text-[#14171f]"
          value={form.type}
          onChange={(event) =>
            onChange({
              ...form,
              type: event.target.value as SliderType,
            })
          }
        >
          {sliderTypeOptions.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="slider-app">Linked app (optional)</Label>
        <select
          id="slider-app"
          className="w-full rounded-lg border border-black/20 bg-white px-3 py-2 text-sm text-[#14171f]"
          value={form.appId}
          onChange={(event) =>
            onChange({
              ...form,
              appId: event.target.value,
            })
          }
        >
          <option value="">No app link</option>
          {appOptions.map((app) => (
            <option key={app.id} value={app.id}>
              {app.title} (/{app.slug}) · {app.status}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5 lg:col-span-2">
        <Label htmlFor="slider-image-url">Image URL (optional)</Label>
        <Input
          id="slider-image-url"
          value={form.imageUrl}
          onChange={(event) =>
            onChange({
              ...form,
              imageUrl: event.target.value,
            })
          }
          placeholder="https://..."
        />
      </div>

      <div className="space-y-1.5 lg:col-span-2">
        <Label htmlFor="slider-link-url">Link URL (optional)</Label>
        <Input
          id="slider-link-url"
          value={form.linkUrl}
          onChange={(event) =>
            onChange({
              ...form,
              linkUrl: event.target.value,
            })
          }
          placeholder="https://..."
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="slider-order">Order index</Label>
        <Input
          id="slider-order"
          type="number"
          min="0"
          step="1"
          value={form.orderIndex}
          onChange={(event) =>
            onChange({
              ...form,
              orderIndex: event.target.value,
            })
          }
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="slider-starts">Starts at</Label>
        <Input
          id="slider-starts"
          type="datetime-local"
          value={form.startsAt}
          onChange={(event) =>
            onChange({
              ...form,
              startsAt: event.target.value,
            })
          }
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="slider-ends">Ends at</Label>
        <Input
          id="slider-ends"
          type="datetime-local"
          value={form.endsAt}
          onChange={(event) =>
            onChange({
              ...form,
              endsAt: event.target.value,
            })
          }
        />
      </div>

      <label className="inline-flex items-center gap-2 rounded-lg border border-black/10 bg-[#f8fbff] px-3 py-2 text-sm text-[#1a2439] lg:col-span-2">
        <input
          type="checkbox"
          checked={form.isActive}
          onChange={(event) =>
            onChange({
              ...form,
              isActive: event.target.checked,
            })
          }
          className="h-4 w-4"
        />
        Active in storefront
      </label>
    </div>
  );
}

export function AdminSlidersClient({
  initialSliders,
  appOptions,
}: {
  initialSliders: AdminSlider[];
  appOptions: AppOption[];
}) {
  const dispatch = useAppDispatch();
  const [sliders, setSliders] = useState(() => toSortedSliders(initialSliders));
  const [createForm, setCreateForm] = useState<SliderFormState>(() =>
    createEmptyForm(),
  );
  const [createError, setCreateError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  const [editingSliderId, setEditingSliderId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<SliderFormState | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);

  const [disablingSliderId, setDisablingSliderId] = useState<string | null>(
    null,
  );
  const [confirmDisableId, setConfirmDisableId] = useState<string | null>(null);

  const activeCount = useMemo(
    () => sliders.filter((item) => item.isActive).length,
    [sliders],
  );

  const heroCount = useMemo(
    () => sliders.filter((item) => item.type === "HERO").length,
    [sliders],
  );

  const editingSlider =
    editingSliderId !== null
      ? (sliders.find((item) => item.id === editingSliderId) ?? null)
      : null;

  async function onCreateSlider(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationError = validateForm(createForm);
    if (validationError) {
      setCreateError(validationError);
      return;
    }

    setCreateError(null);
    setCreating(true);

    try {
      const response = await fetch("/api/admin/store/sliders", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          title: createForm.title.trim(),
          description: createForm.description.trim() || null,
          type: createForm.type,
          imageUrl: createForm.imageUrl.trim() || null,
          linkUrl: createForm.linkUrl.trim() || null,
          appId: createForm.appId.trim() || null,
          orderIndex: Number(createForm.orderIndex),
          startsAt: toIsoOrUndefined(createForm.startsAt),
          endsAt: toIsoOrUndefined(createForm.endsAt),
          isActive: createForm.isActive,
        }),
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok || !isApiSuccess<AdminSlider>(payload)) {
        setCreateError(
          parseApiMessage(payload) ?? "Failed to create slider. Please retry.",
        );
        return;
      }

      setSliders((previous) => toSortedSliders([payload.data, ...previous]));
      setCreateForm(createEmptyForm());
      setCreateOpen(false);
      dispatch(
        enqueueNotification({
          tone: "success",
          message: `Slider \"${payload.data.title}\" created successfully.`,
        }),
      );
    } catch (error) {
      setCreateError(
        error instanceof Error ? error.message : "Failed to create slider.",
      );
    } finally {
      setCreating(false);
    }
  }

  async function onSaveSliderEdits(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!editingSliderId || !editForm) {
      return;
    }

    const validationError = validateForm(editForm);
    if (validationError) {
      setEditError(validationError);
      return;
    }

    setEditError(null);
    setSavingEdit(true);

    try {
      const response = await fetch(
        `/api/admin/store/sliders/${editingSliderId}`,
        {
          method: "PATCH",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({
            title: editForm.title.trim(),
            description: editForm.description.trim() || null,
            type: editForm.type,
            imageUrl: editForm.imageUrl.trim() || null,
            linkUrl: editForm.linkUrl.trim() || null,
            appId: editForm.appId.trim() || null,
            orderIndex: Number(editForm.orderIndex),
            startsAt: toIsoOrUndefined(editForm.startsAt),
            endsAt: toIsoOrUndefined(editForm.endsAt),
            isActive: editForm.isActive,
          }),
        },
      );

      const payload = await response.json().catch(() => null);
      if (!response.ok || !isApiSuccess<AdminSlider>(payload)) {
        setEditError(
          parseApiMessage(payload) ?? "Failed to update slider. Please retry.",
        );
        return;
      }

      setSliders((previous) =>
        toSortedSliders(
          previous.map((item) =>
            item.id === editingSliderId ? payload.data : item,
          ),
        ),
      );
      setEditingSliderId(null);
      setEditForm(null);
      dispatch(
        enqueueNotification({
          tone: "success",
          message: `Slider \"${payload.data.title}\" updated successfully.`,
        }),
      );
    } catch (error) {
      setEditError(
        error instanceof Error ? error.message : "Failed to update slider.",
      );
    } finally {
      setSavingEdit(false);
    }
  }

  async function onConfirmDisableSlider() {
    if (!confirmDisableId) {
      return;
    }

    setDisablingSliderId(confirmDisableId);

    try {
      const response = await fetch(
        `/api/admin/store/sliders/${confirmDisableId}`,
        {
          method: "DELETE",
        },
      );
      const payload = await response.json().catch(() => null);

      if (!response.ok || !isApiSuccess<AdminSlider>(payload)) {
        dispatch(
          enqueueNotification({
            tone: "error",
            message:
              parseApiMessage(payload) ?? "Failed to disable slider. Retry.",
          }),
        );
        return;
      }

      setSliders((previous) =>
        toSortedSliders(
          previous.map((item) =>
            item.id === confirmDisableId ? payload.data : item,
          ),
        ),
      );

      dispatch(
        enqueueNotification({
          tone: "success",
          message: `Slider \"${payload.data.title}\" is now disabled.`,
        }),
      );
    } catch (error) {
      dispatch(
        enqueueNotification({
          tone: "error",
          message:
            error instanceof Error
              ? error.message
              : "Failed to disable slider.",
        }),
      );
    } finally {
      setDisablingSliderId(null);
      setConfirmDisableId(null);
    }
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-[#49536a]">
          {sliders.length.toLocaleString()} sliders,{" "}
          {activeCount.toLocaleString()} active, {heroCount.toLocaleString()}{" "}
          hero placements.
        </p>
        <Button tone="primary" onClick={() => setCreateOpen(true)}>
          Add slider
        </Button>
      </div>

      {sliders.length === 0 ? (
        <Card>
          <CardTitle>No sliders yet</CardTitle>
          <CardDescription className="mt-1">
            Create your first slider to control homepage hero rotation.
          </CardDescription>
        </Card>
      ) : (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {sliders.map((item) => (
            <SliderCard
              key={item.id}
              item={item}
              disabling={disablingSliderId === item.id}
              onEdit={() => {
                setEditingSliderId(item.id);
                setEditForm(createFormFromItem(item));
                setEditError(null);
              }}
              onDisable={() => setConfirmDisableId(item.id)}
            />
          ))}
        </section>
      )}

      <Modal
        open={createOpen}
        onClose={() => {
          if (creating) {
            return;
          }

          setCreateOpen(false);
          setCreateError(null);
        }}
        title="Create slider"
        description="Use app links, images, and timing windows to control storefront hero placements."
        width="xl"
      >
        <form className="space-y-4" onSubmit={onCreateSlider}>
          <SliderEditorFields
            form={createForm}
            onChange={setCreateForm}
            appOptions={appOptions}
          />

          <SliderVisualPreview
            title={createForm.title}
            description={createForm.description}
            imageUrl={createForm.imageUrl}
            type={createForm.type}
            appLabel={
              appOptions.find((app) => app.id === createForm.appId)?.title ?? ""
            }
          />

          {createError ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {createError}
            </p>
          ) : null}

          <div className="flex items-center justify-end gap-2">
            <Button
              tone="secondary"
              onClick={() => {
                setCreateOpen(false);
                setCreateError(null);
              }}
              disabled={creating}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={creating || appOptions.length === 0}
            >
              {creating ? "Creating..." : "Create slider"}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={Boolean(editingSliderId && editForm)}
        onClose={() => {
          if (savingEdit) {
            return;
          }

          setEditingSliderId(null);
          setEditForm(null);
          setEditError(null);
        }}
        title={editingSlider ? `Edit ${editingSlider.title}` : "Edit slider"}
        description="Update hero copy, app links, and preview placement before saving."
        width="xl"
      >
        {editForm ? (
          <form className="space-y-4" onSubmit={onSaveSliderEdits}>
            <SliderEditorFields
              form={editForm}
              onChange={setEditForm}
              appOptions={appOptions}
            />

            <SliderVisualPreview
              title={editForm.title}
              description={editForm.description}
              imageUrl={editForm.imageUrl}
              type={editForm.type}
              appLabel={
                appOptions.find((app) => app.id === editForm.appId)?.title ?? ""
              }
            />

            {editError ? (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {editError}
              </p>
            ) : null}

            <div className="flex items-center justify-end gap-2">
              <Button
                tone="secondary"
                onClick={() => {
                  setEditingSliderId(null);
                  setEditForm(null);
                  setEditError(null);
                }}
                disabled={savingEdit}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={savingEdit}>
                {savingEdit ? "Saving..." : "Save changes"}
              </Button>
            </div>
          </form>
        ) : null}
      </Modal>

      <ConfirmDialog
        open={Boolean(confirmDisableId)}
        title="Disable slider"
        description="This keeps the slider record but removes it from storefront rotation."
        confirmLabel="Disable slider"
        busy={Boolean(disablingSliderId)}
        onCancel={() => setConfirmDisableId(null)}
        onConfirm={() => void onConfirmDisableSlider()}
      />
    </section>
  );
}
