import { describe, expect, it } from "vitest";
import {
  canScheduleCategoryDeletion,
  formatDeletionDate,
  resolveCategoryStatus,
} from "./client";

function createCategory(overrides?: {
  deletedAt?: string | null;
  scheduledDeletionAt?: string | null;
  appsCount?: number;
}) {
  return {
    id: "cat_1",
    name: "Utilities",
    icon: null,
    deletedAt: overrides?.deletedAt ?? null,
    scheduledDeletionAt: overrides?.scheduledDeletionAt ?? null,
    _count: {
      apps: overrides?.appsCount ?? 0,
    },
  };
}

describe("admin categories client logic", () => {
  it("resolves active status when category is not scheduled", () => {
    expect(resolveCategoryStatus(createCategory())).toEqual({
      label: "Active",
      tone: "active",
    });
  });

  it("resolves pending status when deletion is scheduled", () => {
    expect(
      resolveCategoryStatus(
        createCategory({ scheduledDeletionAt: "2026-04-17T10:00:00.000Z" }),
      ),
    ).toEqual({
      label: "Pending deletion",
      tone: "pending",
    });
  });

  it("resolves deleted status when category is deleted", () => {
    expect(
      resolveCategoryStatus(
        createCategory({ deletedAt: "2026-04-17T10:00:00.000Z" }),
      ),
    ).toEqual({
      label: "Deleted",
      tone: "deleted",
    });
  });

  it("allows scheduling only when no active apps and no lifecycle flags", () => {
    expect(canScheduleCategoryDeletion(createCategory())).toBe(true);
    expect(canScheduleCategoryDeletion(createCategory({ appsCount: 1 }))).toBe(
      false,
    );
    expect(
      canScheduleCategoryDeletion(
        createCategory({ scheduledDeletionAt: "2026-04-17T10:00:00.000Z" }),
      ),
    ).toBe(false);
    expect(
      canScheduleCategoryDeletion(
        createCategory({ deletedAt: "2026-04-17T10:00:00.000Z" }),
      ),
    ).toBe(false);
  });

  it("formats deletion date and preserves invalid input", () => {
    expect(formatDeletionDate(null)).toBeNull();

    const formatted = formatDeletionDate("2026-04-17T10:00:00.000Z");
    expect(formatted).toBeTruthy();
    expect(formatted).toContain("2026");

    expect(formatDeletionDate("not-a-date")).toBe("not-a-date");
  });
});
