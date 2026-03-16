type ThemeMode = "system" | "light" | "dark";

type CustomThemeInput = {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  foregroundColor: string;
};

export type CustomThemeFieldKey = keyof CustomThemeInput;

export const customThemeFieldMeta: Array<{
  key: CustomThemeFieldKey;
  label: string;
  placeholder: string;
  note: string;
}> = [
  {
    key: "primaryColor",
    label: "Primary color",
    placeholder: "#1f2937",
    note: "Main headings and prominent text",
  },
  {
    key: "secondaryColor",
    label: "Secondary color",
    placeholder: "#111827",
    note: "Borders and secondary surfaces",
  },
  {
    key: "accentColor",
    label: "Accent color",
    placeholder: "#f59e0b",
    note: "Call-to-action highlights",
  },
  {
    key: "backgroundColor",
    label: "Background color",
    placeholder: "#ffffff",
    note: "Main background layer",
  },
  {
    key: "foregroundColor",
    label: "Foreground color",
    placeholder: "#171717",
    note: "Body text color",
  },
];

export const themeControlPresets: Array<{
  id: string;
  label: string;
  description: string;
  colors: CustomThemeInput;
}> = [
  {
    id: "clean-slate",
    label: "Clean Slate",
    description: "Neutral light palette",
    colors: {
      primaryColor: "#1f2937",
      secondaryColor: "#111827",
      accentColor: "#0ea5e9",
      backgroundColor: "#f8fafc",
      foregroundColor: "#111827",
    },
  },
  {
    id: "earthy",
    label: "Earthy",
    description: "Warm editorial tones",
    colors: {
      primaryColor: "#3f2e1f",
      secondaryColor: "#2f241c",
      accentColor: "#d97706",
      backgroundColor: "#fff8ec",
      foregroundColor: "#2b2118",
    },
  },
  {
    id: "neo-dark",
    label: "Neo Dark",
    description: "High-contrast dark workspace",
    colors: {
      primaryColor: "#e5e7eb",
      secondaryColor: "#374151",
      accentColor: "#22d3ee",
      backgroundColor: "#0b1220",
      foregroundColor: "#f8fafc",
    },
  },
];

const HEX_COLOR_REGEX = /^#(?:[0-9a-fA-F]{3}){1,2}$/;

const previewFallbackByMode: Record<ThemeMode, CustomThemeInput> = {
  system: {
    primaryColor: "#1f2937",
    secondaryColor: "#111827",
    accentColor: "#f59e0b",
    backgroundColor: "#ffffff",
    foregroundColor: "#171717",
  },
  light: {
    primaryColor: "#1f2937",
    secondaryColor: "#111827",
    accentColor: "#f59e0b",
    backgroundColor: "#ffffff",
    foregroundColor: "#171717",
  },
  dark: {
    primaryColor: "#f8fafc",
    secondaryColor: "#64748b",
    accentColor: "#22d3ee",
    backgroundColor: "#0f172a",
    foregroundColor: "#e2e8f0",
  },
};

function toSixDigitHex(value: string): string {
  const normalized = value.trim().toLowerCase();

  if (!HEX_COLOR_REGEX.test(normalized)) {
    return normalized;
  }

  if (normalized.length === 4) {
    return `#${normalized[1]}${normalized[1]}${normalized[2]}${normalized[2]}${normalized[3]}${normalized[3]}`;
  }

  return normalized;
}

function resolveColor(
  customTheme: CustomThemeInput,
  field: CustomThemeFieldKey,
  mode: ThemeMode,
): string {
  const candidate = customTheme[field].trim();
  if (!HEX_COLOR_REGEX.test(candidate)) {
    return previewFallbackByMode[mode][field];
  }

  return toSixDigitHex(candidate);
}

export type ThemeControlsProps = {
  themeMode: ThemeMode;
  customTheme: CustomThemeInput;
  hasAnyCustomThemeValue: boolean;
  sectionStatusLabel: string;
  sectionStatusTone: "neutral" | "dirty" | "saving";
  sectionFeedbackMessage: string | null;
  sectionFeedbackTone: "success" | "error" | null;
  sectionCanSave: boolean;
  sectionSaving: boolean;
  onThemeModeChange: (mode: ThemeMode) => void;
  onCustomThemeChange: (field: CustomThemeFieldKey, value: string) => void;
  onApplyPreset: (colors: CustomThemeInput) => void;
  onClearTheme: () => void;
  onSaveSection: () => void;
};

const modeButtonClassName =
  "rounded-full border px-3 py-2 text-sm font-medium transition";
const textInputClassName =
  "mt-2 w-full rounded-xl border border-black/20 bg-white px-3 py-2 text-sm text-[#14171f] placeholder:text-[#6d7587]";
const secondaryButtonClassName =
  "rounded-full border border-black/20 bg-white px-4 py-2 text-sm font-medium text-[#14171f] disabled:opacity-60";

