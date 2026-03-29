import { describe, expect, it } from "vitest";
import {
  removeLinkById,
  replaceLinkById,
  toSortedLinks,
  upsertLinkByPlatform,
  validateLinkUrls,
  type AdminAppLink,
} from "./link-state";

function createLink(overrides?: Partial<AdminAppLink>): AdminAppLink {
  return {
    id: overrides?.id ?? "link_1",
    appId: overrides?.appId ?? "app_1",
    platform: overrides?.platform ?? "WEBSITE",
    downloadUrl: overrides?.downloadUrl ?? "https://example.com/download",
    sourceCodeUrl: overrides?.sourceCodeUrl ?? null,
    createdAt: overrides?.createdAt ?? "2026-03-17T10:00:00.000Z",
    updatedAt: overrides?.updatedAt ?? "2026-03-17T10:00:00.000Z",
  };
}

describe("admin apps link state", () => {
  it("sorts links alphabetically by platform", () => {
    const sorted = toSortedLinks([
      createLink({ id: "3", platform: "WEBSITE" }),
      createLink({ id: "1", platform: "ANDROID" }),
      createLink({ id: "2", platform: "CHROME" }),
    ]);

    expect(sorted.map((item) => item.platform)).toEqual([
      "ANDROID",
      "CHROME",
      "WEBSITE",
    ]);
  });

  it("upserts by platform and keeps result sorted", () => {
    const current = [
      createLink({ id: "1", platform: "ANDROID" }),
      createLink({
        id: "2",
        platform: "WEBSITE",
        downloadUrl: "https://old.example.com",
      }),
    ];

    const next = upsertLinkByPlatform(
      current,
      createLink({
        id: "3",
        platform: "WEBSITE",
        downloadUrl: "https://new.example.com",
      }),
    );

    expect(next).toHaveLength(2);
    expect(next.find((item) => item.platform === "WEBSITE")?.downloadUrl).toBe(
      "https://new.example.com",
    );
    expect(next.map((item) => item.platform)).toEqual(["ANDROID", "WEBSITE"]);
  });

  it("replaces by id and keeps result sorted", () => {
    const current = [
      createLink({ id: "1", platform: "WEBSITE" }),
      createLink({ id: "2", platform: "CHROME" }),
    ];

    const next = replaceLinkById(
      current,
      "1",
      createLink({ id: "1", platform: "ANDROID" }),
    );

    expect(next.map((item) => item.platform)).toEqual(["ANDROID", "CHROME"]);
  });

  it("removes link by id", () => {
    const current = [
      createLink({ id: "1", platform: "ANDROID" }),
      createLink({ id: "2", platform: "WEBSITE" }),
    ];

    const next = removeLinkById(current, "1");
    expect(next).toHaveLength(1);
    expect(next[0]?.id).toBe("2");
  });

  it("validates download and optional source URLs", () => {
    expect(validateLinkUrls("https://example.com", "")).toBeNull();
    expect(
      validateLinkUrls("https://example.com", "https://github.com/repo"),
    ).toBeNull();

    expect(validateLinkUrls("not-a-url", "")).toBe(
      "Provide valid URLs for download and source code fields.",
    );
    expect(validateLinkUrls("https://example.com", "not-a-url")).toBe(
      "Provide valid URLs for download and source code fields.",
    );
  });
});
