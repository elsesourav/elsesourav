"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { formatDateTime, type AdminThemeConfig } from "@/lib/view-models";
import { useAppDispatch } from "@/store/hooks";
import { enqueueNotification } from "@/store/slices/notificationsSlice";
import type { ApiResponse } from "@elsesourav/types";
import { useMemo, useState } from "react";

type ThemeFormState = {
  name: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  foregroundColor: string;
  darkPrimaryColor: string;
  darkSecondaryColor: string;
  darkAccentColor: string;
  darkBackgroundColor: string;
  darkForegroundColor: string;
  fontSans: string;
  fontHeading: string;
  headingScale: string;
  isActive: boolean;
};

const HEX_COLOR_REGEX = /^#(?:[0-9a-fA-F]{3}){1,2}$/;

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

function toSortedConfigs(items: AdminThemeConfig[]) {
  return [...items].sort((a, b) => {
    if (a.isActive !== b.isActive) {
      return a.isActive ? -1 : 1;
    }

    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });
}

function createEmptyThemeForm(): ThemeFormState {
  return {
    name: "",
    primaryColor: "#1f2937",
    secondaryColor: "#0f172a",
    accentColor: "#f59e0b",
    backgroundColor: "#f8fafc",
    foregroundColor: "#111827",
    darkPrimaryColor: "#e2e8f0",
    darkSecondaryColor: "#334155",
    darkAccentColor: "#38bdf8",
    darkBackgroundColor: "#0b1220",
    darkForegroundColor: "#f8fafc",
    fontSans: "Inter",
    fontHeading: "Manrope",
    headingScale: "1",
    isActive: false,
  };
}

function createThemeFormFromItem(item: AdminThemeConfig): ThemeFormState {
  return {
    name: item.name,
    primaryColor: item.primaryColor,
    secondaryColor: item.secondaryColor,
    accentColor: item.accentColor,
    backgroundColor: item.backgroundColor,
    foregroundColor: item.foregroundColor,
    darkPrimaryColor: item.darkPrimaryColor,
    darkSecondaryColor: item.darkSecondaryColor,
    darkAccentColor: item.darkAccentColor,
    darkBackgroundColor: item.darkBackgroundColor,
    darkForegroundColor: item.darkForegroundColor,
    fontSans: item.fontSans,
    fontHeading: item.fontHeading,
    headingScale: item.headingScale,
    isActive: item.isActive,
  };
}

function normalizeHexColor(value: string): string {
  const candidate = value.trim();
  return candidate;
}

function validateThemeForm(form: ThemeFormState): string | null {
  if (form.name.trim().length < 2) {
    return "Theme name must contain at least 2 characters.";
  }

  if (form.fontSans.trim().length < 2 || form.fontHeading.trim().length < 2) {
    return "Both font fields must contain at least 2 characters.";
  }

  const colors = [
    form.primaryColor,
    form.secondaryColor,
    form.accentColor,
    form.backgroundColor,
    form.foregroundColor,
    form.darkPrimaryColor,
    form.darkSecondaryColor,
    form.darkAccentColor,
    form.darkBackgroundColor,
    form.darkForegroundColor,
  ];

  if (colors.some((color) => !HEX_COLOR_REGEX.test(color.trim()))) {
    return "All colors must be valid hex values like #1f2937.";
  }

  const headingScale = Number(form.headingScale);
  if (
    !Number.isFinite(headingScale) ||
    headingScale < 0.8 ||
    headingScale > 1.6
  ) {
    return "Heading scale must be between 0.8 and 1.6.";
  }

  return null;
}

