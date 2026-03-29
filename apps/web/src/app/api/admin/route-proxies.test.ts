import {
  DELETE as deleteAppLinkById,
  PATCH as patchAppLinkById,
} from "@/app/api/admin/apps/[id]/links/[linkId]/route";
import {
  GET as getAppLinks,
  POST as postAppLinks,
} from "@/app/api/admin/apps/[id]/links/route";
import { GET as getAppsStats } from "@/app/api/admin/apps/stats/route";
import { POST as postCategoryRestoreById } from "@/app/api/admin/categories/[id]/restore/route";
import {
  DELETE as deleteCategoryById,
  PUT as putCategoryById,
} from "@/app/api/admin/categories/[id]/route";
import {
  GET as getCategories,
  POST as postCategory,
} from "@/app/api/admin/categories/route";
import { PATCH as patchFeedbackById } from "@/app/api/admin/feedback/[id]/route";
import { GET as getUserStats } from "@/app/api/admin/user/stats/route";
import { GET as getUsersStats } from "@/app/api/admin/users/stats/route";
import { proxyAdminRoute, proxyAdminRouteWithParams } from "@/lib/route-proxy";
import { NextResponse } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/route-proxy", () => ({
  proxyAdminRoute: vi.fn(),
  proxyAdminRouteWithParams: vi.fn(),
}));

const proxyAdminRouteMock = vi.mocked(proxyAdminRoute);
const proxyAdminRouteWithParamsMock = vi.mocked(proxyAdminRouteWithParams);

