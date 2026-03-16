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
      toCustomThemePayload({
        primaryColor: " ",
        secondaryColor: "",
        accentColor: "",
        backgroundColor: "",
        foregroundColor: "",
      }),
    ).toBeNull();
  });

  it("trims and keeps only non-empty custom theme fields", () => {
    expect(
      toCustomThemePayload({
        primaryColor: " #111827 ",
        secondaryColor: "",
        accentColor: "#f59e0b",
        backgroundColor: "",
        foregroundColor: "",
      }),
    ).toEqual({
      primaryColor: "#111827",
      accentColor: "#f59e0b",
    });
  });

  it("detects invalid custom theme color field", () => {
    expect(
      findInvalidCustomThemeField({
        primaryColor: "#111827",
        secondaryColor: "not-a-color",
        accentColor: "#f59e0b",
        backgroundColor: "",
        foregroundColor: "",
      }),
    ).toBe("secondaryColor");
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
        customTheme: {
          primaryColor: "#111827",
          secondaryColor: "#1f2937",
          accentColor: "#22d3ee",
          backgroundColor: "#0f172a",
          foregroundColor: "#e2e8f0",
        },
        emailNotifications: false,
        marketingEmails: false,
      },
      {
        themeMode: "light",
        customTheme: {
          primaryColor: "#1f2937",
          secondaryColor: "#111827",
          accentColor: "#f59e0b",
          backgroundColor: "#ffffff",
          foregroundColor: "#171717",
        },
        emailNotifications: true,
        marketingEmails: true,
      },
    );

    expect(payload).toEqual({
      themeMode: "dark",
      customTheme: {
        primaryColor: "#111827",
        secondaryColor: "#1f2937",
        accentColor: "#22d3ee",
        backgroundColor: "#0f172a",
        foregroundColor: "#e2e8f0",
      },
      emailNotifications: true,
      marketingEmails: true,
    });
  });

  it("builds notification section payload without overwriting saved theme", () => {
    const payload = toNotificationSectionPayload(
      {
        themeMode: "dark",
        customTheme: {
          primaryColor: "#111827",
          secondaryColor: "#1f2937",
          accentColor: "#22d3ee",
          backgroundColor: "#0f172a",
          foregroundColor: "#e2e8f0",
        },
        emailNotifications: false,
        marketingEmails: false,
      },
      {
        themeMode: "light",
        customTheme: {
          primaryColor: "#1f2937",
          secondaryColor: "#111827",
          accentColor: "#f59e0b",
          backgroundColor: "#ffffff",
          foregroundColor: "#171717",
        },
        emailNotifications: true,
        marketingEmails: true,
      },
    );

    expect(payload).toEqual({
      themeMode: "light",
      customTheme: {
        primaryColor: "#1f2937",
        secondaryColor: "#111827",
        accentColor: "#f59e0b",
        backgroundColor: "#ffffff",
        foregroundColor: "#171717",
      },
      emailNotifications: false,
      marketingEmails: false,
    });
  });
});
