import { toSlug } from "@/lib/slug";
import { describe, expect, it } from "vitest";

describe("toSlug", () => {
  it("normalizes and hyphenates text", () => {
    expect(toSlug("  Hello World  ")).toBe("hello-world");
  });

  it("removes non-alphanumeric characters", () => {
    expect(toSlug("React + Next.js!!!")).toBe("react-next-js");
  });

  it("limits slug length to 80 characters", () => {
    const longInput = "a".repeat(100);
    expect(toSlug(longInput)).toHaveLength(80);
  });
});
