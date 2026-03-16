import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import {
  NotificationControls,
  type NotificationControlsProps,
} from "./notification-controls";

function renderNotificationControls(
  overrides: Partial<NotificationControlsProps> = {},
): string {
  const props: NotificationControlsProps = {
    emailNotifications: true,
    marketingEmails: true,
    sectionStatusLabel: "Saved",
    sectionStatusTone: "neutral",
    sectionFeedbackMessage: null,
    sectionFeedbackTone: null,
    sectionCanSave: true,
    sectionSaving: false,
    onEmailNotificationsChange: vi.fn(),
    onMarketingEmailsChange: vi.fn(),
    onApplyPreset: vi.fn(),
    onSaveSection: vi.fn(),
    ...overrides,
  };

  return renderToStaticMarkup(createElement(NotificationControls, props));
}

describe("notification controls component", () => {
  it("shows saving label and disabled state for notification save button", () => {
    const markup = renderNotificationControls({
      sectionCanSave: false,
      sectionSaving: true,
    });

    expect(markup).toMatch(
      /<button[^>]*disabled=""[^>]*>Saving\.\.\.<\/button>/,
    );
  });

  it("renders error feedback message when provided", () => {
    const markup = renderNotificationControls({
      sectionFeedbackMessage: "Failed to save notification settings.",
      sectionFeedbackTone: "error",
    });

    expect(markup).toContain("Failed to save notification settings.");
    expect(markup).toContain("text-red-600");
  });

  it("renders default save label when not saving", () => {
    const markup = renderNotificationControls({
      sectionCanSave: true,
      sectionSaving: false,
    });

    expect(markup).toContain("Save notifications");
    expect(markup).not.toContain("Saving...");
  });
});
