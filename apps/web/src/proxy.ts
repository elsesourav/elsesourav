import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((request) => {
  const pathname = request.nextUrl.pathname;
  const isApiRequest = pathname.startsWith("/api/");

  if (!request.auth?.user) {
    if (isApiRequest) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Authentication is required.",
          },
        },
        { status: 401 },
      );
    }

    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (request.auth.user.role !== "ADMIN") {
    if (isApiRequest) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "FORBIDDEN",
            message: "Admin access is required.",
          },
        },
        { status: 403 },
      );
    }

    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*", "/api/upload/:path*"],
};
