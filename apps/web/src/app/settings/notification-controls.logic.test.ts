import { describe, expect, it } from "vitest";
import {
  resolveNotificationProfileDescription,
  resolveNotificationProfileLabel,
} from "./notification-controls";

describe("notification controls logic", () => {
  it("returns all updates profile when both toggles are enabled", () => {
    expect(
      resolveNotificationProfileLabel({
        emailNotifications: true,
        marketingEmails: true,
      }),
    ).toBe("All updates");

    expect(
      resolveNotificationProfileDescription({
        emailNotifications: true,
        marketingEmails: true,
      }),
    ).toContain("account notices");
  });

  it("returns essential only profile for only account notifications", () => {
    expect(
      resolveNotificationProfileLabel({
        emailNotifications: true,
        marketingEmails: false,
      }),
    ).toBe("Essential only");
  });

  it("returns marketing only profile when only marketing is enabled", () => {
    expect(
      resolveNotificationProfileLabel({
        emailNotifications: false,
        marketingEmails: true,
      }),
    ).toBe("Marketing only");
  });

  it("returns quiet mode profile when both toggles are disabled", () => {
    expect(
      resolveNotificationProfileLabel({
        emailNotifications: false,
        marketingEmails: false,
      }),
    ).toBe("Quiet mode");

    expect(
      resolveNotificationProfileDescription({
        emailNotifications: false,
        marketingEmails: false,
      }),
    ).toContain("muted");
  });
});