function ThemePreview({
  form,
}: {
  form: Pick<
    ThemeFormState,
    | "name"
    | "primaryColor"
    | "secondaryColor"
    | "accentColor"
    | "backgroundColor"
    | "foregroundColor"
    | "darkPrimaryColor"
    | "darkSecondaryColor"
    | "darkAccentColor"
    | "darkBackgroundColor"
    | "darkForegroundColor"
    | "fontSans"
    | "fontHeading"
    | "headingScale"
  >;
}) {
  const previewHeadingScale =
    (Number.isFinite(Number(form.headingScale))
      ? Number(form.headingScale)
      : 1) * 1.1;

  return (
    <section className="grid gap-3 lg:grid-cols-2">
      <article
        className="rounded-xl border border-black/10 p-4"
        style={{
          backgroundColor: normalizeHexColor(form.backgroundColor),
          color: normalizeHexColor(form.foregroundColor),
        }}
      >
        <p
          className="text-xs uppercase tracking-wide"
          style={{ color: form.secondaryColor }}
        >
          Light Preview
        </p>
        <h3
          className="mt-2 font-semibold"
          style={{
            color: normalizeHexColor(form.primaryColor),
            fontFamily: form.fontHeading,
            fontSize: `${previewHeadingScale}rem`,
          }}
        >
          {form.name.trim() || "Theme name"}
        </h3>
        <p
          className="mt-2 text-sm"
          style={{
            fontFamily: form.fontSans,
          }}
        >
          Typography, contrast, and CTA tone for light surfaces.
        </p>
        <button
          type="button"
          className="mt-3 rounded-full px-3 py-1.5 text-xs font-semibold"
          style={{
            backgroundColor: normalizeHexColor(form.accentColor),
            color: normalizeHexColor(form.backgroundColor),
          }}
        >
          Accent action
        </button>
      </article>

      <article
        className="rounded-xl border border-black/10 p-4"
        style={{
          backgroundColor: normalizeHexColor(form.darkBackgroundColor),
          color: normalizeHexColor(form.darkForegroundColor),
        }}
      >
        <p
          className="text-xs uppercase tracking-wide"
          style={{ color: form.darkSecondaryColor }}
        >
          Dark Preview
        </p>
        <h3
          className="mt-2 font-semibold"
          style={{
            color: normalizeHexColor(form.darkPrimaryColor),
            fontFamily: form.fontHeading,
            fontSize: `${previewHeadingScale}rem`,
          }}
        >
          {form.name.trim() || "Theme name"}
        </h3>
        <p
          className="mt-2 text-sm"
          style={{
            fontFamily: form.fontSans,
          }}
        >
          Typography, contrast, and CTA tone for dark surfaces.
        </p>
        <button
          type="button"
          className="mt-3 rounded-full px-3 py-1.5 text-xs font-semibold"
          style={{
            backgroundColor: normalizeHexColor(form.darkAccentColor),
            color: normalizeHexColor(form.darkBackgroundColor),
          }}
        >
          Accent action
        </button>
      </article>
    </section>
  );
}

function ThemeConfigCard({
  item,
  onEdit,
  onActivate,
  activating,
}: {
  item: AdminThemeConfig;
  onEdit: () => void;
  onActivate: () => void;
  activating: boolean;
}) {
  return (
    <Card className="flex min-h-92 flex-col justify-between space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <CardTitle>{item.name}</CardTitle>
          <CardDescription className="mt-1">
            Updated {formatDateTime(item.updatedAt)}
          </CardDescription>
        </div>
        <Badge tone={item.isActive ? "success" : "neutral"}>
          {item.isActive ? "Active" : "Inactive"}
        </Badge>
      </div>

      <div className="space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#5b6580]">
          Light palette
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          <ColorChip label="Primary" color={item.primaryColor} />
          <ColorChip label="Secondary" color={item.secondaryColor} />
          <ColorChip label="Accent" color={item.accentColor} />
          <ColorChip label="Background" color={item.backgroundColor} />
          <ColorChip label="Foreground" color={item.foregroundColor} />
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#5b6580]">
          Dark palette
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          <ColorChip label="Primary" color={item.darkPrimaryColor} />
          <ColorChip label="Secondary" color={item.darkSecondaryColor} />
          <ColorChip label="Accent" color={item.darkAccentColor} />
          <ColorChip label="Background" color={item.darkBackgroundColor} />
          <ColorChip label="Foreground" color={item.darkForegroundColor} />
        </div>
      </div>

      <div className="grid gap-1 text-xs text-[#5a647d]">
        <p>Sans: {item.fontSans}</p>
        <p>Heading: {item.fontHeading}</p>
        <p>Heading scale: {item.headingScale}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button tone="secondary" size="sm" onClick={onEdit}>
          Edit config
        </Button>
        <Button
          tone="primary"
          size="sm"
          onClick={onActivate}
          disabled={item.isActive || activating}
        >
          {activating ? "Activating..." : item.isActive ? "Active" : "Activate"}
        </Button>
      </div>
    </Card>
  );
}

