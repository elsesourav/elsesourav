import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { ThemeControls, type ThemeControlsProps } from "./theme-controls";

function renderThemeControls(
  overrides: Partial<ThemeControlsProps> = {},
): string {
  const props: ThemeControlsProps = {
    themeMode: "system",
    customTheme: {
      lightPrimaryColor: "#1f2937",
      lightSecondaryColor: "#111827",
      lightAccentColor: "#f59e0b",
      lightActionColor: "#f59e0b",
      lightBackgroundColor: "#ffffff",
      lightForegroundColor: "#171717",
      darkPrimaryColor: "#e2e8f0",
      darkSecondaryColor: "#334155",
      darkAccentColor: "#38bdf8",
      darkActionColor: "#38bdf8",
      darkBackgroundColor: "#0f172a",
      darkForegroundColor: "#e2e8f0",
    },
    hasAnyCustomThemeValue: true,
    sectionStatusLabel: "Unsaved changes",
    sectionStatusTone: "dirty",
    sectionFeedbackMessage: null,
    sectionFeedbackTone: null,
    sectionCanSave: true,
    sectionSaving: false,
    onThemeModeChange: vi.fn(),
    onCustomThemeChange: vi.fn(),
    onApplyPreset: vi.fn(),
    onClearTheme: vi.fn(),
    onSaveSection: vi.fn(),
    ...overrides,
  };

  return renderToStaticMarkup(createElement(ThemeControls, props));
}

describe("theme controls component", () => {
  it("shows saving label and disabled state for section save button", () => {
    const markup = renderThemeControls({
      sectionCanSave: false,
      sectionSaving: true,
    });

    expect(markup).toMatch(
      /<button[^>]*disabled=""[^>]*>Saving\.\.\.<\/button>/,
    );
  });

  it("renders success feedback message when provided", () => {
    const markup = renderThemeControls({
      sectionFeedbackMessage: "Theme settings saved.",
      sectionFeedbackTone: "success",
    });

    expect(markup).toContain("Theme settings saved.");
    expect(markup).toContain("text-emerald-700");
  });

  it("renders save label when not currently saving", () => {
    const markup = renderThemeControls({
      sectionCanSave: true,
      sectionSaving: false,
    });

    expect(markup).toContain("Save theme");
    expect(markup).not.toContain("Saving...");
  });
});
