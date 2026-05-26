import { failure, getRequestId } from "@/lib/api-response";
import { getServerEnv } from "@elsesourav/config";
import type { ApiFailure, ApiSuccess } from "@elsesourav/types";
import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

export type ServiceName = "auth" | "catalog" | "user" | "content" | "theme";
export type ServiceMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
type ServiceUserContext = {
  id?: string;
  role?: string;
};

type ProxyOptions = {
  request: Request;
  service: ServiceName;
  path: string;
  method?: ServiceMethod;
  user?: ServiceUserContext;
};

type FetchServiceDataOptions = {
  service: ServiceName;
  path: string;
  method?: ServiceMethod;
  user?: ServiceUserContext;
  body?: unknown;
  cache?: RequestCache;
};

function resolveServiceUrl(service: ServiceName): string {
  const env = getServerEnv();

  switch (service) {
    case "auth":
      return env.AUTH_SERVICE_URL ?? "http://localhost:4001";
    case "catalog":
      return env.CATALOG_SERVICE_URL ?? "http://localhost:4002";
    case "user":
      return env.USER_SERVICE_URL ?? "http://localhost:4003";
    case "content":
      return env.CONTENT_SERVICE_URL ?? "http://localhost:4004";
    case "theme":
      return env.THEME_SERVICE_URL ?? "http://localhost:4005";
    default:
      return "";
  }
}

function copyHeaderIfPresent(
  source: Headers,
  target: Headers,
  headerName: string,
) {
  const value = source.get(headerName);
  if (value) {
    target.set(headerName, value);
  }
}

function createInternalHeaders(options: {
  requestId: string;
  internalToken: string;
  user?: ServiceUserContext;
  sourceHeaders?: Headers;
}) {
  const headers = new Headers();
  headers.set("x-request-id", options.requestId);
  headers.set("x-internal-token", options.internalToken);

  if (options.sourceHeaders) {
    copyHeaderIfPresent(options.sourceHeaders, headers, "x-forwarded-for");
    copyHeaderIfPresent(options.sourceHeaders, headers, "x-real-ip");
    copyHeaderIfPresent(options.sourceHeaders, headers, "user-agent");
    copyHeaderIfPresent(options.sourceHeaders, headers, "x-session-id");
  }

  if (options.user?.id) {
    headers.set("x-user-id", options.user.id);
  }

  if (options.user?.role) {
    headers.set("x-user-role", options.user.role);
  }

  return headers;
}

export async function proxyToService(options: ProxyOptions) {
  const { request, service, path } = options;
  let user = options.user;
  
  if (!user) {
    const session = await auth();
    user = session?.user;
  }

  const method = options.method ?? (request.method as ProxyOptions["method"]);
  const requestId = getRequestId(request);

  try {
    const env = getServerEnv();

    if (!env.INTERNAL_SERVICE_TOKEN) {
      return failure(
        requestId,
        "SERVER_MISCONFIGURED",
        "INTERNAL_SERVICE_TOKEN is not configured.",
        500,
      );
    }

    const requestUrl = new URL(request.url);
    const search = requestUrl.search;
    const finalPath = path.includes("?") ? path : `${path}${search}`;
    const targetUrl = `${resolveServiceUrl(service)}${finalPath}`;

    const headers = createInternalHeaders({
      requestId,
      internalToken: env.INTERNAL_SERVICE_TOKEN,
      user,
      sourceHeaders: request.headers,
    });

    const contentType = request.headers.get("content-type");
    if (contentType) {
      headers.set("content-type", contentType);
    }

    let body: string | undefined;
    if (method !== "GET" && method !== "DELETE") {
      const rawBody = await request.text();
      body = rawBody.length > 0 ? rawBody : undefined;
      if (body && !headers.has("content-type")) {
        headers.set("content-type", "application/json");
      }
    }

    const response = await fetch(targetUrl, {
      method,
      headers,
      body,
      cache: "no-store",
    });

    const responseText = await response.text();
    const responseContentType =
      response.headers.get("content-type") ?? "application/json";

    if (!responseText) {
      return new NextResponse(null, { status: response.status });
    }

    if (responseContentType.includes("application/json")) {
      try {
        return NextResponse.json(JSON.parse(responseText), {
          status: response.status,
        });
      } catch {
        return new NextResponse(responseText, {
          status: response.status,
          headers: {
            "content-type": responseContentType,
          },
        });
      }
    }

    return new NextResponse(responseText, {
      status: response.status,
      headers: {
        "content-type": responseContentType,
      },
    });
  } catch (error) {
    return failure(
      requestId,
      "SERVICE_UNAVAILABLE",
      `Failed to reach ${service} service.`,
      503,
      error instanceof Error ? error.message : "Unknown error",
    );
  }
}

function getErrorMessage(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const asFailure = payload as Partial<ApiFailure>;
  if (asFailure.ok === false && asFailure.error?.message) {
    return asFailure.error.message;
  }

  return null;
}

export async function fetchServiceData<T>(
  options: FetchServiceDataOptions,
): Promise<T> {
  const env = getServerEnv();

  if (!env.INTERNAL_SERVICE_TOKEN) {
    throw new Error("INTERNAL_SERVICE_TOKEN is not configured.");
  }

  const method = options.method ?? "GET";
  const targetUrl = `${resolveServiceUrl(options.service)}${options.path}`;
  const headers = createInternalHeaders({
    requestId: randomUUID(),
    internalToken: env.INTERNAL_SERVICE_TOKEN,
    user: options.user,
  });

  let body: string | undefined;
  if (options.body !== undefined) {
    body = JSON.stringify(options.body);
    headers.set("content-type", "application/json");
  }

  const response = await fetch(targetUrl, {
    method,
    headers,
    body,
    cache: options.cache ?? "no-store",
  });

  const text = await response.text();
  let payload: unknown = null;

  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = text;
    }
  }

  if (!response.ok) {
    const reason =
      getErrorMessage(payload) ??
      `Service request failed (${response.status}).`;
    throw new Error(reason);
  }

  if (payload && typeof payload === "object") {
    const maybeSuccess = payload as Partial<ApiSuccess<T>>;
    if (maybeSuccess.ok === true && "data" in maybeSuccess) {
      return maybeSuccess.data as T;
    }
  }

  return payload as T;
}
