export type MetadataObject = Record<string, unknown>;

const MAX_METADATA_JSON_LENGTH = 20000;

export function stringifyMetadata(value: unknown): string {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return "";
  }

  try {
    const entries = Object.entries(value as MetadataObject);
    if (entries.length === 0) {
      return "";
    }

    return JSON.stringify(value, null, 2);
  } catch {
    return "";
  }
}

export function parseMetadataInput(rawValue: string): {
  data: MetadataObject | undefined;
  error: string | null;
} {
  const trimmed = rawValue.trim();
  if (!trimmed) {
    return {
      data: undefined,
      error: null,
    };
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(trimmed);
  } catch {
    return {
      data: undefined,
      error: "Metadata must be valid JSON.",
    };
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return {
      data: undefined,
      error: "Metadata must be a JSON object.",
    };
  }

  const asObject = parsed as MetadataObject;

  if (JSON.stringify(asObject).length > MAX_METADATA_JSON_LENGTH) {
    return {
      data: undefined,
      error: "Metadata JSON is too large.",
    };
  }

  return {
    data: asObject,
    error: null,
  };
}
