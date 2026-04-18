import { POST as postForgotPassword } from "@/app/api/auth/forgot-password/route";
import { POST as postRegister } from "@/app/api/auth/register/route";
import { POST as postResendVerification } from "@/app/api/auth/resend-verification/route";
import { POST as postResetPassword } from "@/app/api/auth/reset-password/route";
import { POST as postVerifyEmail } from "@/app/api/auth/verify-email/route";
import { proxyToService } from "@/lib/service-client";
import { NextResponse } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/service-client", () => ({
  proxyToService: vi.fn(),
}));

const proxyToServiceMock = vi.mocked(proxyToService);

describe("auth route proxies", () => {
  const createOkResponse = () =>
    NextResponse.json({ ok: true }, { status: 200 });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("proxies register POST", async () => {
    const expectedResponse = createOkResponse();
    proxyToServiceMock.mockResolvedValueOnce(expectedResponse);

    const request = new Request("http://localhost/api/auth/register", {
      method: "POST",
    });

    const response = await postRegister(request);

    expect(proxyToServiceMock).toHaveBeenCalledWith({
      request,
      service: "auth",
      method: "POST",
      path: "/v1/auth/register",
    });
    expect(response).toBe(expectedResponse);
  });

  it("proxies forgot-password POST", async () => {
    const expectedResponse = createOkResponse();
    proxyToServiceMock.mockResolvedValueOnce(expectedResponse);

    const request = new Request("http://localhost/api/auth/forgot-password", {
      method: "POST",
    });

    const response = await postForgotPassword(request);

    expect(proxyToServiceMock).toHaveBeenCalledWith({
      request,
      service: "auth",
      method: "POST",
      path: "/v1/auth/forgot-password",
    });
    expect(response).toBe(expectedResponse);
  });

  it("proxies reset-password POST", async () => {
    const expectedResponse = createOkResponse();
    proxyToServiceMock.mockResolvedValueOnce(expectedResponse);

    const request = new Request("http://localhost/api/auth/reset-password", {
      method: "POST",
    });

    const response = await postResetPassword(request);

    expect(proxyToServiceMock).toHaveBeenCalledWith({
      request,
      service: "auth",
      method: "POST",
      path: "/v1/auth/reset-password",
    });
    expect(response).toBe(expectedResponse);
  });

  it("proxies resend-verification POST", async () => {
    const expectedResponse = createOkResponse();
    proxyToServiceMock.mockResolvedValueOnce(expectedResponse);

    const request = new Request(
      "http://localhost/api/auth/resend-verification",
      {
        method: "POST",
      },
    );

    const response = await postResendVerification(request);

    expect(proxyToServiceMock).toHaveBeenCalledWith({
      request,
      service: "auth",
      method: "POST",
      path: "/v1/auth/resend-verification",
    });
    expect(response).toBe(expectedResponse);
  });

  it("proxies verify-email POST", async () => {
    const expectedResponse = createOkResponse();
    proxyToServiceMock.mockResolvedValueOnce(expectedResponse);

    const request = new Request("http://localhost/api/auth/verify-email", {
      method: "POST",
    });

    const response = await postVerifyEmail(request);

    expect(proxyToServiceMock).toHaveBeenCalledWith({
      request,
      service: "auth",
      method: "POST",
      path: "/v1/auth/verify-email",
    });
    expect(response).toBe(expectedResponse);
  });
});
