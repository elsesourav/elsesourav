import type { ApiFailure, ApiSuccess } from "@elsesourav/types";
import { createHash, randomUUID } from "crypto";
import { NextResponse } from "next/server";

export function getRequestId(request: Request): string {
  return request.headers.get("x-request-id") ?? randomUUID();
}

export function success<T>(requestId: string, data: T, status = 200) {
  const body: ApiSuccess<T> = {
    ok: true,
    data,
    requestId,
  };

  return NextResponse.json(body, { status });
}

export function failure(
  requestId: string,
  code: string,
  message: string,
  status = 400,
  details?: unknown,
) {
  const body: ApiFailure = {
    ok: false,
    error: {
      code,
      message,
      details,
    },
    requestId,
  };

  return NextResponse.json(body, { status });
}

export function hashValue(value: string, secret: string): string {
  return createHash("sha256").update(`${value}:${secret}`).digest("hex");
}
