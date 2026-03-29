"use client";

import {
  formatDateTime,
  type UserDeletionScheduleView,
} from "@/lib/view-models";
import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  ACCOUNT_DELETION_CONFIRMATION_PHRASE,
  DeletionControls,
  isDeletionConfirmationPhraseValid,
} from "./deletion-controls";
import {
  NotificationControls,
  type NotificationControlState,
} from "./notification-controls";
import {
  ThemeControls,
  customThemeFieldMeta,
  type CustomThemeFieldKey,
  type CustomThemeInput,
  type ThemeMode,
} from "./theme-controls";

export type SettingsUpdateInput = {
  themeMode: ThemeMode;
  emailNotifications: boolean;
  marketingEmails: boolean;
  customTheme: CustomThemeInput;
};

type SettingsFormData = SettingsUpdateInput;

type SettingsFormProps = {
  initialSettings: {
    themeMode: ThemeMode;
    emailNotifications: boolean;
    marketingEmails: boolean;
    customTheme: Record<string, string> | null;
  };
  initialDeletionSchedule: UserDeletionScheduleView;
};

type ApiResponse = {
  ok: boolean;
  data?: unknown;
  error?: {
    message?: string;
  };
};

export type SettingsUpdatePayload = {
  themeMode: ThemeMode;
  emailNotifications: boolean;
  marketingEmails: boolean;
  customTheme: Record<string, string> | null;
};

type SectionFeedback = {
  message: string | null;
  tone: "success" | "error" | null;
};

export type SettingsSectionStatus = {
  label: string;
  tone: "neutral" | "dirty" | "saving";
};

export function resolveSettingsSectionStatus(
  isDirty: boolean,
  isSaving: boolean,
): SettingsSectionStatus {
  if (isSaving) {
    return {
      label: "Saving...",
      tone: "saving",
    };
  }

  if (isDirty) {
    return {
      label: "Unsaved changes",
      tone: "dirty",
    };
  }

  return {
    label: "Saved",
    tone: "neutral",
  };
}

const HEX_COLOR_REGEX = /^#(?:[0-9a-fA-F]{3}){1,2}$/;

function fromCustomTheme(
  theme: Record<string, string> | null,
): CustomThemeInput {
  return {
    lightPrimaryColor: theme?.lightPrimaryColor ?? theme?.primaryColor ?? "",
    lightSecondaryColor:
      theme?.lightSecondaryColor ?? theme?.secondaryColor ?? "",
    lightAccentColor: theme?.lightAccentColor ?? theme?.accentColor ?? "",
    lightBackgroundColor:
      theme?.lightBackgroundColor ?? theme?.backgroundColor ?? "",
    lightForegroundColor:
      theme?.lightForegroundColor ?? theme?.foregroundColor ?? "",
    darkPrimaryColor: theme?.darkPrimaryColor ?? "",
    darkSecondaryColor: theme?.darkSecondaryColor ?? "",
    darkAccentColor: theme?.darkAccentColor ?? "",
    darkBackgroundColor: theme?.darkBackgroundColor ?? "",
    darkForegroundColor: theme?.darkForegroundColor ?? "",
  };
}

export function toCustomThemePayload(
  customTheme: CustomThemeInput,
): Record<string, string> | null {
  const entries = Object.entries(customTheme)
    .map(([key, value]) => [key, value.trim()] as const)
    .filter(([, value]) => value.length > 0);

  if (entries.length === 0) {
    return null;
  }

  return Object.fromEntries(entries);
}

export function findInvalidCustomThemeField(
  customTheme: CustomThemeInput,
): CustomThemeFieldKey | null {
  for (const field of customThemeFieldMeta) {
    const value = customTheme[field.key].trim();

    if (value.length > 0 && !HEX_COLOR_REGEX.test(value)) {
      return field.key;
    }
  }

  return null;
}