describe("admin route proxies", () => {
  const createOkResponse = () =>
    NextResponse.json({ ok: true }, { status: 200 });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("proxies apps stats to catalog admin stats endpoint", async () => {
    const expectedResponse = createOkResponse();
    proxyAdminRouteMock.mockResolvedValueOnce(expectedResponse);

    const request = new Request("http://localhost/api/admin/apps/stats");
    const response = await getAppsStats(request);

    expect(proxyAdminRouteMock).toHaveBeenCalledTimes(1);
    expect(proxyAdminRouteMock).toHaveBeenCalledWith(request, {
      service: "catalog",
      method: "GET",
      path: "/v1/admin/catalog/stats",
    });
    expect(response).toBe(expectedResponse);
  });

  it("proxies app links GET to catalog service", async () => {
    const expectedResponse = createOkResponse();
    proxyAdminRouteWithParamsMock.mockResolvedValueOnce(expectedResponse);

    const request = new Request("http://localhost/api/admin/apps/app_1/links");
    const params = Promise.resolve({ id: "app_1" });
    const response = await getAppLinks(request, { params });

    const [calledRequest, calledParams, calledOptions] =
      proxyAdminRouteWithParamsMock.mock.calls[0];

    expect(calledRequest).toBe(request);
    expect(calledParams).toBe(params);
    expect(calledOptions.service).toBe("catalog");
    expect(calledOptions.method).toBe("GET");
    expect(calledOptions.path({ id: "app_123" }, request)).toBe(
      "/v1/admin/catalog/apps/app_123/links",
    );
    expect(response).toBe(expectedResponse);
  });

  it("proxies app links POST to catalog service", async () => {
    const expectedResponse = createOkResponse();
    proxyAdminRouteWithParamsMock.mockResolvedValueOnce(expectedResponse);

    const request = new Request("http://localhost/api/admin/apps/app_1/links", {
      method: "POST",
      body: JSON.stringify({
        platform: "CHROME",
        downloadUrl: "https://example.com",
      }),
      headers: {
        "content-type": "application/json",
      },
    });
    const params = Promise.resolve({ id: "app_1" });
    const response = await postAppLinks(request, { params });

    const [calledRequest, calledParams, calledOptions] =
      proxyAdminRouteWithParamsMock.mock.calls[0];

    expect(calledRequest).toBe(request);
    expect(calledParams).toBe(params);
    expect(calledOptions.service).toBe("catalog");
    expect(calledOptions.method).toBe("POST");
    expect(calledOptions.path({ id: "app_123" }, request)).toBe(
      "/v1/admin/catalog/apps/app_123/links",
    );
    expect(response).toBe(expectedResponse);
  });

  it("proxies app link PATCH by id to catalog service", async () => {
    const expectedResponse = createOkResponse();
    proxyAdminRouteWithParamsMock.mockResolvedValueOnce(expectedResponse);

    const request = new Request(
      "http://localhost/api/admin/apps/app_1/links/link_1",
      {
        method: "PATCH",
        body: JSON.stringify({
          downloadUrl: "https://example.com/new",
        }),
        headers: {
          "content-type": "application/json",
        },
      },
    );
    const params = Promise.resolve({ id: "app_1", linkId: "link_1" });
    const response = await patchAppLinkById(request, { params });

    const [calledRequest, calledParams, calledOptions] =
      proxyAdminRouteWithParamsMock.mock.calls[0];

    expect(calledRequest).toBe(request);
    expect(calledParams).toBe(params);
    expect(calledOptions.service).toBe("catalog");
    expect(calledOptions.method).toBe("PATCH");
    expect(
      calledOptions.path({ id: "app_123", linkId: "link_456" }, request),
    ).toBe("/v1/admin/catalog/apps/app_123/links/link_456");
    expect(response).toBe(expectedResponse);
  });

  it("proxies app link DELETE by id to catalog service", async () => {
    const expectedResponse = createOkResponse();
    proxyAdminRouteWithParamsMock.mockResolvedValueOnce(expectedResponse);

    const request = new Request(
      "http://localhost/api/admin/apps/app_1/links/link_1",
      {
        method: "DELETE",
      },
    );
    const params = Promise.resolve({ id: "app_1", linkId: "link_1" });
    const response = await deleteAppLinkById(request, { params });

    const [calledRequest, calledParams, calledOptions] =
      proxyAdminRouteWithParamsMock.mock.calls[0];

    expect(calledRequest).toBe(request);
    expect(calledParams).toBe(params);
    expect(calledOptions.service).toBe("catalog");
    expect(calledOptions.method).toBe("DELETE");
    expect(
      calledOptions.path({ id: "app_123", linkId: "link_456" }, request),
    ).toBe("/v1/admin/catalog/apps/app_123/links/link_456");
    expect(response).toBe(expectedResponse);
  });

  it("proxies user stats to user admin stats endpoint", async () => {
    const expectedResponse = createOkResponse();
    proxyAdminRouteMock.mockResolvedValueOnce(expectedResponse);

    const request = new Request("http://localhost/api/admin/user/stats");
    const response = await getUserStats(request);

    expect(proxyAdminRouteMock).toHaveBeenCalledTimes(1);
    expect(proxyAdminRouteMock).toHaveBeenCalledWith(request, {
      service: "user",
      method: "GET",
      path: "/v1/admin/user/stats",
    });
    expect(response).toBe(expectedResponse);
  });

  it("proxies users stats to auth admin stats endpoint", async () => {
    const expectedResponse = createOkResponse();
    proxyAdminRouteMock.mockResolvedValueOnce(expectedResponse);

    const request = new Request("http://localhost/api/admin/users/stats");
    const response = await getUsersStats(request);

    expect(proxyAdminRouteMock).toHaveBeenCalledTimes(1);
    expect(proxyAdminRouteMock).toHaveBeenCalledWith(request, {
      service: "auth",
      method: "GET",
      path: "/v1/auth/admin/stats",
    });
    expect(response).toBe(expectedResponse);
  });

  it("proxies feedback-by-id moderation to user service", async () => {
    const expectedResponse = createOkResponse();
    proxyAdminRouteWithParamsMock.mockResolvedValueOnce(expectedResponse);

    const request = new Request("http://localhost/api/admin/feedback/fbk_1", {
      method: "PATCH",
    });
    const params = Promise.resolve({ id: "fbk_1" });

    const response = await patchFeedbackById(request, { params });

    expect(proxyAdminRouteWithParamsMock).toHaveBeenCalledTimes(1);

    const [calledRequest, calledParams, calledOptions] =
      proxyAdminRouteWithParamsMock.mock.calls[0];

    expect(calledRequest).toBe(request);
    expect(calledParams).toBe(params);
    expect(calledOptions.service).toBe("user");
    expect(calledOptions.method).toBe("PATCH");
    expect(calledOptions.path({ id: "feedback_123" }, request)).toBe(
      "/v1/admin/user/feedback/feedback_123",
    );
    expect(response).toBe(expectedResponse);
  });

  it("proxies admin categories GET to catalog service", async () => {
    const expectedResponse = createOkResponse();
    proxyAdminRouteMock.mockResolvedValueOnce(expectedResponse);

    const request = new Request("http://localhost/api/admin/categories");
    const response = await getCategories(request);

    expect(proxyAdminRouteMock).toHaveBeenCalledTimes(1);
    expect(proxyAdminRouteMock).toHaveBeenCalledWith(request, {
      service: "catalog",
      method: "GET",
      path: "/v1/admin/catalog/categories",
    });
    expect(response).toBe(expectedResponse);
  });

  it("proxies admin categories POST to catalog service", async () => {
    const expectedResponse = createOkResponse();
    proxyAdminRouteMock.mockResolvedValueOnce(expectedResponse);

    const request = new Request("http://localhost/api/admin/categories", {
      method: "POST",
      body: JSON.stringify({ name: "Utility" }),
      headers: {
        "content-type": "application/json",
      },
    });
    const response = await postCategory(request);

    expect(proxyAdminRouteMock).toHaveBeenCalledTimes(1);
    expect(proxyAdminRouteMock).toHaveBeenCalledWith(request, {
      service: "catalog",
      method: "POST",
      path: "/v1/admin/catalog/categories",
    });
    expect(response).toBe(expectedResponse);
  });

  it("proxies category-by-id PUT to catalog service", async () => {
    const expectedResponse = createOkResponse();
    proxyAdminRouteWithParamsMock.mockResolvedValueOnce(expectedResponse);

    const request = new Request("http://localhost/api/admin/categories/cat_1", {
      method: "PUT",
      body: JSON.stringify({ name: "Tools" }),
      headers: {
        "content-type": "application/json",
      },
    });
    const params = Promise.resolve({ id: "cat_1" });
    const response = await putCategoryById(request, { params });

    const [calledRequest, calledParams, calledOptions] =
      proxyAdminRouteWithParamsMock.mock.calls[0];

    expect(calledRequest).toBe(request);
    expect(calledParams).toBe(params);
    expect(calledOptions.service).toBe("catalog");
    expect(calledOptions.method).toBe("PUT");
    expect(calledOptions.path({ id: "cat_123" }, request)).toBe(
      "/v1/admin/catalog/categories/cat_123",
    );
    expect(response).toBe(expectedResponse);
  });

  it("proxies category-by-id DELETE to schedule deletion", async () => {
    const expectedResponse = createOkResponse();
    proxyAdminRouteWithParamsMock.mockResolvedValueOnce(expectedResponse);

    const request = new Request("http://localhost/api/admin/categories/cat_1", {
      method: "DELETE",
    });
    const params = Promise.resolve({ id: "cat_1" });
    const response = await deleteCategoryById(request, { params });

    const [calledRequest, calledParams, calledOptions] =
      proxyAdminRouteWithParamsMock.mock.calls[0];

    expect(calledRequest).toBe(request);
    expect(calledParams).toBe(params);
    expect(calledOptions.service).toBe("catalog");
    expect(calledOptions.method).toBe("DELETE");
    expect(calledOptions.path({ id: "cat_123" }, request)).toBe(
      "/v1/admin/catalog/categories/cat_123",
    );
    expect(response).toBe(expectedResponse);
  });

  it("proxies category restore POST to catalog service", async () => {
    const expectedResponse = createOkResponse();
    proxyAdminRouteWithParamsMock.mockResolvedValueOnce(expectedResponse);

    const request = new Request(
      "http://localhost/api/admin/categories/cat_1/restore",
      {
        method: "POST",
      },
    );
    const params = Promise.resolve({ id: "cat_1" });
    const response = await postCategoryRestoreById(request, { params });

    const [calledRequest, calledParams, calledOptions] =
      proxyAdminRouteWithParamsMock.mock.calls[0];

    expect(calledRequest).toBe(request);
    expect(calledParams).toBe(params);
    expect(calledOptions.service).toBe("catalog");
    expect(calledOptions.method).toBe("POST");
    expect(calledOptions.path({ id: "cat_123" }, request)).toBe(
      "/v1/admin/catalog/categories/cat_123/restore",
    );
    expect(response).toBe(expectedResponse);
  });
});
