"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { formatDateTime, type AdminBanner } from "@/lib/view-models";
import { useAppDispatch } from "@/store/hooks";
import { enqueueNotification } from "@/store/slices/notificationsSlice";
import type { ApiResponse } from "@elsesourav/types";
import Image from "next/image";
import { useMemo, useState } from "react";

type BannerPlacement = "NEW" | "COMING_SOON" | "SPECIAL_OFFER" | "EVENT";

type BannerFormState = {
  title: string;
  subtitle: string;
  imageUrl: string;
  linkUrl: string;
  placement: BannerPlacement;
  liveStartsAt: string;
  liveEndsAt: string;
  appStartsAt: string;
  appEndsAt: string;
  isActive: boolean;
};

const bannerPlacementOptions: BannerPlacement[] = [
  "NEW",
  "COMING_SOON",
  "SPECIAL_OFFER",
  "EVENT",
];

const bannerPlacementLabels: Record<BannerPlacement, string> = {
  NEW: "New",
  COMING_SOON: "Coming Soon",
  SPECIAL_OFFER: "Special Offer",
  EVENT: "Event",
};

function getPlacementDateLabel(placement: BannerPlacement): {
  startsLabel: string;
  endsLabel: string;
} {
  switch (placement) {
    case "NEW":
    case "COMING_SOON":
      return { startsLabel: "Launch date", endsLabel: "End date (optional)" };
    case "SPECIAL_OFFER":
    case "EVENT":
    default:
      return { startsLabel: "Starts", endsLabel: "Ends" };
  }
}

function getLiveDateLabel(): { startsLabel: string; endsLabel: string } {
  return { startsLabel: "Visible from", endsLabel: "Visible until" };
}

function toSortedBanners(items: AdminBanner[]) {
  return [...items].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
}

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

function createEmptyBannerForm(): BannerFormState {
  return {
    title: "",
    subtitle: "",
    imageUrl: "",
    linkUrl: "",
    placement: "NEW",
    liveStartsAt: "",
    liveEndsAt: "",
    appStartsAt: "",
    appEndsAt: "",
    isActive: true,
  };
}

function createBannerFormFromItem(item: AdminBanner): BannerFormState {
  return {
    title: item.title,
    subtitle: item.subtitle ?? "",
    imageUrl: item.imageUrl,
    linkUrl: item.linkUrl ?? "",
    placement: item.placement as BannerPlacement,
    liveStartsAt: toDateTimeLocal(item.liveStartsAt),
    liveEndsAt: toDateTimeLocal(item.liveEndsAt),
    appStartsAt: toDateTimeLocal(item.appStartsAt),
    appEndsAt: toDateTimeLocal(item.appEndsAt),
    isActive: item.isActive,
  };
}

function normalizeBannerLinkUrl(value: string): string | null {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  if (trimmed.startsWith("/")) {
    return trimmed;
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return parsed.toString();
    }
  } catch {
    // Fallback below tries adding https:// when protocol is omitted.
  }

  if (/^[a-zA-Z][a-zA-Z\d+.-]*:/.test(trimmed)) {
    return null;
  }

  try {
    const parsedWithHttps = new URL(`https://${trimmed}`);
    return parsedWithHttps.toString();
  } catch {
    return null;
  }
}

function validateBannerForm(form: BannerFormState): string | null {
  if (form.title.trim().length < 3) {
    return "Banner title must contain at least 3 characters.";
  }

  if (!form.liveStartsAt || !form.liveEndsAt) {
    return "Visibility window (visible from/until) is required for all banners.";
  }

  if (
    (form.placement === "NEW" || form.placement === "COMING_SOON") &&
    !form.appStartsAt
  ) {
    return "Launch date is required for New and Coming Soon banners.";
  }

  if (
    (form.placement === "SPECIAL_OFFER" || form.placement === "EVENT") &&
    !form.appStartsAt
  ) {
    return "Start date is required for Special Offer and Event banners.";
  }

  if (
    (form.placement === "SPECIAL_OFFER" || form.placement === "EVENT") &&
    !form.appEndsAt
  ) {
    return "End date is required for Special Offer and Event banners.";
  }

  try {
    new URL(form.imageUrl.trim());
  } catch {
    return "Please provide a valid image URL.";
  }

  if (form.linkUrl.trim() && !normalizeBannerLinkUrl(form.linkUrl)) {
    return "Banner link URL must be a valid URL or internal path (for example /apps).";
  }

  if (form.liveStartsAt && form.liveEndsAt) {
    const liveStartsAt = new Date(form.liveStartsAt);
    const liveEndsAt = new Date(form.liveEndsAt);
    if (liveEndsAt <= liveStartsAt) {
      return "Visible until must be after visible from.";
    }
  }

  if (form.appStartsAt && form.appEndsAt) {
    const appStartsAt = new Date(form.appStartsAt);
    const appEndsAt = new Date(form.appEndsAt);
    if (appEndsAt <= appStartsAt) {
      return "App end date must be after app start date.";
    }
  }

  return null;
}