export function ThemeControls({
  themeMode,
  customTheme,
  hasAnyCustomThemeValue,
  sectionStatusLabel,
  sectionStatusTone,
  sectionFeedbackMessage,
  sectionFeedbackTone,
  sectionCanSave,
  sectionSaving,
  onThemeModeChange,
  onCustomThemeChange,
  onApplyPreset,
  onClearTheme,
  onSaveSection,
}: ThemeControlsProps) {
  const previewPalette: CustomThemeInput = {
    primaryColor: resolveColor(customTheme, "primaryColor", themeMode),
    secondaryColor: resolveColor(customTheme, "secondaryColor", themeMode),
    accentColor: resolveColor(customTheme, "accentColor", themeMode),
    backgroundColor: resolveColor(customTheme, "backgroundColor", themeMode),
    foregroundColor: resolveColor(customTheme, "foregroundColor", themeMode),
  };

  const sectionStatusClassName =
    sectionStatusTone === "dirty"
      ? "border-[#f2c57c] bg-[#fff7e8] text-[#7a4a00]"
      : sectionStatusTone === "saving"
        ? "border-[#a8c2e6] bg-[#eef5ff] text-[#1e4a80]"
        : "border-black/20 bg-white text-[#4a5262]";
  const sectionFeedbackClassName =
    sectionFeedbackTone === "success"
      ? "text-emerald-700"
      : sectionFeedbackTone === "error"
        ? "text-red-600"
        : "text-[#4a5262]";

  return (
    <section className="rounded-2xl border border-black/15 bg-white p-5 shadow-[0_14px_30px_-24px_rgba(20,23,31,0.65)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[#14171f]">Theme Control</p>
          <p className="text-xs text-[#4a5262]">
            Configure mode, tune color tokens, and preview your palette before
            saving.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`rounded-full border px-3 py-1 text-xs font-medium ${sectionStatusClassName}`}
          >
            {sectionStatusLabel}
          </span>
          <button
            type="button"
            className={secondaryButtonClassName}
            onClick={onSaveSection}
            disabled={!sectionCanSave}
          >
            {sectionSaving ? "Saving..." : "Save theme"}
          </button>
          <button
            type="button"
            className={secondaryButtonClassName}
            onClick={onClearTheme}
            disabled={!hasAnyCustomThemeValue}
          >
            Clear theme
          </button>
        </div>
      </div>

      {sectionFeedbackMessage ? (
        <p className={`mt-2 text-xs ${sectionFeedbackClassName}`}>
          {sectionFeedbackMessage}
        </p>
      ) : null}

      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        {(
          [
            ["system", "System"],
            ["light", "Light"],
            ["dark", "Dark"],
          ] as const
        ).map(([mode, label]) => (
          <button
            key={mode}
            type="button"
            onClick={() => onThemeModeChange(mode)}
            className={`${modeButtonClassName} ${
              themeMode === mode
                ? "border-[#14171f] bg-[#14171f] text-white"
                : "border-black/20 bg-white text-[#14171f] hover:bg-black/3"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-4">
        <p className="text-sm font-medium text-[#14171f]">Presets</p>
        <p className="text-xs text-[#4a5262]">
          Start from a curated palette, then adjust individual tokens.
        </p>

        <div className="mt-2 grid gap-2 sm:grid-cols-3">
          {themeControlPresets.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => onApplyPreset(preset.colors)}
              className="rounded-xl border border-black/20 bg-white px-3 py-2 text-left text-sm text-[#14171f] transition hover:bg-black/3"
            >
              <p className="font-medium">{preset.label}</p>
              <p className="text-xs text-[#4a5262]">{preset.description}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {customThemeFieldMeta.map((field) => {
          const value = customTheme[field.key];
          const trimmed = value.trim();
          const isInvalid =
            trimmed.length > 0 && !HEX_COLOR_REGEX.test(trimmed);
          const pickerValue = resolveColor(customTheme, field.key, themeMode);

          return (
            <label key={field.key} className="text-sm text-[#14171f]">
              {field.label}
              <p className="text-xs text-[#4a5262]">{field.note}</p>

              <div className="mt-2 flex items-center gap-2">
                <input
                  type="color"
                  aria-label={`${field.label} color picker`}
                  value={pickerValue}
                  className="h-10 w-12 rounded-lg border border-black/20 bg-white p-1"
                  onChange={(event) =>
                    onCustomThemeChange(field.key, event.target.value)
                  }
                />
                <input
                  type="text"
                  value={value}
                  placeholder={field.placeholder}
                  className={textInputClassName}
                  onChange={(event) =>
                    onCustomThemeChange(field.key, event.target.value)
                  }
                />
              </div>

              {isInvalid ? (
                <p className="mt-1 text-xs text-red-600">
                  Use hex format like #1f2937.
                </p>
              ) : null}
            </label>
          );
        })}
      </div>

      <div className="mt-5 rounded-xl border border-black/20 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#4a5262]">
          Live Preview
        </p>

        <div
          className="mt-2 rounded-xl border p-4"
          style={{
            backgroundColor: previewPalette.backgroundColor,
            borderColor: previewPalette.secondaryColor,
            color: previewPalette.foregroundColor,
          }}
        >
          <p
            className="text-sm font-semibold"
            style={{ color: previewPalette.primaryColor }}
          >
            Theme Preview Card
          </p>
          <p className="mt-1 text-sm">
            Your selected colors are applied here so you can validate contrast
            and visual tone.
          </p>
          <button
            type="button"
            className="mt-3 rounded-full px-3 py-1.5 text-xs font-medium"
            style={{
              backgroundColor: previewPalette.accentColor,
              color: previewPalette.backgroundColor,
            }}
          >
            Accent Action
          </button>
        </div>
      </div>
    </section>
  );
}

export type { CustomThemeInput, ThemeMode };
