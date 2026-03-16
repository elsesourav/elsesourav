import type { UserDeletionScheduleView } from "@/lib/view-models";
import { describe, expect, it } from "vitest";
import {
  ACCOUNT_DELETION_CONFIRMATION_PHRASE,
  isDeletionConfirmationPhraseValid,
  normalizeDeletionConfirmationValue,
  resolveDeletionSectionStatus,
} from "./deletion-controls";

describe("deletion controls logic", () => {
  const baseSchedule: UserDeletionScheduleView = {
    scheduledDeletionAt: null,
    deletedAt: null,
    isScheduled: false,
    minimumDelayDays: 7,
    maximumDelayDays: 30,
    defaultDelayDays: 14,
  };

  it("normalizes case and whitespace in confirmation input", () => {
    expect(
      normalizeDeletionConfirmationValue("   delete   my   account   "),
    ).toBe(ACCOUNT_DELETION_CONFIRMATION_PHRASE);
  });

  it("accepts valid confirmation phrase in flexible user casing", () => {
    expect(isDeletionConfirmationPhraseValid("delete my account")).toBe(true);
    expect(isDeletionConfirmationPhraseValid(" DELETE  MY ACCOUNT ")).toBe(
      true,
    );
  });

  it("rejects invalid confirmation phrases", () => {
    expect(isDeletionConfirmationPhraseValid("delete account")).toBe(false);
    expect(isDeletionConfirmationPhraseValid("DELETE MY ACCOUNT NOW")).toBe(
      false,
    );
  });

  it("returns scheduled status when account deletion is scheduled", () => {
    expect(
      resolveDeletionSectionStatus(
        {
          ...baseSchedule,
          isScheduled: true,
          scheduledDeletionAt: "2026-03-31T12:00:00.000Z",
        },
        null,
        null,
      ),
    ).toEqual({
      label: "Scheduled",
      tone: "scheduled",
    });
  });

  it("returns updating status when deletion request is in flight", () => {
    expect(
      resolveDeletionSectionStatus(baseSchedule, "schedule", null),
    ).toEqual({
      label: "Updating...",
      tone: "saving",
    });
  });
});
