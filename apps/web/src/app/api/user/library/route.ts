import { failure, getRequestId } from "@/lib/api-response";
import { requireUserSession } from "@/lib/auth-guard";
import { proxyUserRoute } from "@/lib/route-proxy";
import { proxyToService } from "@/lib/service-client";
import { libraryMutationSchema } from "@elsesourav/validation";

export async function GET(request: Request) {
  return proxyUserRoute(request, {
    service: "user",
    method: "GET",
    path: "/v1/user/library",
  });
}

export async function POST(request: Request) {
  return proxyUserRoute(request, {
    service: "user",
    method: "POST",
    path: "/v1/user/library",
  });
}

export async function DELETE(request: Request) {
  const requestId = getRequestId(request);
  const userResult = await requireUserSession(request);
  if (userResult.response) {
    return userResult.response;
  }

  try {
    const body = await request.json();
    const parsed = libraryMutationSchema.safeParse(body);

    if (!parsed.success) {
      return failure(
        requestId,
        "VALIDATION_ERROR",
        "Invalid library payload.",
        400,
        {
          issues: parsed.error.flatten(),
        },
      );
    }

    const proxyRequest = new Request(request.url, {
      method: "DELETE",
      headers: request.headers,
    });

    return proxyToService({
      request: proxyRequest,
      service: "user",
      method: "DELETE",
      path: `/v1/user/library/${parsed.data.appId}`,
      user: {
        id: userResult.session.user.id,
        role: userResult.session.user.role,
      },
    });
  } catch (error) {
    return failure(
      requestId,
      "INTERNAL_ERROR",
      "Failed to remove bookmark.",
      500,
      {
        reason: error instanceof Error ? error.message : "Unknown error",
      },
    );
  }
}