function BannerVisualPreview({
  title,
  subtitle,
  imageUrl,
  placement,
  linkUrl,
  liveStartsAt,
  liveEndsAt,
  appStartsAt,
  appEndsAt,
}: {
  title: string;
  subtitle: string;
  imageUrl: string;
  placement: BannerPlacement;
  linkUrl: string;
  liveStartsAt: string;
  liveEndsAt: string;
  appStartsAt: string;
  appEndsAt: string;
}) {
  const placementLabel = bannerPlacementLabels[placement];
  const dateLabels = getPlacementDateLabel(placement);
  const liveLabels = getLiveDateLabel();
  const liveStartsLabel = liveStartsAt
    ? formatDateTime(liveStartsAt)
    : "No date";
  const liveEndsLabel = liveEndsAt ? formatDateTime(liveEndsAt) : "No date";
  const appStartsLabel = appStartsAt ? formatDateTime(appStartsAt) : "No date";
  const appEndsLabel = appEndsAt ? formatDateTime(appEndsAt) : "No date";

  return (
    <article className="relative overflow-hidden rounded-xl border border-black/10 bg-[#0f172a]">
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={title || "Banner preview"}
          width={1280}
          height={512}
          className="h-44 w-full object-cover"
          unoptimized
        />
      ) : (
        <div className="h-44 w-full bg-[linear-gradient(120deg,#1f5ed4,#0f172a)]" />
      )}

      <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/75 via-black/35 to-transparent" />

      <div className="absolute inset-x-0 bottom-0 space-y-1 p-3 text-white">
        <span className="inline-flex rounded-full border border-white/30 bg-white/20 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide">
          {placementLabel}
        </span>
        <p className="line-clamp-1 text-sm font-semibold">
          {title.trim() || "Banner title preview"}
        </p>
        {subtitle.trim() ? (
          <p className="line-clamp-1 text-xs text-white/85">{subtitle}</p>
        ) : null}
        <p className="text-[11px] text-white/70">
          {liveLabels.startsLabel}: {liveStartsLabel} · {liveLabels.endsLabel}:{" "}
          {liveEndsLabel}
        </p>
        <p className="text-[11px] text-white/70">
          {dateLabels.startsLabel}: {appStartsLabel}
          {placement === "SPECIAL_OFFER" || placement === "EVENT"
            ? ` · ${dateLabels.endsLabel}: ${appEndsLabel}`
            : ""}
        </p>
        <p className="line-clamp-1 text-xs text-blue-100">
          {linkUrl.trim() || "No link URL"}
        </p>
      </div>
    </article>
  );
}