export function clampDeletionDelayDays(
  value: number,
  schedule: UserDeletionScheduleView,
): number {
  return Math.min(
    schedule.maximumDelayDays,
    Math.max(schedule.minimumDelayDays, Math.round(value)),
  );
}

export function toDeletionScheduleView(
  value: unknown,
): UserDeletionScheduleView | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const candidate = value as Partial<UserDeletionScheduleView>;

  if (
    (candidate.scheduledDeletionAt === null ||
      typeof candidate.scheduledDeletionAt === "string") &&
    (candidate.deletedAt === null || typeof candidate.deletedAt === "string") &&
    typeof candidate.isScheduled === "boolean" &&
    typeof candidate.minimumDelayDays === "number" &&
    Number.isFinite(candidate.minimumDelayDays) &&
    typeof candidate.maximumDelayDays === "number" &&
    Number.isFinite(candidate.maximumDelayDays) &&
    typeof candidate.defaultDelayDays === "number" &&
    Number.isFinite(candidate.defaultDelayDays)
  ) {
    return {
      scheduledDeletionAt: candidate.scheduledDeletionAt,
      deletedAt: candidate.deletedAt,
      isScheduled: candidate.isScheduled,
      minimumDelayDays: candidate.minimumDelayDays,
      maximumDelayDays: candidate.maximumDelayDays,
      defaultDelayDays: candidate.defaultDelayDays,
    };
  }

  return null;
}

export function toSettingsUpdatePayload(
  data: SettingsUpdateInput,
): SettingsUpdatePayload {
  return {
    themeMode: data.themeMode,
    emailNotifications: data.emailNotifications,
    marketingEmails: data.marketingEmails,
    customTheme: toCustomThemePayload(data.customTheme),
  };
}

export function toThemeSectionPayload(
  formData: SettingsUpdateInput,
  savedData: SettingsUpdateInput,
): SettingsUpdatePayload {
  return {
    themeMode: formData.themeMode,
    customTheme: toCustomThemePayload(formData.customTheme),
    emailNotifications: savedData.emailNotifications,
    marketingEmails: savedData.marketingEmails,
  };
}

export function toNotificationSectionPayload(
  formData: SettingsUpdateInput,
  savedData: SettingsUpdateInput,
): SettingsUpdatePayload {
  return {
    themeMode: savedData.themeMode,
    customTheme: toCustomThemePayload(savedData.customTheme),
    emailNotifications: formData.emailNotifications,
    marketingEmails: formData.marketingEmails,
  };
}

const buttonClassName =
  "rounded-full bg-[#14171f] px-4 py-2 text-sm font-medium text-white disabled:opacity-60";

