import {
  DELETE as deleteUserDeletionSchedule,
  GET as getUserDeletionSchedule,
  POST as postUserDeletionSchedule,
} from "@/app/api/user/settings/deletion/route";
import {
  GET as getUserSettings,
  PATCH as patchUserSettings,
} from "@/app/api/user/settings/route";
import { proxyUserRoute } from "@/lib/route-proxy";
import { NextResponse } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/route-proxy", () => ({
  proxyUserRoute: vi.fn(),
}));

const proxyUserRouteMock = vi.mocked(proxyUserRoute);

describe("user route proxies", () => {
  const createOkResponse = () =>
    NextResponse.json({ ok: true }, { status: 200 });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("proxies user settings GET", async () => {
    const expectedResponse = createOkResponse();
    proxyUserRouteMock.mockResolvedValueOnce(expectedResponse);

    const request = new Request("http://localhost/api/user/settings");
    const response = await getUserSettings(request);

    expect(proxyUserRouteMock).toHaveBeenCalledWith(request, {
      service: "user",
      method: "GET",
      path: "/v1/user/settings",
    });
    expect(response).toBe(expectedResponse);
  });

  it("proxies user settings PATCH", async () => {
    const expectedResponse = createOkResponse();
    proxyUserRouteMock.mockResolvedValueOnce(expectedResponse);

    const request = new Request("http://localhost/api/user/settings", {
      method: "PATCH",
      body: JSON.stringify({ themeMode: "dark" }),
      headers: {
        "content-type": "application/json",
      },
    });
    const response = await patchUserSettings(request);

    expect(proxyUserRouteMock).toHaveBeenCalledWith(request, {
      service: "user",
      method: "PATCH",
      path: "/v1/user/settings",
    });
    expect(response).toBe(expectedResponse);
  });

  it("proxies deletion schedule GET", async () => {
    const expectedResponse = createOkResponse();
    proxyUserRouteMock.mockResolvedValueOnce(expectedResponse);

    const request = new Request("http://localhost/api/user/settings/deletion");
    const response = await getUserDeletionSchedule(request);

    expect(proxyUserRouteMock).toHaveBeenCalledWith(request, {
      service: "user",
      method: "GET",
      path: "/v1/user/settings/deletion",
    });
    expect(response).toBe(expectedResponse);
  });

  it("proxies deletion schedule POST", async () => {
    const expectedResponse = createOkResponse();
    proxyUserRouteMock.mockResolvedValueOnce(expectedResponse);

    const request = new Request("http://localhost/api/user/settings/deletion", {
      method: "POST",
      body: JSON.stringify({ confirm: true, delayDays: 14 }),
      headers: {
        "content-type": "application/json",
      },
    });
    const response = await postUserDeletionSchedule(request);

    expect(proxyUserRouteMock).toHaveBeenCalledWith(request, {
      service: "user",
      method: "POST",
      path: "/v1/user/settings/deletion",
    });
    expect(response).toBe(expectedResponse);
  });

  it("proxies deletion schedule DELETE", async () => {
    const expectedResponse = createOkResponse();
    proxyUserRouteMock.mockResolvedValueOnce(expectedResponse);

    const request = new Request("http://localhost/api/user/settings/deletion", {
      method: "DELETE",
    });
    const response = await deleteUserDeletionSchedule(request);

    expect(proxyUserRouteMock).toHaveBeenCalledWith(request, {
      service: "user",
      method: "DELETE",
      path: "/v1/user/settings/deletion",
    });
    expect(response).toBe(expectedResponse);
  });
});