function ColorChip({ label, color }: { label: string; color: string }) {
  return (
    <div className="rounded-lg border border-black/10 bg-white p-2">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-[#5b6580]">
        {label}
      </p>
      <div className="mt-1 flex items-center gap-2 text-xs text-[#1a253a]">
        <span
          className="h-4 w-4 rounded-full border border-black/20"
          style={{ backgroundColor: color }}
        />
        {color}
      </div>
    </div>
  );
}

export function AdminThemeConfigsClient({
  initialConfigs,
}: {
  initialConfigs: AdminThemeConfig[];
}) {
  const dispatch = useAppDispatch();
  const [configs, setConfigs] = useState(() => toSortedConfigs(initialConfigs));

  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<ThemeFormState>(() =>
    createEmptyThemeForm(),
  );
  const [createError, setCreateError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const [editingConfigId, setEditingConfigId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<ThemeFormState | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);

  const [activatingConfigId, setActivatingConfigId] = useState<string | null>(
    null,
  );
  const [confirmActivateId, setConfirmActivateId] = useState<string | null>(
    null,
  );

  const activeCount = useMemo(
    () => configs.filter((item) => item.isActive).length,
    [configs],
  );

  const editingConfig =
    editingConfigId !== null
      ? (configs.find((item) => item.id === editingConfigId) ?? null)
      : null;

  function applyConfigPatch(updated: AdminThemeConfig) {
    setConfigs((previous) =>
      toSortedConfigs(
        previous.map((item) => {
          if (item.id !== updated.id) {
            return updated.isActive ? { ...item, isActive: false } : item;
          }

          return updated;
        }),
      ),
    );
  }

  async function onCreateConfig(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationError = validateThemeForm(createForm);
    if (validationError) {
      setCreateError(validationError);
      return;
    }

    setCreateError(null);
    setCreating(true);

    try {
      const response = await fetch("/api/admin/theme/configs", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          ...createForm,
          name: createForm.name.trim(),
          primaryColor: normalizeHexColor(createForm.primaryColor),
          secondaryColor: normalizeHexColor(createForm.secondaryColor),
          accentColor: normalizeHexColor(createForm.accentColor),
          backgroundColor: normalizeHexColor(createForm.backgroundColor),
          foregroundColor: normalizeHexColor(createForm.foregroundColor),
          darkPrimaryColor: normalizeHexColor(createForm.darkPrimaryColor),
          darkSecondaryColor: normalizeHexColor(createForm.darkSecondaryColor),
          darkAccentColor: normalizeHexColor(createForm.darkAccentColor),
          darkBackgroundColor: normalizeHexColor(
            createForm.darkBackgroundColor,
          ),
          darkForegroundColor: normalizeHexColor(
            createForm.darkForegroundColor,
          ),
          fontSans: createForm.fontSans.trim(),
          fontHeading: createForm.fontHeading.trim(),
          headingScale: Number(createForm.headingScale),
        }),
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok || !isApiSuccess<AdminThemeConfig>(payload)) {
        setCreateError(
          parseApiMessage(payload) ??
            "Failed to create theme config. Please retry.",
        );
        return;
      }

      setConfigs((previous) => {
        const nextItems = [payload.data, ...previous].map((item) =>
          payload.data.isActive && item.id !== payload.data.id
            ? { ...item, isActive: false }
            : item,
        );

        return toSortedConfigs(nextItems);
      });
      setCreateForm(createEmptyThemeForm());
      setCreateOpen(false);
      dispatch(
        enqueueNotification({
          tone: "success",
          message: `Theme \"${payload.data.name}\" created successfully.`,
        }),
      );
    } catch (error) {
      setCreateError(
        error instanceof Error
          ? error.message
          : "Failed to create theme config.",
      );
    } finally {
      setCreating(false);
    }
  }

  async function onSaveConfigEdits(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!editingConfigId || !editForm) {
      return;
    }

    const validationError = validateThemeForm(editForm);
    if (validationError) {
      setEditError(validationError);
      return;
    }

    setEditError(null);
    setSavingEdit(true);

    try {
      const response = await fetch(
        `/api/admin/theme/configs/${editingConfigId}`,
        {
          method: "PATCH",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({
            ...editForm,
            name: editForm.name.trim(),
            primaryColor: normalizeHexColor(editForm.primaryColor),
            secondaryColor: normalizeHexColor(editForm.secondaryColor),
            accentColor: normalizeHexColor(editForm.accentColor),
            backgroundColor: normalizeHexColor(editForm.backgroundColor),
            foregroundColor: normalizeHexColor(editForm.foregroundColor),
            darkPrimaryColor: normalizeHexColor(editForm.darkPrimaryColor),
            darkSecondaryColor: normalizeHexColor(editForm.darkSecondaryColor),
            darkAccentColor: normalizeHexColor(editForm.darkAccentColor),
            darkBackgroundColor: normalizeHexColor(
              editForm.darkBackgroundColor,
            ),
            darkForegroundColor: normalizeHexColor(
              editForm.darkForegroundColor,
            ),
            fontSans: editForm.fontSans.trim(),
            fontHeading: editForm.fontHeading.trim(),
            headingScale: Number(editForm.headingScale),
          }),
        },
      );

      const payload = await response.json().catch(() => null);
      if (!response.ok || !isApiSuccess<AdminThemeConfig>(payload)) {
        setEditError(
          parseApiMessage(payload) ?? "Failed to update theme config. Retry.",
        );
        return;
      }

      applyConfigPatch(payload.data);
      setEditingConfigId(null);
      setEditForm(null);
      dispatch(
        enqueueNotification({
          tone: "success",
          message: `Theme \"${payload.data.name}\" updated.`,
        }),
      );
    } catch (error) {
      setEditError(
        error instanceof Error
          ? error.message
          : "Failed to update theme config.",
      );
    } finally {
      setSavingEdit(false);
    }
  }

  async function onConfirmActivate() {
    if (!confirmActivateId) {
      return;
    }

    setActivatingConfigId(confirmActivateId);

    try {
      const response = await fetch(
        `/api/admin/theme/configs/${confirmActivateId}/activate`,
        {
          method: "POST",
        },
      );

      const payload = await response.json().catch(() => null);
      if (!response.ok || !isApiSuccess<AdminThemeConfig>(payload)) {
        dispatch(
          enqueueNotification({
            tone: "error",
            message: parseApiMessage(payload) ?? "Failed to activate theme.",
          }),
        );
        return;
      }

      applyConfigPatch({ ...payload.data, isActive: true });
      dispatch(
        enqueueNotification({
          tone: "success",
          message: `Theme \"${payload.data.name}\" is now active.`,
        }),
      );
    } catch (error) {
      dispatch(
        enqueueNotification({
          tone: "error",
          message:
            error instanceof Error
              ? error.message
              : "Failed to activate theme.",
        }),
      );
    } finally {
      setActivatingConfigId(null);
      setConfirmActivateId(null);
    }
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-[#49536a]">
          {configs.length.toLocaleString()} configs,{" "}
          {activeCount.toLocaleString()} active.
        </p>
        <Button tone="primary" onClick={() => setCreateOpen(true)}>
          Add theme config
        </Button>
      </div>

      {configs.length === 0 ? (
        <Card>
          <CardTitle>No theme configs yet</CardTitle>
          <CardDescription className="mt-1">
            Create a theme to control colors and typography for the entire
            platform.
          </CardDescription>
        </Card>
      ) : (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {configs.map((item) => (
            <ThemeConfigCard
              key={item.id}
              item={item}
              activating={activatingConfigId === item.id}
              onEdit={() => {
                setEditingConfigId(item.id);
                setEditForm(createThemeFormFromItem(item));
                setEditError(null);
              }}
              onActivate={() => setConfirmActivateId(item.id)}
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
        title="Create theme config"
        description="Define color tokens, typography, and activation state."
        width="xl"
      >
        <form className="space-y-4" onSubmit={onCreateConfig}>
          <ThemeEditorFields form={createForm} onChange={setCreateForm} />
          <ThemePreview form={createForm} />

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
            <Button type="submit" disabled={creating}>
              {creating ? "Creating..." : "Create config"}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={Boolean(editingConfigId && editForm)}
        onClose={() => {
          if (savingEdit) {
            return;
          }

          setEditingConfigId(null);
          setEditForm(null);
          setEditError(null);
        }}
        title={
          editingConfig ? `Edit ${editingConfig.name}` : "Edit theme config"
        }
        description="Tune style tokens and review a live preview before saving."
        width="xl"
      >
        {editForm ? (
          <form className="space-y-4" onSubmit={onSaveConfigEdits}>
            <ThemeEditorFields form={editForm} onChange={setEditForm} />
            <ThemePreview form={editForm} />

            {editError ? (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {editError}
              </p>
            ) : null}

            <div className="flex items-center justify-end gap-2">
              <Button
                tone="secondary"
                onClick={() => {
                  setEditingConfigId(null);
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
        open={Boolean(confirmActivateId)}
        title="Activate theme"
        description="Activating this config will make it the global active theme and deactivate other configs."
        confirmLabel="Activate"
        confirmTone="primary"
        busy={Boolean(activatingConfigId)}
        onCancel={() => setConfirmActivateId(null)}
        onConfirm={() => void onConfirmActivate()}
      />
    </section>
  );
}

function ThemeEditorFields({
  form,
  onChange,
}: {
  form: ThemeFormState;
  onChange: (nextState: ThemeFormState) => void;
}) {
  function updateField<Key extends keyof ThemeFormState>(
    key: Key,
    value: ThemeFormState[Key],
  ) {
    onChange({
      ...form,
      [key]: value,
    });
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="space-y-1.5 lg:col-span-2">
        <Label htmlFor="theme-name">Name</Label>
        <Input
          id="theme-name"
          value={form.name}
          onChange={(event) => updateField("name", event.target.value)}
          maxLength={120}
          required
        />
      </div>

      <div className="space-y-1.5 lg:col-span-2">
        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#5a647d]">
          Light palette
        </p>
      </div>

      <ColorField
        id="theme-primary"
        label="Primary color"
        value={form.primaryColor}
        onChange={(value) => updateField("primaryColor", value)}
      />
      <ColorField
        id="theme-secondary"
        label="Secondary color"
        value={form.secondaryColor}
        onChange={(value) => updateField("secondaryColor", value)}
      />
      <ColorField
        id="theme-accent"
        label="Accent color"
        value={form.accentColor}
        onChange={(value) => updateField("accentColor", value)}
      />
      <ColorField
        id="theme-background"
        label="Background color"
        value={form.backgroundColor}
        onChange={(value) => updateField("backgroundColor", value)}
      />
      <ColorField
        id="theme-foreground"
        label="Foreground color"
        value={form.foregroundColor}
        onChange={(value) => updateField("foregroundColor", value)}
      />

      <div className="space-y-1.5 lg:col-span-2">
        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#5a647d]">
          Dark palette
        </p>
      </div>

      <ColorField
        id="theme-dark-primary"
        label="Dark primary color"
        value={form.darkPrimaryColor}
        onChange={(value) => updateField("darkPrimaryColor", value)}
      />
      <ColorField
        id="theme-dark-secondary"
        label="Dark secondary color"
        value={form.darkSecondaryColor}
        onChange={(value) => updateField("darkSecondaryColor", value)}
      />
      <ColorField
        id="theme-dark-accent"
        label="Dark accent color"
        value={form.darkAccentColor}
        onChange={(value) => updateField("darkAccentColor", value)}
      />
      <ColorField
        id="theme-dark-background"
        label="Dark background color"
        value={form.darkBackgroundColor}
        onChange={(value) => updateField("darkBackgroundColor", value)}
      />
      <ColorField
        id="theme-dark-foreground"
        label="Dark foreground color"
        value={form.darkForegroundColor}
        onChange={(value) => updateField("darkForegroundColor", value)}
      />

      <div className="space-y-1.5">
        <Label htmlFor="theme-font-sans">Font Sans</Label>
        <Input
          id="theme-font-sans"
          value={form.fontSans}
          onChange={(event) => updateField("fontSans", event.target.value)}
          placeholder="Inter"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="theme-font-heading">Font Heading</Label>
        <Input
          id="theme-font-heading"
          value={form.fontHeading}
          onChange={(event) => updateField("fontHeading", event.target.value)}
          placeholder="Manrope"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="theme-heading-scale">Heading Scale</Label>
        <Input
          id="theme-heading-scale"
          type="number"
          step="0.01"
          min="0.8"
          max="1.6"
          value={form.headingScale}
          onChange={(event) => updateField("headingScale", event.target.value)}
        />
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

function ColorField({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (nextValue: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          aria-label={label}
          className="h-10 w-12 rounded-lg border border-black/20 bg-white p-1"
          value={HEX_COLOR_REGEX.test(value) ? value : "#000000"}
          onChange={(event) => onChange(event.target.value)}
        />
        <Input
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      </div>
    </div>
  );
}
