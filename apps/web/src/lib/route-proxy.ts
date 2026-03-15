import { requireAdminSession, requireUserSession } from "@/lib/auth-guard";
import {
  proxyToService,
  type ServiceMethod,
  type ServiceName,
} from "@/lib/service-client";

type RoutePath = string | ((request: Request) => string);

type RouteProxyOptions = {
  service: ServiceName;
  method: ServiceMethod;
  path: RoutePath;
};

type RouteProxyWithParamsOptions<P extends Record<string, string>> = {
  service: ServiceName;
  method: ServiceMethod;
  path: (params: P, request: Request) => string;
};

function resolvePath(path: RoutePath, request: Request): string {
  return typeof path === "function" ? path(request) : path;
}

export async function proxyAdminRoute(
  request: Request,
  options: RouteProxyOptions,
) {
  const adminResult = await requireAdminSession(request);
  if (adminResult.response) {
    return adminResult.response;
  }

  return proxyToService({
    request,
    service: options.service,
    method: options.method,
    path: resolvePath(options.path, request),
    user: {
      id: adminResult.session.user.id,
      role: adminResult.session.user.role,
    },
  });
}

export async function proxyAdminRouteWithParams<
  P extends Record<string, string>,
>(
  request: Request,
  paramsPromise: Promise<P>,
  options: RouteProxyWithParamsOptions<P>,
) {
  const params = await paramsPromise;

  return proxyAdminRoute(request, {
    service: options.service,
    method: options.method,
    path: options.path(params, request),
  });
}

export async function proxyUserRoute(
  request: Request,
  options: RouteProxyOptions,
) {
  const userResult = await requireUserSession(request);
  if (userResult.response) {
    return userResult.response;
  }

  return proxyToService({
    request,
    service: options.service,
    method: options.method,
    path: resolvePath(options.path, request),
    user: {
      id: userResult.session.user.id,
      role: userResult.session.user.role,
    },
  });
}
