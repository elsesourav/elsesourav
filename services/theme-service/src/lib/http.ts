import type { ApiFailure, ApiSuccess } from "@elsesourav/types";
import { randomUUID } from "crypto";
import type { NextFunction, Request, Response } from "express";

export function attachRequestId(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const requestId = req.header("x-request-id") ?? randomUUID();
  res.locals.requestId = requestId;
  res.setHeader("x-request-id", requestId);
  next();
}

export function getRequestId(res: Response): string {
  return typeof res.locals.requestId === "string"
    ? res.locals.requestId
    : randomUUID();
}

export function sendSuccess<T>(
  res: Response,
  requestId: string,
  data: T,
  status = 200,
) {
  const payload: ApiSuccess<T> = {
    ok: true,
    data,
    requestId,
  };

  return res.status(status).json(payload);
}

export function sendFailure(
  res: Response,
  requestId: string,
  code: string,
  message: string,
  status = 400,
  details?: unknown,
) {
  const payload: ApiFailure = {
    ok: false,
    error: {
      code,
      message,
      details,
    },
    requestId,
  };

  return res.status(status).json(payload);
}