export function SettingsForm({
  initialSettings,
  initialDeletionSchedule,
}: SettingsFormProps) {
  const [formData, setFormData] = useState<SettingsFormData>({
    themeMode: initialSettings.themeMode,
    emailNotifications: initialSettings.emailNotifications,
    marketingEmails: initialSettings.marketingEmails,
    customTheme: fromCustomTheme(initialSettings.customTheme),
  });
  const [savedData, setSavedData] = useState<SettingsFormData>({
    themeMode: initialSettings.themeMode,
    emailNotifications: initialSettings.emailNotifications,
    marketingEmails: initialSettings.marketingEmails,
    customTheme: fromCustomTheme(initialSettings.customTheme),
  });
  const [savingScope, setSavingScope] = useState<
    "global" | "theme" | "notifications" | null
  >(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusTone, setStatusTone] = useState<"success" | "error" | null>(
    null,
  );
  const [themeFeedback, setThemeFeedback] = useState<SectionFeedback>({
    message: null,
    tone: null,
  });
  const [notificationFeedback, setNotificationFeedback] =
    useState<SectionFeedback>({
      message: null,
      tone: null,
    });
  const [deletionSchedule, setDeletionSchedule] =
    useState<UserDeletionScheduleView>(initialDeletionSchedule);
  const [selectedDeletionDelayDays, setSelectedDeletionDelayDays] = useState(
    () =>
      clampDeletionDelayDays(
        initialDeletionSchedule.defaultDelayDays,
        initialDeletionSchedule,
      ),
  );
  const [deletionConfirmationValue, setDeletionConfirmationValue] =
    useState("");
  const [deletionPendingAction, setDeletionPendingAction] = useState<
    "schedule" | "cancel" | null
  >(null);
  const [deletionStatusMessage, setDeletionStatusMessage] = useState<
    string | null
  >(null);
  const [deletionStatusTone, setDeletionStatusTone] = useState<
    "success" | "error" | null
  >(null);

  useEffect(() => {
    setSelectedDeletionDelayDays((previous) =>
      clampDeletionDelayDays(previous, deletionSchedule),
    );
  }, [deletionSchedule]);

  const hasAnyCustomThemeValue = useMemo(
    () =>
      Object.values(formData.customTheme).some(
        (value) => value.trim().length > 0,
      ),
    [formData.customTheme],
  );

  const hasThemeChanges = useMemo(
    () =>
      formData.themeMode !== savedData.themeMode ||
      JSON.stringify(formData.customTheme) !==
        JSON.stringify(savedData.customTheme),
    [
      formData.customTheme,
      formData.themeMode,
      savedData.customTheme,
      savedData.themeMode,
    ],
  );

  const hasNotificationChanges = useMemo(
    () =>
      formData.emailNotifications !== savedData.emailNotifications ||
      formData.marketingEmails !== savedData.marketingEmails,
    [
      formData.emailNotifications,
      formData.marketingEmails,
      savedData.emailNotifications,
      savedData.marketingEmails,
    ],
  );

  const hasChanges = useMemo(
    () => hasThemeChanges || hasNotificationChanges,
    [hasThemeChanges, hasNotificationChanges],
  );

  const pending = savingScope !== null;
  const isGlobalSaving = savingScope === "global";
  const isThemeSaving =
    savingScope === "theme" || (savingScope === "global" && hasThemeChanges);
  const isNotificationSaving =
    savingScope === "notifications" ||
    (savingScope === "global" && hasNotificationChanges);

  const themeSectionStatus = useMemo(
    () => resolveSettingsSectionStatus(hasThemeChanges, isThemeSaving),
    [hasThemeChanges, isThemeSaving],
  );

  const notificationSectionStatus = useMemo(
    () =>
      resolveSettingsSectionStatus(
        hasNotificationChanges,
        isNotificationSaving,
      ),
    [hasNotificationChanges, isNotificationSaving],
  );

  async function submitSettingsUpdate(payload: SettingsUpdatePayload): Promise<{
    ok: boolean;
    message?: string;
  }> {
    try {
      const response = await fetch("/api/user/settings", {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const responsePayload = (await response.json()) as ApiResponse;

      if (!response.ok || !responsePayload.ok) {
        return {
          ok: false,
          message: responsePayload.error?.message ?? "Failed to save settings.",
        };
      }

      return { ok: true };
    } catch (error) {
      return {
        ok: false,
        message:
          error instanceof Error ? error.message : "Failed to save settings.",
      };
    }
  }

  function updateThemeMode(themeMode: ThemeMode) {
    setThemeFeedback({
      message: null,
      tone: null,
    });
    setFormData((previous) => ({
      ...previous,
      themeMode,
    }));
  }

  function updateCustomThemeField(field: CustomThemeFieldKey, value: string) {
    setThemeFeedback({
      message: null,
      tone: null,
    });
    setFormData((previous) => ({
      ...previous,
      customTheme: {
        ...previous.customTheme,
        [field]: value,
      },
    }));
  }

  function clearCustomTheme() {
    setThemeFeedback({
      message: null,
      tone: null,
    });
    setFormData((previous) => ({
      ...previous,
      customTheme: {
        lightPrimaryColor: "",
        lightSecondaryColor: "",
        lightAccentColor: "",
        lightBackgroundColor: "",
        lightForegroundColor: "",
        darkPrimaryColor: "",
        darkSecondaryColor: "",
        darkAccentColor: "",
        darkBackgroundColor: "",
        darkForegroundColor: "",
      },
    }));
  }

  function applyCustomThemePreset(colors: CustomThemeInput) {
    setThemeFeedback({
      message: null,
      tone: null,
    });
    setFormData((previous) => ({
      ...previous,
      customTheme: {
        ...colors,
      },
    }));
  }

  function updateEmailNotifications(value: boolean) {
    setNotificationFeedback({
      message: null,
      tone: null,
    });
    setFormData((previous) => ({
      ...previous,
      emailNotifications: value,
    }));
  }

  function updateMarketingEmails(value: boolean) {
    setNotificationFeedback({
      message: null,
      tone: null,
    });
    setFormData((previous) => ({
      ...previous,
      marketingEmails: value,
    }));
  }

  function applyNotificationPreset(state: NotificationControlState) {
    setNotificationFeedback({
      message: null,
      tone: null,
    });
    setFormData((previous) => ({
      ...previous,
      emailNotifications: state.emailNotifications,
      marketingEmails: state.marketingEmails,
    }));
  }

  async function saveThemeSection() {
    if (!hasThemeChanges || pending) {
      return;
    }

    setSavingScope("theme");
    setStatusTone(null);
    setStatusMessage(null);
    setThemeFeedback({
      message: null,
      tone: null,
    });

    try {
      const invalidField = findInvalidCustomThemeField(formData.customTheme);
      if (invalidField) {
        const label =
          customThemeFieldMeta.find((field) => field.key === invalidField)
            ?.label ?? "Custom theme color";
        setStatusTone("error");
        setStatusMessage(
          `${label} must be a valid hex color (example: #1f2937).`,
        );
        setThemeFeedback({
          message: `${label} must be a valid hex color (example: #1f2937).`,
          tone: "error",
        });
        return;
      }

      const result = await submitSettingsUpdate(
        toThemeSectionPayload(formData, savedData),
      );

      if (!result.ok) {
        setStatusTone("error");
        setStatusMessage(result.message ?? "Failed to save theme settings.");
        setThemeFeedback({
          message: result.message ?? "Failed to save theme settings.",
          tone: "error",
        });
        return;
      }

      setSavedData((previous) => ({
        ...previous,
        themeMode: formData.themeMode,
        customTheme: formData.customTheme,
      }));
      setStatusTone("success");
      setStatusMessage("Theme settings saved.");
      setThemeFeedback({
        message: "Theme settings saved.",
        tone: "success",
      });
    } finally {
      setSavingScope(null);
    }
  }

  async function saveNotificationSection() {
    if (!hasNotificationChanges || pending) {
      return;
    }

    setSavingScope("notifications");
    setStatusTone(null);
    setStatusMessage(null);
    setNotificationFeedback({
      message: null,
      tone: null,
    });

    try {
      const result = await submitSettingsUpdate(
        toNotificationSectionPayload(formData, savedData),
      );

      if (!result.ok) {
        setStatusTone("error");
        setStatusMessage(
          result.message ?? "Failed to save notification settings.",
        );
        setNotificationFeedback({
          message: result.message ?? "Failed to save notification settings.",
          tone: "error",
        });
        return;
      }

      setSavedData((previous) => ({
        ...previous,
        emailNotifications: formData.emailNotifications,
        marketingEmails: formData.marketingEmails,
      }));
      setStatusTone("success");
      setStatusMessage("Notification settings saved.");
      setNotificationFeedback({
        message: "Notification settings saved.",
        tone: "success",
      });
    } finally {
      setSavingScope(null);
    }
  }

  const deletionDelayOptions = useMemo(() => {
    const options = [
      deletionSchedule.minimumDelayDays,
      deletionSchedule.defaultDelayDays,
      deletionSchedule.maximumDelayDays,
    ];

    return [...new Set(options)].sort((a, b) => a - b);
  }, [deletionSchedule]);

  function resetDeletionFlow() {
    setDeletionConfirmationValue("");
    setDeletionStatusTone(null);
    setDeletionStatusMessage(null);
  }

  async function scheduleDeletion() {
    if (!isDeletionConfirmationPhraseValid(deletionConfirmationValue)) {
      setDeletionStatusTone("error");
      setDeletionStatusMessage(
        `Type \"${ACCOUNT_DELETION_CONFIRMATION_PHRASE}\" to confirm account deletion.`,
      );
      return;
    }

    const delayDays = clampDeletionDelayDays(
      selectedDeletionDelayDays,
      deletionSchedule,
    );

    setDeletionPendingAction("schedule");
    setDeletionStatusTone(null);
    setDeletionStatusMessage(null);

    try {
      const response = await fetch("/api/user/settings/deletion", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          confirm: true,
          delayDays,
        }),
      });

      const responsePayload = (await response.json()) as ApiResponse;

      if (!response.ok || !responsePayload.ok) {
        setDeletionStatusTone("error");
        setDeletionStatusMessage(
          responsePayload.error?.message ??
            "Failed to schedule account deletion.",
        );
        return;
      }

      const nextSchedule = toDeletionScheduleView(responsePayload.data);
      if (!nextSchedule) {
        setDeletionStatusTone("error");
        setDeletionStatusMessage(
          "Deletion schedule was saved but response payload was invalid.",
        );
        return;
      }

      setDeletionSchedule(nextSchedule);
      setDeletionConfirmationValue("");
      setDeletionStatusTone("success");
      setDeletionStatusMessage(
        `Account deletion scheduled for ${formatDateTime(nextSchedule.scheduledDeletionAt)}.`,
      );
    } catch (error) {
      setDeletionStatusTone("error");
      setDeletionStatusMessage(
        error instanceof Error
          ? error.message
          : "Failed to schedule account deletion.",
      );
    } finally {
      setDeletionPendingAction(null);
    }
  }

  async function cancelScheduledDeletion() {
    setDeletionPendingAction("cancel");
    setDeletionStatusTone(null);
    setDeletionStatusMessage(null);

    try {
      const response = await fetch("/api/user/settings/deletion", {
        method: "DELETE",
      });

      const responsePayload = (await response.json()) as ApiResponse;

      if (!response.ok || !responsePayload.ok) {
        setDeletionStatusTone("error");
        setDeletionStatusMessage(
          responsePayload.error?.message ??
            "Failed to cancel scheduled deletion.",
        );
        return;
      }

      const nextSchedule = toDeletionScheduleView(responsePayload.data);
      if (!nextSchedule) {
        setDeletionStatusTone("error");
        setDeletionStatusMessage(
          "Deletion cancellation succeeded but response payload was invalid.",
        );
        return;
      }

      setDeletionSchedule(nextSchedule);
      setDeletionConfirmationValue("");
      setDeletionStatusTone("success");
      setDeletionStatusMessage("Scheduled deletion canceled.");
    } catch (error) {
      setDeletionStatusTone("error");
      setDeletionStatusMessage(
        error instanceof Error
          ? error.message
          : "Failed to cancel scheduled deletion.",
      );
    } finally {
      setDeletionPendingAction(null);
    }
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!hasChanges) {
      setStatusTone(null);
      setStatusMessage("No changes to save.");
      return;
    }

    setSavingScope("global");
    setStatusTone(null);
    setStatusMessage(null);
    setThemeFeedback({
      message: null,
      tone: null,
    });
    setNotificationFeedback({
      message: null,
      tone: null,
    });

    try {
      const invalidField = findInvalidCustomThemeField(formData.customTheme);
      if (invalidField) {
        const label =
          customThemeFieldMeta.find((field) => field.key === invalidField)
            ?.label ?? "Custom theme color";
        setStatusTone("error");
        setStatusMessage(
          `${label} must be a valid hex color (example: #1f2937).`,
        );
        setThemeFeedback({
          message: `${label} must be a valid hex color (example: #1f2937).`,
          tone: "error",
        });
        return;
      }

      const result = await submitSettingsUpdate(
        toSettingsUpdatePayload(formData),
      );

      if (!result.ok) {
        const failureMessage = result.message ?? "Failed to save settings.";
        setStatusTone("error");
        setStatusMessage(failureMessage);
        setThemeFeedback({
          message: failureMessage,
          tone: "error",
        });
        setNotificationFeedback({
          message: failureMessage,
          tone: "error",
        });
        return;
      }

      setSavedData(formData);
      setStatusTone("success");
      setStatusMessage("Settings saved.");
      setThemeFeedback({
        message: "Theme settings saved.",
        tone: "success",
      });
      setNotificationFeedback({
        message: "Notification settings saved.",
        tone: "success",
      });
    } catch (error) {
      setStatusTone("error");
      setStatusMessage(
        error instanceof Error ? error.message : "Failed to save settings.",
      );
    } finally {
      setSavingScope(null);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <ThemeControls
        themeMode={formData.themeMode}
        customTheme={formData.customTheme}
        hasAnyCustomThemeValue={hasAnyCustomThemeValue}
        sectionStatusLabel={themeSectionStatus.label}
        sectionStatusTone={themeSectionStatus.tone}
        sectionFeedbackMessage={themeFeedback.message}
        sectionFeedbackTone={themeFeedback.tone}
        sectionCanSave={hasThemeChanges && !pending}
        sectionSaving={savingScope === "theme"}
        onThemeModeChange={updateThemeMode}
        onCustomThemeChange={updateCustomThemeField}
        onApplyPreset={applyCustomThemePreset}
        onClearTheme={clearCustomTheme}
        onSaveSection={saveThemeSection}
      />

      <NotificationControls
        emailNotifications={formData.emailNotifications}
        marketingEmails={formData.marketingEmails}
        sectionStatusLabel={notificationSectionStatus.label}
        sectionStatusTone={notificationSectionStatus.tone}
        sectionFeedbackMessage={notificationFeedback.message}
        sectionFeedbackTone={notificationFeedback.tone}
        sectionCanSave={hasNotificationChanges && !pending}
        sectionSaving={savingScope === "notifications"}
        onEmailNotificationsChange={updateEmailNotifications}
        onMarketingEmailsChange={updateMarketingEmails}
        onApplyPreset={applyNotificationPreset}
        onSaveSection={saveNotificationSection}
      />

      <DeletionControls
        schedule={deletionSchedule}
        delayDays={selectedDeletionDelayDays}
        delayOptions={deletionDelayOptions}
        confirmationValue={deletionConfirmationValue}
        pendingAction={deletionPendingAction}
        statusMessage={deletionStatusMessage}
        statusTone={deletionStatusTone}
        onDelayDaysChange={(value) =>
          setSelectedDeletionDelayDays(
            clampDeletionDelayDays(value, deletionSchedule),
          )
        }
        onConfirmationValueChange={setDeletionConfirmationValue}
        onSchedule={scheduleDeletion}
        onCancelSchedule={cancelScheduledDeletion}
        onResetFlow={resetDeletionFlow}
      />

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending || !hasChanges}
          className={buttonClassName}
        >
          {isGlobalSaving ? "Saving..." : "Save settings"}
        </button>
        {statusMessage ? (
          <p
            className={`text-sm ${
              statusTone === "success"
                ? "text-emerald-700"
                : statusTone === "error"
                  ? "text-red-600"
                  : "text-[#4a5262]"
            }`}
            role="status"
            aria-live="polite"
          >
            {statusMessage}
          </p>
        ) : null}
      </div>
    </form>
  );
}
