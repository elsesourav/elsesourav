import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { AdminControlClient } from "./client";

vi.mock("@/store/hooks", () => ({
  useAppDispatch: () => vi.fn(),
  useAppSelector: () => false,
}));

describe("admin control client component", () => {
  it("renders payload helper actions for each control form", () => {
    const markup = renderToStaticMarkup(createElement(AdminControlClient));

    const formatJsonButtons = markup.match(/>Format JSON<\/button>/g) ?? [];
    const resetPayloadButtons = markup.match(/>Reset payload<\/button>/g) ?? [];

    expect(formatJsonButtons).toHaveLength(4);
    expect(resetPayloadButtons).toHaveLength(4);

    expect(markup).toContain("/api/admin/store/sections/items");
    expect(markup).toContain("/api/admin/store/banners");
    expect(markup).toContain("/api/admin/content/pages");
    expect(markup).toContain("/api/admin/theme/configs");
  });
});
