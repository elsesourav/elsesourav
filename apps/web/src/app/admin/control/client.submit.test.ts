import { describe, expect, it, vi } from "vitest";
import { submitControlRequest } from "./client";

describe("admin control submit request", () => {
  it("returns success result and pretty-prints JSON body", async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        new Response('{"ok":true,"count":2}', { status: 201 }),
      );

    const result = await submitControlRequest({
      endpoint: "/api/admin/theme/configs",
      method: "POST",
      payload: '{"name":"Warm Contrast"}',
      fetchImpl: fetchMock,
      now: () => "2026-03-17T12:00:00.000Z",
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith("/api/admin/theme/configs", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: '{"name":"Warm Contrast"}',
    });

    expect(result.ok).toBe(true);
    expect(result.status).toBe(201);
    expect(result.body).toContain('"ok": true');
    expect(result.body).toContain('"count": 2');
    expect(result.receivedAt).toBe("2026-03-17T12:00:00.000Z");
  });

  it("returns failed result for non-2xx responses", async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        new Response("Validation failed", { status: 422 }),
      );

    const result = await submitControlRequest({
      endpoint: "/api/admin/store/banners",
      method: "POST",
      payload: '{"title":"Bad banner"}',
      fetchImpl: fetchMock,
      now: () => "2026-03-17T12:01:00.000Z",
    });

    expect(result.ok).toBe(false);
    expect(result.status).toBe(422);
    expect(result.body).toBe("Validation failed");
    expect(result.networkError).toBeUndefined();
    expect(result.receivedAt).toBe("2026-03-17T12:01:00.000Z");
  });

  it("returns network error result when fetch throws", async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockRejectedValueOnce(new Error("offline"));

    const result = await submitControlRequest({
      endpoint: "/api/admin/content/pages",
      method: "POST",
      payload: '{"slug":"about"}',
      fetchImpl: fetchMock,
      now: () => "2026-03-17T12:02:00.000Z",
    });

    expect(result.ok).toBe(false);
    expect(result.status).toBe(500);
    expect(result.body).toBe("offline");
    expect(result.networkError).toBe(true);
    expect(result.receivedAt).toBe("2026-03-17T12:02:00.000Z");
  });
});
