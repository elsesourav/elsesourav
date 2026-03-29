import { describe, expect, it } from "vitest";
import {
  normalizeJsonInput,
  prettyResponseBody,
  toneForStatus,
} from "./client";

describe("admin control client logic", () => {
  it("normalizes valid JSON payload input", () => {
    const result = normalizeJsonInput('{"name":"demo","enabled":true}');

    expect(result.ok).toBe(true);
    if (!result.ok) {
      throw new Error("Expected valid JSON normalization result.");
    }

    expect(result.value).toContain('"name": "demo"');
    expect(result.value).toContain('"enabled": true');
  });

  it("returns error for invalid JSON payload input", () => {
    const result = normalizeJsonInput('{"name":"demo",}');

    expect(result.ok).toBe(false);
    if (result.ok) {
      throw new Error("Expected invalid JSON normalization result.");
    }

    expect(result.error.length).toBeGreaterThan(0);
  });

  it("pretty-prints JSON response bodies and preserves plain text", () => {
    const jsonBody = prettyResponseBody('{"ok":true,"count":2}');
    expect(jsonBody).toContain('"ok": true');
    expect(jsonBody).toContain('"count": 2');

    const plainText = prettyResponseBody("Gateway timeout");
    expect(plainText).toBe("Gateway timeout");
  });

  it("maps HTTP status codes to badge tones", () => {
    expect(toneForStatus(200)).toBe("success");
    expect(toneForStatus(304)).toBe("warning");
    expect(toneForStatus(422)).toBe("danger");
    expect(toneForStatus(0)).toBe("neutral");
  });
});