function BannerCard({
  item,
  onEdit,
  onDisable,
  disabling,
}: {
  item: AdminBanner;
  onEdit: () => void;
  onDisable: () => void;
  disabling: boolean;
}) {
  return (
    <Card className="overflow-hidden p-0">
      <BannerVisualPreview
        title={item.title}
        subtitle={item.subtitle ?? ""}
        imageUrl={item.imageUrl}
        placement={item.placement as BannerPlacement}
        linkUrl={item.linkUrl ?? ""}
        liveStartsAt={item.liveStartsAt ?? ""}
        liveEndsAt={item.liveEndsAt ?? ""}
        appStartsAt={item.appStartsAt ?? ""}
        appEndsAt={item.appEndsAt ?? ""}
      />
      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle>{item.title}</CardTitle>
            <CardDescription className="mt-1 line-clamp-1">
              {item.subtitle ?? item.linkUrl ?? "No banner link"}
            </CardDescription>
          </div>
          <Badge variant={item.isActive ? "success" : "secondary"}>
            {item.isActive ? "Active" : "Disabled"}
          </Badge>
        </div>

        <div className="grid gap-1 text-xs text-[#59637b]">
          <p>
            {getLiveDateLabel().startsLabel}:{" "}
            {formatDateTime(item.liveStartsAt)}
          </p>
          <p>
            {getLiveDateLabel().endsLabel}: {formatDateTime(item.liveEndsAt)}
          </p>
          <p>
            {
              getPlacementDateLabel(item.placement as BannerPlacement)
                .startsLabel
            }
            : {formatDateTime(item.appStartsAt)}
          </p>
          <p>
            {getPlacementDateLabel(item.placement as BannerPlacement).endsLabel}
            : {formatDateTime(item.appEndsAt)}
          </p>
          <p>Updated: {formatDateTime(item.updatedAt)}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" size="sm" onClick={onEdit}>
            Edit banner
          </Button>
          <Button
            variant="destructive"
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

export function AdminBannersClient({
  initialBanners,
}: {
  initialBanners: AdminBanner[];
}) {
  const dispatch = useAppDispatch();
  const [banners, setBanners] = useState(() => toSortedBanners(initialBanners));
  const [createForm, setCreateForm] = useState<BannerFormState>(() =>
    createEmptyBannerForm(),
  );
  const [createError, setCreateError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  const [editingBannerId, setEditingBannerId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<BannerFormState | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);

  const [disablingBannerId, setDisablingBannerId] = useState<string | null>(
    null,
  );
  const [confirmDisableId, setConfirmDisableId] = useState<string | null>(null);

  const activeCount = useMemo(
    () => banners.filter((item) => item.isActive).length,
    [banners],
  );

  const editingBanner =
    editingBannerId !== null
      ? (banners.find((item) => item.id === editingBannerId) ?? null)
      : null;

  async function onCreateBanner(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationError = validateBannerForm(createForm);
    if (validationError) {
      setCreateError(validationError);
      return;
    }

    setCreateError(null);
    setCreating(true);

    try {
      const response = await fetch("/api/admin/store/banners", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          title: createForm.title.trim(),
          subtitle: createForm.subtitle.trim() || null,
          imageUrl: createForm.imageUrl.trim(),
          linkUrl: normalizeBannerLinkUrl(createForm.linkUrl),
          placement: createForm.placement,
          liveStartsAt: toIsoOrUndefined(createForm.liveStartsAt),
          liveEndsAt: toIsoOrUndefined(createForm.liveEndsAt),
          appStartsAt: toIsoOrUndefined(createForm.appStartsAt),
          appEndsAt: toIsoOrUndefined(createForm.appEndsAt),
          isActive: createForm.isActive,
        }),
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok || !isApiSuccess<AdminBanner>(payload)) {
        setCreateError(
          parseApiMessage(payload) ?? "Failed to create banner. Please retry.",
        );
        return;
      }

      setBanners((previous) => toSortedBanners([payload.data, ...previous]));
      setCreateForm(createEmptyBannerForm());
      setCreateOpen(false);
      dispatch(
        enqueueNotification({
          tone: "success",
          message: `Banner \"${payload.data.title}\" created successfully.`,
        }),
      );
    } catch (error) {
      setCreateError(
        error instanceof Error ? error.message : "Failed to create banner.",
      );
    } finally {
      setCreating(false);
    }
  }

  async function onSaveBannerEdits(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!editingBannerId || !editForm) {
      return;
    }

    const validationError = validateBannerForm(editForm);
    if (validationError) {
      setEditError(validationError);
      return;
    }

    setEditError(null);
    setSavingEdit(true);

    try {
      const response = await fetch(
        `/api/admin/store/banners/${editingBannerId}`,
        {
          method: "PATCH",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({
            title: editForm.title.trim(),
            subtitle: editForm.subtitle.trim() || null,
            imageUrl: editForm.imageUrl.trim(),
            linkUrl: normalizeBannerLinkUrl(editForm.linkUrl),
            placement: editForm.placement,
            liveStartsAt: toIsoOrUndefined(editForm.liveStartsAt),
            liveEndsAt: toIsoOrUndefined(editForm.liveEndsAt),
            appStartsAt: toIsoOrUndefined(editForm.appStartsAt),
            appEndsAt: toIsoOrUndefined(editForm.appEndsAt),
            isActive: editForm.isActive,
          }),
        },
      );

      const payload = await response.json().catch(() => null);
      if (!response.ok || !isApiSuccess<AdminBanner>(payload)) {
        setEditError(
          parseApiMessage(payload) ?? "Failed to update banner. Please retry.",
        );
        return;
      }

      setBanners((previous) =>
        toSortedBanners(
          previous.map((item) =>
            item.id === editingBannerId ? payload.data : item,
          ),
        ),
      );
      setEditingBannerId(null);
      setEditForm(null);
      dispatch(
        enqueueNotification({
          tone: "success",
          message: `Banner \"${payload.data.title}\" updated successfully.`,
        }),
      );
    } catch (error) {
      setEditError(
        error instanceof Error ? error.message : "Failed to update banner.",
      );
    } finally {
      setSavingEdit(false);
    }
  }

  async function onConfirmDisableBanner() {
    if (!confirmDisableId) {
      return;
    }

    setDisablingBannerId(confirmDisableId);

    try {
      const response = await fetch(
        `/api/admin/store/banners/${confirmDisableId}`,
        {
          method: "DELETE",
        },
      );
      const payload = await response.json().catch(() => null);

      if (!response.ok || !isApiSuccess<AdminBanner>(payload)) {
        dispatch(
          enqueueNotification({
            tone: "error",
            message:
              parseApiMessage(payload) ?? "Failed to disable banner. Retry.",
          }),
        );
        return;
      }

      setBanners((previous) =>
        toSortedBanners(
          previous.map((item) =>
            item.id === confirmDisableId ? payload.data : item,
          ),
        ),
      );

      dispatch(
        enqueueNotification({
          tone: "success",
          message: `Banner \"${payload.data.title}\" is now disabled.`,
        }),
      );
    } catch (error) {
      dispatch(
        enqueueNotification({
          tone: "error",
          message:
            error instanceof Error
              ? error.message
              : "Failed to disable banner.",
        }),
      );
    } finally {
      setDisablingBannerId(null);
      setConfirmDisableId(null);
    }
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-[#49536a]">
          {banners.length.toLocaleString()} banners,{" "}
          {activeCount.toLocaleString()} active.
        </p>
        <Button variant="default" onClick={() => setCreateOpen(true)}>
          Add banner
        </Button>
      </div>

      {banners.length === 0 ? (
        <Card>
          <CardTitle>No banners yet</CardTitle>
          <CardDescription className="mt-1">
            Create your first banner to control campaign visibility.
          </CardDescription>
        </Card>
      ) : (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {banners.map((item) => (
            <BannerCard
              key={item.id}
              item={item}
              disabling={disablingBannerId === item.id}
              onEdit={() => {
                setEditingBannerId(item.id);
                setEditForm(createBannerFormFromItem(item));
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
        title="Create banner"
        description="Use storefront-like visuals and schedule windows for campaigns."
        width="xl"
      >
        <form className="space-y-4" onSubmit={onCreateBanner}>
          <BannerEditorFields form={createForm} onChange={setCreateForm} />

          <BannerVisualPreview
            title={createForm.title}
            subtitle={createForm.subtitle}
            imageUrl={createForm.imageUrl}
            placement={createForm.placement}
            linkUrl={createForm.linkUrl}
            liveStartsAt={createForm.liveStartsAt}
            liveEndsAt={createForm.liveEndsAt}
            appStartsAt={createForm.appStartsAt}
            appEndsAt={createForm.appEndsAt}
          />

          {createError ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {createError}
            </p>
          ) : null}

          <div className="flex items-center justify-end gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                setCreateOpen(false);
                setCreateError(null);
              }}
              disabled={creating}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={creating}>
              {creating ? "Creating..." : "Create banner"}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={Boolean(editingBannerId && editForm)}
        onClose={() => {
          if (savingEdit) {
            return;
          }

          setEditingBannerId(null);
          setEditForm(null);
          setEditError(null);
        }}
        title={editingBanner ? `Edit ${editingBanner.title}` : "Edit banner"}
        description="Update banner details and preview storefront appearance before saving."
        width="xl"
      >
        {editForm ? (
          <form className="space-y-4" onSubmit={onSaveBannerEdits}>
            <BannerEditorFields form={editForm} onChange={setEditForm} />

            <BannerVisualPreview
              title={editForm.title}
              subtitle={editForm.subtitle}
              imageUrl={editForm.imageUrl}
              placement={editForm.placement}
              linkUrl={editForm.linkUrl}
              liveStartsAt={editForm.liveStartsAt}
              liveEndsAt={editForm.liveEndsAt}
              appStartsAt={editForm.appStartsAt}
              appEndsAt={editForm.appEndsAt}
            />

            {editError ? (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {editError}
              </p>
            ) : null}

            <div className="flex items-center justify-end gap-2">
              <Button
                variant="secondary"
                onClick={() => {
                  setEditingBannerId(null);
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
        title="Disable banner"
        description="This action keeps the banner record but makes it inactive in storefront rotation."
        confirmLabel="Disable banner"
        busy={Boolean(disablingBannerId)}
        onCancel={() => setConfirmDisableId(null)}
        onConfirm={() => void onConfirmDisableBanner()}
      />
    </section>
  );
}

function BannerEditorFields({
  form,
  onChange,
}: {
  form: BannerFormState;
  onChange: (nextState: BannerFormState) => void;
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="space-y-1.5">
        <Label htmlFor="banner-title">Title</Label>
        <Input
          id="banner-title"
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

      <div className="space-y-1.5">
        <Label htmlFor="banner-subtitle">Subtitle</Label>
        <Input
          id="banner-subtitle"
          value={form.subtitle}
          onChange={(event) =>
            onChange({
              ...form,
              subtitle: event.target.value,
            })
          }
          maxLength={160}
          placeholder="Short supporting line"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="banner-placement">Placement</Label>
        <select
          id="banner-placement"
          className="w-full rounded-lg border border-black/20 bg-white px-3 py-2 text-sm text-[#14171f]"
          value={form.placement}
          onChange={(event) =>
            onChange({
              ...form,
              placement: event.target.value as BannerPlacement,
            })
          }
        >
          {bannerPlacementOptions.map((placement) => (
            <option key={placement} value={placement}>
              {bannerPlacementLabels[placement]}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5 lg:col-span-2">
        <Label htmlFor="banner-image-url">Image URL</Label>
        <Input
          id="banner-image-url"
          value={form.imageUrl}
          onChange={(event) =>
            onChange({
              ...form,
              imageUrl: event.target.value,
            })
          }
          placeholder="https://..."
          required
        />
      </div>

      <div className="space-y-1.5 lg:col-span-2">
        <Label htmlFor="banner-link-url">Link URL</Label>
        <Input
          id="banner-link-url"
          value={form.linkUrl}
          onChange={(event) =>
            onChange({
              ...form,
              linkUrl: event.target.value,
            })
          }
          placeholder="https://example.com or /apps"
        />
        <p className="text-xs text-[#59637b]">
          Supports absolute URLs and internal paths that start with /.
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="banner-live-starts-at">
          {getLiveDateLabel().startsLabel}
        </Label>
        <Input
          id="banner-live-starts-at"
          type="datetime-local"
          value={form.liveStartsAt}
          onChange={(event) =>
            onChange({
              ...form,
              liveStartsAt: event.target.value,
            })
          }
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="banner-live-ends-at">
          {getLiveDateLabel().endsLabel}
        </Label>
        <Input
          id="banner-live-ends-at"
          type="datetime-local"
          value={form.liveEndsAt}
          onChange={(event) =>
            onChange({
              ...form,
              liveEndsAt: event.target.value,
            })
          }
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="banner-app-starts-at">
          {getPlacementDateLabel(form.placement).startsLabel}
        </Label>
        <Input
          id="banner-app-starts-at"
          type="datetime-local"
          value={form.appStartsAt}
          onChange={(event) =>
            onChange({
              ...form,
              appStartsAt: event.target.value,
            })
          }
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="banner-app-ends-at">
          {getPlacementDateLabel(form.placement).endsLabel}
        </Label>
        <Input
          id="banner-app-ends-at"
          type="datetime-local"
          value={form.appEndsAt}
          onChange={(event) =>
            onChange({
              ...form,
              appEndsAt: event.target.value,
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
