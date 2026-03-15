import { getServerEnv } from "@elsesourav/config";
import type { NextFunction, Request, Response } from "express";
import { getRequestId, sendFailure } from "./http";

const env = getServerEnv();

export function requireInternalToken(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const requestId = getRequestId(res);
  const expectedToken = env.INTERNAL_SERVICE_TOKEN;

  if (!expectedToken) {
    return sendFailure(
      res,
      requestId,
      "SERVER_MISCONFIGURED",
      "INTERNAL_SERVICE_TOKEN is not configured.",
      500,
    );
  }

  if (req.header("x-internal-token") !== expectedToken) {
    return sendFailure(
      res,
      requestId,
      "FORBIDDEN",
      "Invalid internal token.",
      403,
    );
  }

  return next();
}

export function requireAdminRole(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const requestId = getRequestId(res);
  if (req.header("x-user-role") !== "ADMIN") {
    return sendFailure(
      res,
      requestId,
      "FORBIDDEN",
      "Admin role is required.",
      403,
    );
  }

  return next();
}

export function requireUserId(req: Request, res: Response): string | null {
  const requestId = getRequestId(res);
  const userId = req.header("x-user-id");

  if (!userId) {
    sendFailure(
      res,
      requestId,
      "UNAUTHORIZED",
      "x-user-id header is required.",
      401,
    );
    return null;
  }

  return userId;
}
