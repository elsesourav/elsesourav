import type { UserDeletionScheduleView } from "@/lib/view-models";
import { describe, expect, it } from "vitest";
import {
  clampDeletionDelayDays,
  findInvalidCustomThemeField,
  resolveSettingsSectionStatus,
  toCustomThemePayload,
  toDeletionScheduleView,
  toNotificationSectionPayload,
  toThemeSectionPayload,
} from "./settings-form";

describe("settings form logic", () => {
  const createTheme = (
    overrides: Partial<{
      lightPrimaryColor: string;
      lightSecondaryColor: string;
      lightAccentColor: string;
      lightBackgroundColor: string;
      lightForegroundColor: string;
      darkPrimaryColor: string;
      darkSecondaryColor: string;
      darkAccentColor: string;
      darkBackgroundColor: string;
      darkForegroundColor: string;
    }> = {},
  ) => ({
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
    ...overrides,
  });

  const deletionSchedule: UserDeletionScheduleView = {
    scheduledDeletionAt: null,
    deletedAt: null,
    isScheduled: false,
    minimumDelayDays: 7,
    maximumDelayDays: 30,
    defaultDelayDays: 14,
  };

  it("returns null for empty custom theme payload", () => {
    expect(
      toCustomThemePayload(createTheme({ lightPrimaryColor: " " })),
    ).toBeNull();
  });

  it("trims and keeps only non-empty custom theme fields", () => {
    expect(
      toCustomThemePayload(
        createTheme({
          lightPrimaryColor: " #111827 ",
          darkAccentColor: "#22d3ee",
        }),
      ),
    ).toEqual({
      lightPrimaryColor: "#111827",
      darkAccentColor: "#22d3ee",
    });
  });

  it("detects invalid custom theme color field", () => {
    expect(
      findInvalidCustomThemeField(
        createTheme({
          lightPrimaryColor: "#111827",
          darkSecondaryColor: "not-a-color",
        }),
      ),
    ).toBe("darkSecondaryColor");
  });

  it("clamps deletion delay to allowed range", () => {
    expect(clampDeletionDelayDays(2, deletionSchedule)).toBe(7);
    expect(clampDeletionDelayDays(45, deletionSchedule)).toBe(30);
    expect(clampDeletionDelayDays(13.6, deletionSchedule)).toBe(14);
  });

  it("parses valid deletion schedule payload and rejects invalid payload", () => {
    const valid = toDeletionScheduleView({
      scheduledDeletionAt: "2026-03-31T12:00:00.000Z",
      deletedAt: null,
      isScheduled: true,
      minimumDelayDays: 7,
      maximumDelayDays: 30,
      defaultDelayDays: 14,
    });

    expect(valid).toEqual({
      scheduledDeletionAt: "2026-03-31T12:00:00.000Z",
      deletedAt: null,
      isScheduled: true,
      minimumDelayDays: 7,
      maximumDelayDays: 30,
      defaultDelayDays: 14,
    });

    expect(
      toDeletionScheduleView({
        scheduledDeletionAt: null,
        deletedAt: null,
        isScheduled: "yes",
        minimumDelayDays: 7,
        maximumDelayDays: 30,
        defaultDelayDays: 14,
      }),
    ).toBeNull();
  });

  it("returns unsaved section status when section is dirty", () => {
    expect(resolveSettingsSectionStatus(true, false)).toEqual({
      label: "Unsaved changes",
      tone: "dirty",
    });
  });

  it("returns saving section status while section save is pending", () => {
    expect(resolveSettingsSectionStatus(true, true)).toEqual({
      label: "Saving...",
      tone: "saving",
    });
  });

  it("returns saved section status when section is clean", () => {
    expect(resolveSettingsSectionStatus(false, false)).toEqual({
      label: "Saved",
      tone: "neutral",
    });
  });

  it("builds theme section payload without overwriting saved notifications", () => {
    const payload = toThemeSectionPayload(
      {
        themeMode: "dark",
        customTheme: createTheme({
          lightPrimaryColor: "#111827",
          lightSecondaryColor: "#1f2937",
          darkAccentColor: "#22d3ee",
          darkBackgroundColor: "#0f172a",
          darkForegroundColor: "#e2e8f0",
        }),
        emailNotifications: false,
        marketingEmails: false,
      },
      {
        themeMode: "light",
        customTheme: createTheme({
          lightPrimaryColor: "#1f2937",
          lightSecondaryColor: "#111827",
          lightAccentColor: "#f59e0b",
          lightBackgroundColor: "#ffffff",
          lightForegroundColor: "#171717",
        }),
        emailNotifications: true,
        marketingEmails: true,
      },
    );

    expect(payload).toEqual({
      themeMode: "dark",
      customTheme: {
        lightPrimaryColor: "#111827",
        lightSecondaryColor: "#1f2937",
        darkAccentColor: "#22d3ee",
        darkBackgroundColor: "#0f172a",
        darkForegroundColor: "#e2e8f0",
      },
      emailNotifications: true,
      marketingEmails: true,
    });
  });

  it("builds notification section payload without overwriting saved theme", () => {
    const payload = toNotificationSectionPayload(
      {
        themeMode: "dark",
        customTheme: createTheme({
          lightPrimaryColor: "#111827",
          lightSecondaryColor: "#1f2937",
          darkAccentColor: "#22d3ee",
          darkBackgroundColor: "#0f172a",
          darkForegroundColor: "#e2e8f0",
        }),
        emailNotifications: false,
        marketingEmails: false,
      },
      {
        themeMode: "light",
        customTheme: createTheme({
          lightPrimaryColor: "#1f2937",
          lightSecondaryColor: "#111827",
          lightAccentColor: "#f59e0b",
          lightBackgroundColor: "#ffffff",
          lightForegroundColor: "#171717",
        }),
        emailNotifications: true,
        marketingEmails: true,
      },
    );

    expect(payload).toEqual({
      themeMode: "light",
      customTheme: {
        lightPrimaryColor: "#1f2937",
        lightSecondaryColor: "#111827",
        lightAccentColor: "#f59e0b",
        lightBackgroundColor: "#ffffff",
        lightForegroundColor: "#171717",
      },
      emailNotifications: false,
      marketingEmails: false,
    });
  });
});
