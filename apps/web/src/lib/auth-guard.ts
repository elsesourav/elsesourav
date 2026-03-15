import { auth } from "@/auth";
import { failure, getRequestId } from "@/lib/api-response";

export async function requireUserSession(request: Request) {
  const requestId = getRequestId(request);
  const session = await auth();

  if (!session?.user?.id) {
    return {
      requestId,
      session: null,
      response: failure(
        requestId,
        "UNAUTHORIZED",
        "Authentication is required.",
        401,
      ),
    };
  }

  return {
    requestId,
    session,
    response: null,
  };
}

export async function requireAdminSession(request: Request) {
  const userResult = await requireUserSession(request);
  if (userResult.response) {
    return userResult;
  }

  if (userResult.session.user.role !== "ADMIN") {
    return {
      requestId: userResult.requestId,
      session: null,
      response: failure(
        userResult.requestId,
        "FORBIDDEN",
        "Admin access is required.",
        403,
      ),
    };
  }

  return userResult;
}
