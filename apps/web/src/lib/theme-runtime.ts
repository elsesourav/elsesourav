import type { ThemeConfigDto } from "@elsesourav/types";

export type ThemeMode = "system" | "light" | "dark";

export type ThemeSettingsPayload = {
  themeMode: ThemeMode;
  customTheme: Record<string, string> | null;
};

type ThemeColorField =
  | "primaryColor"
  | "secondaryColor"
  | "accentColor"
  | "backgroundColor"
  | "foregroundColor";

type ThemePalette = Record<ThemeColorField, string>;

const HEX_COLOR_REGEX = /^#(?:[0-9a-fA-F]{3}){1,2}$/;

const fallbackLightPalette: ThemePalette = {
  primaryColor: "#1a2232",
  secondaryColor: "#1f5ed4",
  accentColor: "#f59e0b",
  backgroundColor: "#f4f6fb",
  foregroundColor: "#0f1420",
};

const fallbackDarkPalette: ThemePalette = {
  primaryColor: "#e2e8f0",
  secondaryColor: "#93c5fd",
  accentColor: "#38bdf8",
  backgroundColor: "#0b1220",
  foregroundColor: "#e2e8f0",
};

const lightOverrideKeys: Record<ThemeColorField, string> = {
  primaryColor: "lightPrimaryColor",
  secondaryColor: "lightSecondaryColor",
  accentColor: "lightAccentColor",
  backgroundColor: "lightBackgroundColor",
  foregroundColor: "lightForegroundColor",
};

const darkOverrideKeys: Record<ThemeColorField, string> = {
  primaryColor: "darkPrimaryColor",
  secondaryColor: "darkSecondaryColor",
  accentColor: "darkAccentColor",
  backgroundColor: "darkBackgroundColor",
  foregroundColor: "darkForegroundColor",
};

function normalizeHexColor(value: string): string {
  const trimmed = value.trim().toLowerCase();

  if (!HEX_COLOR_REGEX.test(trimmed)) {
    return trimmed;
  }

  if (trimmed.length === 4) {
    return `#${trimmed[1]}${trimmed[1]}${trimmed[2]}${trimmed[2]}${trimmed[3]}${trimmed[3]}`;
  }

  return trimmed;
}

function resolveCustomThemeColor(
  customTheme: Record<string, string> | null,
  field: ThemeColorField,
  mode: "light" | "dark",
): string | null {
  if (!customTheme) {
    return null;
  }

  const modeSpecificKey =
    mode === "dark" ? darkOverrideKeys[field] : lightOverrideKeys[field];

  const modeSpecificValue = customTheme[modeSpecificKey];
  if (typeof modeSpecificValue === "string") {
    const normalized = normalizeHexColor(modeSpecificValue);
    if (HEX_COLOR_REGEX.test(normalized)) {
      return normalized;
    }
  }

  const legacyValue = customTheme[field];
  if (typeof legacyValue === "string") {
    const normalized = normalizeHexColor(legacyValue);
    if (HEX_COLOR_REGEX.test(normalized)) {
      return normalized;
    }
  }

  return null;
}

function resolveThemeMode(value: string | null | undefined): ThemeMode {
  if (value === "light" || value === "dark") {
    return value;
  }

  return "system";
}

export function buildThemeVariables(options: {
  activeTheme: ThemeConfigDto | null;
  settings: ThemeSettingsPayload | null;
}): { mode: ThemeMode; variables: Record<string, string> } {
  const { activeTheme, settings } = options;

  const lightPalette: ThemePalette = {
    primaryColor:
      activeTheme?.primaryColor ?? fallbackLightPalette.primaryColor,
    secondaryColor:
      activeTheme?.secondaryColor ?? fallbackLightPalette.secondaryColor,
    accentColor: activeTheme?.accentColor ?? fallbackLightPalette.accentColor,
    backgroundColor:
      activeTheme?.backgroundColor ?? fallbackLightPalette.backgroundColor,
    foregroundColor:
      activeTheme?.foregroundColor ?? fallbackLightPalette.foregroundColor,
  };

  const darkPalette: ThemePalette = {
    primaryColor:
      activeTheme?.darkPrimaryColor ?? fallbackDarkPalette.primaryColor,
    secondaryColor:
      activeTheme?.darkSecondaryColor ?? fallbackDarkPalette.secondaryColor,
    accentColor:
      activeTheme?.darkAccentColor ?? fallbackDarkPalette.accentColor,
    backgroundColor:
      activeTheme?.darkBackgroundColor ?? fallbackDarkPalette.backgroundColor,
    foregroundColor:
      activeTheme?.darkForegroundColor ?? fallbackDarkPalette.foregroundColor,
  };

  const customTheme = settings?.customTheme ?? null;

  const resolvedLight: ThemePalette = {
    primaryColor:
      resolveCustomThemeColor(customTheme, "primaryColor", "light") ??
      lightPalette.primaryColor,
    secondaryColor:
      resolveCustomThemeColor(customTheme, "secondaryColor", "light") ??
      lightPalette.secondaryColor,
    accentColor:
      resolveCustomThemeColor(customTheme, "accentColor", "light") ??
      lightPalette.accentColor,
    backgroundColor:
      resolveCustomThemeColor(customTheme, "backgroundColor", "light") ??
      lightPalette.backgroundColor,
    foregroundColor:
      resolveCustomThemeColor(customTheme, "foregroundColor", "light") ??
      lightPalette.foregroundColor,
  };

  const resolvedDark: ThemePalette = {
    primaryColor:
      resolveCustomThemeColor(customTheme, "primaryColor", "dark") ??
      darkPalette.primaryColor,
    secondaryColor:
      resolveCustomThemeColor(customTheme, "secondaryColor", "dark") ??
      darkPalette.secondaryColor,
    accentColor:
      resolveCustomThemeColor(customTheme, "accentColor", "dark") ??
      darkPalette.accentColor,
    backgroundColor:
      resolveCustomThemeColor(customTheme, "backgroundColor", "dark") ??
      darkPalette.backgroundColor,
    foregroundColor:
      resolveCustomThemeColor(customTheme, "foregroundColor", "dark") ??
      darkPalette.foregroundColor,
  };

  const mode = resolveThemeMode(settings?.themeMode);

  return {
    mode,
    variables: {
      "--theme-light-primary": resolvedLight.primaryColor,
      "--theme-light-secondary": resolvedLight.secondaryColor,
      "--theme-light-accent": resolvedLight.accentColor,
      "--theme-light-background": resolvedLight.backgroundColor,
      "--theme-light-foreground": resolvedLight.foregroundColor,
      "--theme-dark-primary": resolvedDark.primaryColor,
      "--theme-dark-secondary": resolvedDark.secondaryColor,
      "--theme-dark-accent": resolvedDark.accentColor,
      "--theme-dark-background": resolvedDark.backgroundColor,
      "--theme-dark-foreground": resolvedDark.foregroundColor,
      "--brand-font-sans": activeTheme?.fontSans ?? "Inter",
      "--brand-font-heading": activeTheme?.fontHeading ?? "Manrope",
      "--brand-heading-scale": activeTheme?.headingScale ?? "1",
    },
  };
}
