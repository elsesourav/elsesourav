export function formatCompactCount(value?: number | null): string {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "0";
  }

  return new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export function formatRating(value?: number | string | null): string {
  const numericValue = Number(value ?? 0);

  if (!Number.isFinite(numericValue)) {
    return "0.0";
  }

  return numericValue.toFixed(1);
}

export function pickFirstAvailableUrl(
  primary: string | null | undefined,
  fallback: string,
): string {
  if (primary && primary.trim().length > 0) {
    return primary;
  }

  return fallback;
}
